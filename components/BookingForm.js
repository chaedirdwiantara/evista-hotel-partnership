"use client";

import { useState, useEffect } from "react";
import { EvistaAPI } from "@/lib/evista-api";
import PaymentWaiting from "./PaymentWaiting";
import Step1ServiceSelection from "./booking/Step1ServiceSelection";
import Step2DateTime from "./booking/Step2DateTime";
import Step3PassengerDetails from "./booking/Step3PassengerDetails";
import Step4Payment from "./booking/Step4Payment";

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
    selectedVehicleClass: null,
    isRoundTrip: false,
    rentalDuration: 12,
    
    // Step 2
    pickupDate: "",
    pickupTime: "",
    returnDate: "",
    returnTime: "",
    
    // Step 3
    passengerName: "",
    passengerWhatsApp: "",
    passengerEmail: "",

    // Step 4
    paymentMethod: null,
    termsAccepted: false,
  });

  // Payment state management
  const [paymentState, setPaymentState] = useState({
    status: 'idle', // idle | processing | waiting_payment | success | failed | expired | cancelled
    type: null, // 'instant' | 'va' | 'qris'
    data: null,  // Payment details (VA number, QR code, etc)
    bookingId: null,
    orderId: null,
    errorMessage: null,
    errorDetails: null
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
      setFormError("Please accept the terms to continue.");
      return;
    }

    try {
      // Step 1: Show processing state
      setPaymentState({ ...paymentState, status: 'processing' });
      setLoading(true);
      
      // Mock: Simulate booking creation API call (500ms delay)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const route = hotelData.routes.find(r => r.id === formData.selectedRoute);
      const mockBookingId = 'BK-' + new Date().toISOString().split('T')[0].replace(/-/g, '') + '-' + 
                            Math.random().toString(36).substr(2, 3).toUpperCase();
      const mockOrderId = 'EV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // Step 2: Get selected payment method and detect type from name
      const selectedPayment = paymentOptions.find(p => p.id === formData.paymentMethod);
      
      // Detect payment type from name/description (API uses 'bank' field, not 'name')
      const detectPaymentType = (payment) => {
        if (!payment) return 'instant';
        // API returns: option.bank = "BCA Virtual Account", option.name might not exist
        const bankName = (payment.bank || payment.name || payment.desc || '').toLowerCase();
        
        console.log('Payment detection:', { original: payment.bank, lowercase: bankName }); // Debug log
        
        // QRIS - scan to pay
        if (bankName.includes('qris')) return 'qris';
        
        // Virtual Account - check for VA keywords
        if (bankName.includes('virtual account') || bankName.includes(' va') || bankName.includes('va ')) return 'va';
        
        // Banks that typically use VA (check bank name)
        const vaBanks = ['bca', 'bni', 'mandiri', 'bri', 'cimb', 'danamon', 'bsi', 'maybank', 'bnc'];
        for (const bank of vaBanks) {
          if (bankName.includes(bank)) return 'va';
        }
        
        // Only Permata without "Virtual Account" = instant redirect
        return 'instant';
      };
      
      const paymentType = detectPaymentType(selectedPayment);
      
      // Step 3: Mock payment transaction creation (300ms delay)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 4: Handle different payment types
      if (paymentType === 'instant') {
        // Instant Payment Flow - Show redirect message then success
        setPaymentState({
          status: 'processing',
          type: 'instant',
          data: { redirect_url: '#payment-gateway' },
          bookingId: mockBookingId,
          orderId: mockOrderId
        });
        
        // Mock: Simulate redirect and instant success (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setPaymentState({
          status: 'success',
          type: 'instant',
          data: null,
          bookingId: mockBookingId,
          orderId: mockOrderId
        });
        
      } else if (paymentType === 'va') {
        // Virtual Account Flow - Show VA details and wait
        const mockVANumber = '80123' + Math.floor(Math.random() * 100000000000).toString().padStart(11, '0');
        const expiryDate = new Date();
        expiryDate.setHours(23, 59, 59);
        
        setPaymentState({
          status: 'waiting_payment',
          type: 'va',
          data: {
            type: 'va',
            va_number: mockVANumber,
            bank: selectedPayment?.bank || 'BCA',
            bank_logo: selectedPayment?.image,
            amount: calculatePrice(),
            expires_at: expiryDate.toISOString(),
            instructions: {
              steps: [
                `Login to ${selectedPayment?.bank || 'bank'} mobile/internet banking`,
                'Select "Transfer" menu',
                'Choose "Virtual Account"',
                `Enter VA number: ${mockVANumber}`,
                `Verify amount: Rp ${calculatePrice().toLocaleString('id-ID')}`,
                'Complete transaction'
              ]
            }
          },
          bookingId: mockBookingId,
          orderId: mockOrderId
        });
        
      } else if (paymentType === 'qris') {
        // QRIS Flow - Show QR code and wait
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 60); // 1 hour expiry
        
        setPaymentState({
          status: 'waiting_payment',
          type: 'qris',
          data: {
            type: 'qris',
            qr_code_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzMzMyI+UVIgQ29kZTwvdGV4dD48L3N2Zz4=', // Mock QR code
            amount: calculatePrice(),
            expires_at: expiryDate.toISOString(),
            instructions: {
              steps: [
                'Open your mobile banking or e-wallet app',
                'Select "Scan QR" or "QRIS"',
                'Scan the QR code below',
                `Verify amount: Rp ${calculatePrice().toLocaleString('id-ID')}`,
                'Complete payment'
              ]
            }
          },
          bookingId: mockBookingId,
          orderId: mockOrderId
        });
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error("Payment flow error:", error);
      setFormError(error.message || "Payment processing failed. Please try again.");
      setPaymentState({ ...paymentState, status: 'failed' });
      setLoading(false);
    }
  };

  // Handle payment success callback from PaymentWaiting component
  const handlePaymentSuccess = () => {
    setPaymentState(prev => ({ ...prev, status: 'success' }));
  };

  // Handle payment expired callback
  const handlePaymentExpired = () => {
    setPaymentState(prev => ({ 
      ...prev, 
      status: 'expired',
      errorMessage: 'Your payment session has expired. Please try again.',
      errorDetails: 'Payment must be completed within the allocated time.'
    }));
  };

  // Handle payment cancel callback
  const handlePaymentCancel = () => {
    setPaymentState(prev => ({ 
      ...prev, 
      status: 'cancelled',
      errorMessage: 'Payment was cancelled by user.'
    }));
  };

  // Handle payment failed callback (gateway error after booking created)
  const handlePaymentFailed = (errorInfo) => {
    setPaymentState(prev => ({ 
      ...prev, 
      status: 'failed',
      errorMessage: errorInfo?.message || 'Payment processing failed.',
      errorDetails: errorInfo?.details || 'An error occurred while processing your payment.'
    }));
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
    if (formData.serviceType === "fixPrice" && formData.selectedRoute && formData.selectedVehicleClass) {
      const route = hotelData.routes.find(r => r.id === formData.selectedRoute);
      if (!route || !route.pricing) return 0;
      const pricing = route.pricing[formData.selectedVehicleClass];
      if (!pricing) return 0;
      return formData.isRoundTrip ? pricing.roundTrip : pricing.oneWay;
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

  // Check if Step 1 is complete
  const isStep1Complete = () => {
    if (formData.serviceType === "fixPrice") {
      return formData.selectedRoute && formData.selectedVehicleClass;
    }
    // For rental service, just need to select service type
    return true;
  };

  // Check if Step 2 is complete
  const isStep2Complete = () => {
    // Must have pickup date and time
    if (!formData.pickupDate || !formData.pickupTime) return false;
    
    // If round trip, must have return date AND return time
    if (formData.isRoundTrip) {
      if (!formData.returnDate || !formData.returnTime) return false;
      
      // Return date must be >= pickup date
      if (new Date(formData.returnDate) < new Date(formData.pickupDate)) {
        return false;
      }
    }
    
    // Time must be valid (at least 60 minutes from now)
    return isPickupTimeValid();
  };

  // Check if Step 3 is complete
  const isStep3Complete = () => {
    // Name must be filled
    if (!formData.passengerName.trim()) return false;
    
    // WhatsApp must be filled and valid format
    if (!formData.passengerWhatsApp.trim()) return false;
    
    // Validate international phone number format
    // Allows: +XX, 00XX, or local format with 8-15 digits
    // Supports: spaces, dashes, parentheses for formatting
    const cleanedPhone = formData.passengerWhatsApp.replace(/[\s\-()]/g, '');
    const phoneRegex = /^(\+|00)?[0-9]{8,15}$/;
    
    return phoneRegex.test(cleanedPhone);
  };

  // Check if Step 4 is complete
  const isStep4Complete = () => {
    // Payment method must be selected
    if (!formData.paymentMethod) return false;
    
    // Terms must be accepted
    return formData.termsAccepted;
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
            paymentState={paymentState}
            handlePaymentSuccess={handlePaymentSuccess}
            handlePaymentExpired={handlePaymentExpired}
            handlePaymentCancel={handlePaymentCancel}
            handlePaymentFailed={handlePaymentFailed}
          />
        )}

        {/* Navigation - HIDE if booking is successful or in payment flow */}
        {!formData.bookingSuccess && paymentState.status === 'idle' && (
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
                  disabled={
                    loading || 
                    (currentStep === 1 && !isStep1Complete()) ||
                    (currentStep === 2 && !isStep2Complete()) ||
                    (currentStep === 3 && !isStep3Complete()) ||
                    (currentStep === 4 && !isStep4Complete())
                  }
                  className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
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
