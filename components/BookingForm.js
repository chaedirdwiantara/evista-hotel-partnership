"use client";

import { useState, useEffect } from "react";
import { EvistaAPI } from "@/lib/evista-api";

/**
 * Multi-Step Booking Form Component
 * Luxury booking wizard with night reservation logic and WhatsApp integration
 */
export default function BookingForm({ hotelData }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [formData, setFormData] = useState({
    // Step 1
    serviceType: "fixPrice",
    selectedRoute: null,
    selectedVehicle: null,
    isRoundTrip: false,
    rentalDuration: 12,
    
    // Step 2
    pickupDate: "",
    pickupTime: "",
    
    // Step 3
    passengerName: "",
    passengerWhatsApp: "",
    passengerEmail: "",
    roomNumber: "",

    // Step 4
    paymentMethod: null,
    termsAccepted: false,
  });

  const [formError, setFormError] = useState(null);

  // Load payment options when reaching Step 4
  useEffect(() => {
    if (currentStep === 4) {
      loadPaymentOptions();
    }
  }, [currentStep]);

  const loadPaymentOptions = async () => {
    try {
      setLoading(true);
      const response = await EvistaAPI.checkout.getPaymentOptions();
      // Filter only active payment methods
      const activeOptions = (response.data || []).filter(opt => opt.is_active === 1);
      setPaymentOptions(activeOptions);
    } catch (error) {
      console.error("Failed to load payment options:", error);
      // No alert here, just show empty/error state in Step4Payment
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutSubmission = async () => {
    setFormError(null);

    if (!formData.paymentMethod) {
      setFormError("Please select a payment method.");
      return;
    }

    if (!formData.termsAccepted) {
      setFormError("Please accept the Terms of Service to continue.");
      return;
    }

    try {
      setLoading(true);
      
      const route = hotelData.routes.find(r => r.id === formData.selectedRoute);
      
      // Submit checkout using Evista API
      const checkoutData = {
        service_type: formData.serviceType,
        route_id: formData.selectedRoute,
        route_name: route?.name,
        pickup_location: route?.pickup,
        destination: route?.destination,
        pickup_date: formData.pickupDate,
        pickup_time: formData.pickupTime,
        is_round_trip: formData.isRoundTrip,
        passenger_name: formData.passengerName,
        passenger_phone: formData.passengerWhatsApp,
        passenger_email: formData.passengerEmail,
        room_number: formData.roomNumber,
        payment_method: formData.paymentMethod,
        total_price: calculatePrice(),
        hotel_slug: hotelData.slug,
      };

      const result = await EvistaAPI.checkout.submitCheckout(checkoutData);
      
      if (result.success !== false || result.data?.order_id) {
        // Success - update form data to show confirmation screen
        setFormData(prev => ({
          ...prev,
          bookingSuccess: true,
          orderId: result.data?.order_id || 'EV-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        }));
        
        // Optional: Open payment URL in new tab if provided
        if (result.data?.payment_url) {
          window.open(result.data.payment_url, "_blank");
        }
      } else {
        throw new Error(result.message || "Checkout failed");
      }
    } catch (error) {
      console.error("Checkout submission failed:", error);
      setFormError(error.message || "Booking failed. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "paymentMethod" || field === "termsAccepted") setFormError(null);
  };

  const nextStep = () => {
    // Validate time on Step 2 before proceeding
    if (currentStep === 2) {
      if (!isPickupTimeValid()) {
        setFormError("Please select a valid pickup time (at least 60 minutes from now).");
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setFormError(null);
      setCurrentStep(current => current + 1);
    }
  };

  // Validate pickup time is at least 60 minutes from now
  const isPickupTimeValid = () => {
    if (!formData.pickupTime || !formData.pickupDate) return false;
    
    // Calculate minimum time
    const now = new Date();
    const minDateTime = new Date(now.getTime() + 60 * 60 * 1000);
    const minDate = minDateTime.toISOString().split("T")[0];
    
    const selectedDate = new Date(formData.pickupDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If selected date is today, check time constraint
    if (selectedDate.getTime() === today.getTime()) {
      const [selectedHour, selectedMin] = formData.pickupTime.split(':').map(Number);
      const minHours = minDateTime.getHours();
      const minMinutes = minDateTime.getMinutes();
      
      const selectedTotalMin = selectedHour * 60 + selectedMin;
      const minTotalMin = minHours * 60 + minMinutes;
      
      return selectedTotalMin >= minTotalMin;
    }
    
    // For future dates, time is always valid
    return true;
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(current => current - 1);
  };

  const isNightReservation = () => {
    if (!formData.pickupTime) return false;
    const hour = parseInt(formData.pickupTime.split(":")[0]);
    return hour >= 0 && hour < 6;
  };

  const calculatePrice = () => {
    if (formData.serviceType === "fixPrice" && formData.selectedRoute) {
      const route = hotelData.routes.find(r => r.id === formData.selectedRoute);
      if (!route) return 0;
      return formData.isRoundTrip ? route.basePrice * 2 : route.basePrice;
    }
    return 0;
  };

  const handleWhatsAppRedirect = () => {
    const route = hotelData.routes.find(r => r.id === formData.selectedRoute);
    const message = encodeURIComponent(
      hotelData.services.nightReservation.whatsappMessage +
      `\n\nDetails:\nRoute: ${route?.name || 'N/A'}\nDate: ${formData.pickupDate}\nTime: ${formData.pickupTime}`
    );
    window.open(`https://wa.me/${hotelData.contact.whatsapp}?text=${message}`, "_blank");
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  step === currentStep
                    ? "scale-110 shadow-lg"
                    : step < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-neutral-200 text-neutral-500"
                }`}
                style={{
                  backgroundColor: step === currentStep ? hotelData.theme.accentColor : undefined,
                  color: step === currentStep ? hotelData.theme.primaryColor : undefined,
                }}
              >
                {step < currentStep ? "✓" : step}
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                    step < currentStep ? "bg-green-500" : "bg-neutral-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color: hotelData.theme.accentColor }}>
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        {currentStep === 1 && (
          <Step1ServiceSelection formData={formData} updateFormData={updateFormData} hotelData={hotelData} />
        )}
        {currentStep === 2 && (
          <Step2DateTime formData={formData} updateFormData={updateFormData} hotelData={hotelData} />
        )}
        {currentStep === 3 && (
          <Step3PassengerDetails formData={formData} updateFormData={updateFormData} hotelData={hotelData} />
        )}
        {currentStep === 4 && (
          <Step4Payment 
            formData={formData}
            updateFormData={updateFormData}
            calculatePrice={calculatePrice}
            hotelData={hotelData}
            paymentOptions={paymentOptions}
            loading={loading}
          />
        )}

        {/* Navigation - HIDE if booking is successful */}
        {!formData.bookingSuccess && (
          <div className="mt-8 pt-8 border-t border-neutral-200">
             {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-shake">
                <div className="text-red-500 text-xl">⚠️</div>
                <p className="text-red-700 font-medium">{formError}</p>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              {currentStep > 1 && (
                <button onClick={prevStep} disabled={loading} className="px-6 py-3 rounded-lg font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-all duration-300 disabled:opacity-50">
                  ← Back
                </button>
              )}
              <div className="flex-1"></div>
              {currentStep === 2 && isNightReservation() ? (
                <button onClick={handleWhatsAppRedirect} className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2" style={{ backgroundColor: "#25D366" }}>
                  <span>📱</span> Book via WhatsApp
                </button>
              ) : (
                <button 
                  onClick={currentStep === totalSteps ? handleCheckoutSubmission : nextStep}
                  disabled={loading}
                  className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50" 
                  style={{ backgroundColor: hotelData.theme.accentColor, color: hotelData.theme.primaryColor }}
                >
                  {loading ? "Processing..." : (currentStep === totalSteps ? "Complete Booking" : "Continue →")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Step1ServiceSelection({ formData, updateFormData, hotelData }) {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-6" style={{ color: hotelData.theme.primaryColor }}>Select Your Service</h2>
      <div className="flex gap-4">
        <button onClick={() => updateFormData("serviceType", "fixPrice")} className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${formData.serviceType === "fixPrice" ? "shadow-lg scale-105" : "bg-neutral-100"}`} style={{ backgroundColor: formData.serviceType === "fixPrice" ? hotelData.theme.accentColor : undefined, color: formData.serviceType === "fixPrice" ? hotelData.theme.primaryColor : "#666" }}>
          ✈️ Airport Transfer
        </button>
        {hotelData.services.rental.enabled && (
          <button onClick={() => updateFormData("serviceType", "rental")} className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${formData.serviceType === "rental" ? "shadow-lg scale-105" : "bg-neutral-100"}`} style={{ backgroundColor: formData.serviceType === "rental" ? hotelData.theme.accentColor : undefined, color: formData.serviceType === "rental" ? hotelData.theme.primaryColor : "#666" }}>
            🚗 Car Rental
          </button>
        )}
      </div>

      {formData.serviceType === "fixPrice" && (
        <div className="space-y-4">
          {hotelData.routes.map((route) => (
            <button key={route.id} onClick={() => updateFormData("selectedRoute", route.id)} className={`w-full p-6 rounded-xl text-left transition-all border-2 ${formData.selectedRoute === route.id ? "shadow-lg scale-[1.02]" : "border-neutral-200"}`} style={{ borderColor: formData.selectedRoute === route.id ? hotelData.theme.accentColor : undefined }}>
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: hotelData.theme.primaryColor }}>{route.name}</h3>
                  <p className="text-sm text-neutral-600">{route.distance} km • {route.estimatedDuration} min</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: hotelData.theme.accentColor }}>Rp {route.basePrice.toLocaleString("id-ID")}</p>
                </div>
              </div>
            </button>
          ))}
          <div className="p-6 bg-neutral-50 rounded-xl">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={formData.isRoundTrip} onChange={(e) => updateFormData("isRoundTrip", e.target.checked)} className="w-5 h-5 rounded" style={{ accentColor: hotelData.theme.accentColor }} />
              <span className="ml-3 font-semibold text-neutral-700">Round Trip (2x Price)</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

function Step2DateTime({ formData, updateFormData, hotelData }) {
  // Calculate minimum date and time (current time + 60 minutes)
  const now = new Date();
  const minDateTime = new Date(now.getTime() + 60 * 60 * 1000); // +60 minutes
  const minDate = minDateTime.toISOString().split("T")[0];
  
  // Calculate minimum time based on selected date
  const getMinTime = () => {
    if (!formData.pickupDate) return "";
    
    const selectedDate = new Date(formData.pickupDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If selected date is today, enforce minimum time (now + 60 min)
    if (selectedDate.getTime() === today.getTime()) {
      const minHours = String(minDateTime.getHours()).padStart(2, '0');
      const minMinutes = String(minDateTime.getMinutes()).padStart(2, '0');
      return `${minHours}:${minMinutes}`;
    }
    
    // For future dates, no time restriction
    return "";
  };

  const isNightTime = () => {
    if (!formData.pickupTime) return false;
    const hour = parseInt(formData.pickupTime.split(":")[0]);
    return hour >= 0 && hour < 6;
  };

  // Validate if selected time is valid
  const isTimeValid = () => {
    if (!formData.pickupTime || !formData.pickupDate) return true;
    
    const minTime = getMinTime();
    if (!minTime) return true; // No restriction for future dates
    
    // Compare selected time with minimum time
    const [selectedHour, selectedMin] = formData.pickupTime.split(':').map(Number);
    const [minHour, minMin] = minTime.split(':').map(Number);
    
    const selectedTotalMin = selectedHour * 60 + selectedMin;
    const minTotalMin = minHour * 60 + minMin;
    
    return selectedTotalMin >= minTotalMin;
  };

  // Handle time change with validation
  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    updateFormData("pickupTime", selectedTime);
  };

  const minTime = getMinTime();
  const timeIsInvalid = !isTimeValid();

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-6" style={{ color: hotelData.theme.primaryColor }}>Choose Date & Time</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">Pickup Date</label>
          <input 
            type="date" 
            min={minDate} 
            value={formData.pickupDate} 
            onChange={(e) => updateFormData("pickupDate", e.target.value)} 
            className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 focus:border-amber-500 focus:outline-none transition-all text-lg" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">Pickup Time</label>
          <input 
            type="time" 
            min={minTime}
            value={formData.pickupTime} 
            onChange={handleTimeChange} 
            className={`w-full px-6 py-4 rounded-xl border-2 focus:outline-none transition-all text-lg ${
              timeIsInvalid 
                ? 'border-red-500 focus:border-red-600 bg-red-50' 
                : 'border-neutral-200 focus:border-amber-500'
            }`}
          />
          {minTime && (
            <p className={`text-xs mt-2 ${timeIsInvalid ? 'text-red-600 font-semibold' : 'text-neutral-500'}`}>
              {timeIsInvalid ? '⚠️ ' : ''}Earliest available: {minTime}
            </p>
          )}
        </div>
      </div>

      {timeIsInvalid && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="font-bold text-red-800 mb-1">Invalid Pickup Time</h3>
              <p className="text-red-700 text-sm">
                Please select a time at least 60 minutes from now. Earliest available time is {minTime}.
              </p>
            </div>
          </div>
        </div>
      )}

      {isNightTime() && (
        <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🌙</div>
            <div>
              <h3 className="font-bold text-amber-800 mb-2">Night Service (00:00 - 06:00)</h3>
              <p className="text-amber-700 text-sm">For night hours, please contact via WhatsApp for manual confirmation.</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="text-3xl">⏰</div>
          <div>
            <h3 className="font-bold text-blue-800 mb-2">Pickup Time Constraint</h3>
            <p className="text-blue-700 text-sm">Pickup time must be at least 1 hour from now.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3PassengerDetails({ formData, updateFormData, hotelData }) {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-6" style={{ color: hotelData.theme.primaryColor }}>Your Information</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">Full Name <span className="text-red-500">*</span></label>
          <input type="text" value={formData.passengerName} onChange={(e) => updateFormData("passengerName", e.target.value)} placeholder="John Doe" className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 focus:border-amber-500 focus:outline-none transition-all text-lg" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">WhatsApp <span className="text-red-500">*</span></label>
          <input type="tel" value={formData.passengerWhatsApp} onChange={(e) => updateFormData("passengerWhatsApp", e.target.value)} placeholder="+62 812 3456 7890" className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 focus:border-amber-500 focus:outline-none transition-all text-lg" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">Email</label>
          <input type="email" value={formData.passengerEmail} onChange={(e) => updateFormData("passengerEmail", e.target.value)} placeholder="john@example.com" className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 focus:border-amber-500 focus:outline-none transition-all text-lg" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">Room Number (Optional)</label>
          <input type="text" value={formData.roomNumber} onChange={(e) => updateFormData("roomNumber", e.target.value)} placeholder="205" className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 focus:border-amber-500 focus:outline-none transition-all text-lg" />
        </div>
      </div>
    </div>
  );
}

function Step4Payment({ formData, updateFormData, calculatePrice, hotelData, paymentOptions, loading }) {
  const totalPrice = calculatePrice();

  // Map payment icons/emojis based on bank name
  const getPaymentIcon = (bankName = "") => {
    const n = bankName.toLowerCase();
    if (n.includes("qris")) return "📱";
    if (n.includes("virtual") || n.includes("va") || n.includes("account")) return "🏦";
    if (n.includes("flip")) return "💳";
    if (n.includes("wallet") || n.includes("ovo") || n.includes("dana")) return "💰";
    return "💵";
  };

  if (formData.bookingSuccess) {
    return (
      <div className="text-center py-12 animate-fadeIn">
        <div className="text-8xl mb-8">🎉</div>
        <h2 className="text-4xl font-bold mb-4" style={{ color: hotelData.theme.primaryColor }}>
          Booking Confirmed!
        </h2>
        <p className="text-xl text-neutral-600 mb-8 max-w-lg mx-auto">
          Thank you, {formData.passengerName}. Your booking has been successfully processed. 
          Our driver will contact you via WhatsApp shortly.
        </p>
        <div className="bg-neutral-50 p-8 rounded-3xl mb-12 max-w-md mx-auto border-2 border-neutral-100">
          <p className="text-sm text-neutral-500 uppercase tracking-widest mb-2 font-bold">Order ID</p>
          <p className="text-3xl font-mono font-bold" style={{ color: hotelData.theme.accentColor }}>
            {formData.orderId}
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-10 py-4 rounded-xl font-bold text-white transition-all transform hover:scale-105"
          style={{ backgroundColor: hotelData.theme.accentColor, color: hotelData.theme.primaryColor }}
        >
          Book Another Ride
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <h2 className="text-3xl font-bold mb-6" style={{ color: hotelData.theme.primaryColor }}>
        Payment & Confirmation
      </h2>
      
      {/* Booking Summary Card */}
      <div className="p-8 bg-neutral-50 rounded-3xl border-2 border-neutral-100 shadow-sm">
        <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
          <span>📝</span> Booking Summary
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b border-neutral-200">
            <span className="text-neutral-600">Service</span>
            <span className="font-semibold">{formData.serviceType === "fixPrice" ? "Airport Transfer" : "Rental"}</span>
          </div>
          {formData.selectedRoute && (
            <div className="flex justify-between py-3 border-b border-neutral-200">
              <span className="text-neutral-600">Route</span>
              <span className="font-semibold text-right">
                {hotelData.routes.find(r => r.id === formData.selectedRoute)?.name}
              </span>
            </div>
          )}
          {formData.isRoundTrip && (
            <div className="flex justify-between py-3 border-b border-neutral-200">
              <span className="text-neutral-600">Trip Type</span>
              <span className="font-semibold">Round Trip (PP)</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-b border-neutral-200">
            <span className="text-neutral-600">Passenger</span>
            <span className="font-semibold">{formData.passengerName}</span>
          </div>
          <div className="flex justify-between items-center py-6 pt-8">
            <span className="text-2xl font-bold" style={{ color: hotelData.theme.primaryColor }}>Total Amount</span>
            <div className="text-right">
              <p className="text-4xl font-black" style={{ color: hotelData.theme.accentColor }}>
                Rp {totalPrice.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-neutral-500 mt-1">Includes all service fees</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-6">
        <h3 className="font-bold text-xl flex items-center gap-3">
          <span>💳</span> Select Payment Method
        </h3>
        
        {loading ? (
          <div className="p-16 bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-200 text-center animate-pulse">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mb-4"></div>
            <p className="text-neutral-600 font-medium text-lg">Loading secure payment options...</p>
          </div>
        ) : paymentOptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => updateFormData("paymentMethod", option.id)}
                className={`p-6 rounded-2xl text-left transition-all duration-300 border-2 flex items-center gap-5 hover:shadow-md ${
                  formData.paymentMethod === option.id
                    ? "shadow-lg scale-[1.02] border-amber-500 bg-amber-50/30"
                    : "border-neutral-200 hover:border-neutral-300 bg-white"
                }`}
                style={{
                  borderColor: formData.paymentMethod === option.id ? hotelData.theme.accentColor : undefined,
                }}
              >
                <div className="bg-white w-20 h-16 rounded-xl flex items-center justify-center shadow-sm border border-neutral-100 overflow-hidden p-2">
                  {option.image ? (
                    <img 
                      src={option.image} 
                      alt={option.bank} 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-3xl">{getPaymentIcon(option.bank)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1" style={{ color: hotelData.theme.primaryColor }}>
                    {option.bank || 'Payment Method'}
                  </h4>
                  <p className="text-xs text-neutral-500 leading-tight">
                    {(() => {
                      const bankName = (option.bank || '').toLowerCase();
                      if (bankName.includes('virtual account') || bankName.includes('va') || bankName.includes('account')) {
                        return 'Transfer via Virtual Account';
                      }
                      if (bankName.includes('qris')) {
                        return 'Scan & Pay with any e-wallet';
                      }
                      if (bankName.includes('flip')) {
                        return 'Instant interbank transfer';
                      }
                      return option.description || 'Secure instant payment';
                    })()}
                  </p>
                </div>
                {formData.paymentMethod === option.id && (
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xl shadow-md animate-scaleIn">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-12 bg-amber-50 rounded-3xl border-2 border-dashed border-amber-200 text-center">
            <div className="text-5xl mb-4">🚧</div>
            <h3 className="text-xl font-bold text-amber-900 mb-2">Service Temporarily Unavailable</h3>
            <p className="text-amber-800 text-sm max-w-sm mx-auto">
              We couldn't load online payment options at this moment. 
              Please try again later or contact our support.
            </p>
          </div>
        )}
      </div>

      {/* Legal & Trust */}
      <div className="flex flex-col gap-4 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={formData.termsAccepted} 
            onChange={(e) => updateFormData("termsAccepted", e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-2 border-blue-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
          />
          <span className="text-sm text-blue-900 group-hover:text-blue-700 transition-colors font-medium">
             I agree to the <strong className="underline decoration-blue-300">Terms of Service</strong> and <strong className="underline decoration-blue-300">Privacy Policy</strong>
          </span>
        </label>
        
        <div className="flex items-start gap-4 pt-4 border-t border-blue-200/50">
          <div className="text-xl mt-1 text-blue-600">🛡️</div>
          <p className="text-xs text-blue-800 leading-relaxed">
            Your payment information is encrypted and processed through our secure partner gateways.
          </p>
        </div>
      </div>
    </div>
  );
}

