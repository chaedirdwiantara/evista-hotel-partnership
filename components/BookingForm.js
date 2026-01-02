"use client";

import { useState } from "react";

/**
 * Multi-Step Booking Form Component
 * Luxury booking wizard with night reservation logic and WhatsApp integration
 */
export default function BookingForm({ hotelData }) {
  const [currentStep, setCurrentStep] = useState(1);
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
  });

  const totalSteps = 4;

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(current => current + 1);
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
          <Step4Payment formData={formData} calculatePrice={calculatePrice} hotelData={hotelData} />
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-8 border-t border-neutral-200">
          {currentStep > 1 && (
            <button onClick={prevStep} className="px-6 py-3 rounded-lg font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-all duration-300">
              ← Back
            </button>
          )}
          <div className="flex-1"></div>
          {currentStep === 2 && isNightReservation() ? (
            <button onClick={handleWhatsAppRedirect} className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2" style={{ backgroundColor: "#25D366" }}>
              <span>📱</span> Book via WhatsApp
            </button>
          ) : (
            <button onClick={nextStep} disabled={currentStep === totalSteps} className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50" style={{ backgroundColor: hotelData.theme.accentColor, color: hotelData.theme.primaryColor }}>
              {currentStep === totalSteps ? "Complete Booking" : "Continue →"}
            </button>
          )}
        </div>
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
  const minDateTime = new Date();
  minDateTime.setHours(minDateTime.getHours() + 1);
  const minDate = minDateTime.toISOString().split("T")[0];

  const isNightTime = () => {
    if (!formData.pickupTime) return false;
    const hour = parseInt(formData.pickupTime.split(":")[0]);
    return hour >= 0 && hour < 6;
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-6" style={{ color: hotelData.theme.primaryColor }}>Choose Date & Time</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">Pickup Date</label>
          <input type="date" min={minDate} value={formData.pickupDate} onChange={(e) => updateFormData("pickupDate", e.target.value)} className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 focus:border-amber-500 focus:outline-none transition-all text-lg" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">Pickup Time</label>
          <input type="time" value={formData.pickupTime} onChange={(e) => updateFormData("pickupTime", e.target.value)} className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 focus:border-amber-500 focus:outline-none transition-all text-lg" />
        </div>
      </div>

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

function Step4Payment({ formData, calculatePrice, hotelData }) {
  const totalPrice = calculatePrice();

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-6" style={{ color: hotelData.theme.primaryColor }}>Payment Summary</h2>
      <div className="p-8 bg-neutral-50 rounded-2xl border-2 border-neutral-200">
        <h3 className="font-bold text-xl mb-6">Booking Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between py-3 border-b">
            <span className="text-neutral-600">Service</span>
            <span className="font-semibold">{formData.serviceType === "fixPrice" ? "Airport Transfer" : "Rental"}</span>
          </div>
          {formData.selectedRoute && (
            <div className="flex justify-between py-3 border-b">
              <span className="text-neutral-600">Route</span>
              <span className="font-semibold">{hotelData.routes.find(r => r.id === formData.selectedRoute)?.name}</span>
            </div>
          )}
          <div className="flex justify-between py-4 pt-6">
            <span className="text-xl font-bold">Total</span>
            <span className="text-3xl font-bold" style={{ color: hotelData.theme.accentColor }}>Rp {totalPrice.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>

      <div className="p-8 bg-white rounded-2xl border-2 border-dashed text-center" style={{ borderColor: hotelData.theme.accentColor }}>
        <div className="text-6xl mb-4">💳</div>
        <h3 className="text-2xl font-bold mb-3">Payment Integration Coming Soon</h3>
        <p className="text-neutral-600">Evista API integration will be implemented next.</p>
      </div>
    </div>
  );
}
