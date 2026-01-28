"use client";

import { useState, useEffect } from "react";
import { EvistaAPI } from "@/lib/evista-api";
import { selectPickupLocation, selectDestination } from "@/lib/manual-destination-api";
import { isUrgentNightBooking, buildUrgentNightMessage, sendWhatsAppMessage, sendAdminAutoNotification } from "@/lib/whatsapp-utils";
import PaymentWaiting from "./PaymentWaiting";
import Step1JourneyBuilder from "./booking/Step1JourneyBuilder";
import Step1RentalSelection from "./booking/Step1RentalSelection";
import Step2PassengerDetails from "./booking/Step3PassengerDetails";
import Step3Payment from "./booking/Step4Payment";

/**
 * Multi-Step Booking Form Component
 * Luxury booking wizard with night reservation logic and WhatsApp integration
 */
export default function BookingForm({ hotelData, bookingType = "airport" }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [formData, setFormData] = useState({
    // Booking Type
    bookingType: bookingType, // "airport" | "rental"
    
    // Step 1 - Airport Transfer
    serviceType: "fixPrice",
    selectedRoute: null,
    selectedVehicleClass: null,
    selectedVehicle: null,
    isRoundTrip: false,
    
    // Step 1 - Rental Specific
    withDriver: true,
    rentalDuration: "6_hours", // Default to 6 hours
    rentalDate: "",
    pickupLocation: "classic_hotel", // Fixed
    returnLocation: "classic_hotel", // Default to same as pickup
    
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
    
    // Order tracking (set in Step 1)
    orderId: null,
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

  // Initialize Step 3 (Payment & Overview)
  useEffect(() => {
    if (currentStep === 3) {
      initializeCheckout();
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

  // Handle Trip Submission (Step 2 -> Step 3 conversion)
  const handleStep2Submit = async () => {
    try {
      setLoading(true);
      console.log('[Step 2] Submitting trip details...');

      const orderType = formData.bookingType === 'rental' ? 'rental' : 'later';
      
      // 1. Prepare Trip Data
      let tripData = {
        order_type: orderType,
        pickup_at: `${formData.pickupDate} ${formData.pickupTime}:00`,
        hotel_slug: hotelData.slug, // Added per user request
      };

      // 2. Handle Fixed Route specific logic (Manual Destination already set pickup/dest in Step 1)
      if (formData.selectedRoute) {
        // Add route_id to payload (from API response via hotelData)
        tripData.route_id = formData.selectedRoute;

        // Set Pickup (Hotel)
        const pickupLocation = {
          lat: hotelData.coordinates?.lat || -6.1680722,
          lng: hotelData.coordinates?.lng || 106.8349,
          label: hotelData.name || 'Classic Hotel',
          address: hotelData.address || 'Jl. K.H. Samanhudi No. 43-45, Pasar Baru, Jakarta Pusat',
        };
        await selectPickupLocation(pickupLocation, orderType);

        // Set Destination (Selected Route)
        const selectedRoute = hotelData.routes?.find(r => r.id === formData.selectedRoute);
        const destinationLocation = {
          lat: selectedRoute.destination?.lat || -6.2382699,
          lng: selectedRoute.destination?.lng || 106.8553428,
          label: selectedRoute.name || 'Destination',
          address: selectedRoute.description || '',
        };
        await selectDestination(destinationLocation, orderType);
      }
      // 3. Handle Manual Destination (Seamless Swap - Manual)
      else if (formData.manualDestination) {
        // Exclude route_id as per user request
        // Destination already selected via manual input
      }

      // 3. Add rental specific fields
      if (formData.bookingType === 'rental') {
        const returnDateTime = `${formData.returnDate} ${formData.returnTime}:00`;
        tripData.return_at = returnDateTime;
        tripData.is_with_driver = formData.withDriver ? 1 : 0;
        tripData.is_same_return_location = formData.returnLocation === formData.pickupLocation ? 1 : 0;
      }

      // 4. Submit Trip (Create/Update Order)
      console.log('[Step 2] Sending trip data:', tripData);
      const tripResponse = await EvistaAPI.trips.submit(tripData);

      if (tripResponse.code !== 200) {
        throw new Error(tripResponse.message || 'Failed to create booking order');
      }

      const orderId = tripResponse.data?.id;
      if (!orderId) throw new Error('No order ID returned from backend');

      console.log('[Step 2] ✅ Order created/updated. ID:', orderId);
      updateFormData('orderId', orderId);

      // 5. Select Car Type (Important for pricing)
      const carTypeId = formData.backendCarData?.id || formData.selectedVehicleClass || 1;
      await EvistaAPI.cars.selectCar(carTypeId, orderType);

      return true;
    } catch (error) {
      console.error('[Step 2] Submission Error:', error);
      setFormError(error.message || 'Failed to process booking details. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Prepare for Step 4 (Checkout Overview)
  const initializeCheckout = async () => {
    if (!formData.orderId) return;
    
    try {
      setLoading(true);
      console.log('[Step 4] Initializing checkout for order:', formData.orderId);
      
      // 1. Get Payment Options
      await loadPaymentOptions();

      // 2. Get Checkout Overview (v3) - Validates order and gets final pricing
      const overview = await EvistaAPI.checkout.getOverview();
      console.log('[Step 4] Checkout Overview:', overview);

      if (overview.code === 200 && overview.data) {
        // Optional: Update local price/data from backend calculation if needed
        // setGrandTotal(overview.data.grand_total); 
      }
    } catch (error) {
      console.error('[Step 4] Overview Error:', error);
      // Don't block, just log. Payment might still work or fail gracefully.
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
      setPaymentState({ ...paymentState, status: 'processing' });
      setLoading(true);
      
      const orderId = formData.orderId;
      if (!orderId) throw new Error('Missing Order ID. Please go back and try again.');

      // Submit Payment (v3)
      const paymentPayload = {
        order_id: orderId,
        ref_payment_methods_id: formData.paymentMethod,
        version: '3.1.0',
      };

      console.log('[Payment] Submitting payment for Order:', orderId);
      const paymentResponse = await EvistaAPI.checkout.submit(paymentPayload);

      if (paymentResponse.code !== 200) {
        throw new Error(paymentResponse.message || 'Payment creation failed');
      }
      
      // ... (Existing payment detail handling remains same below) ...
      
      console.log('[Payment] ✅ Checkout submitted successfully');
      // Step 5: Fetch payment details to get VA/QRIS/redirect info
      const paymentDetail = await EvistaAPI.checkout.getPaymentDetail(orderId);

      if (paymentDetail.code !== 200) {
        throw new Error(paymentDetail.message || 'Failed to fetch payment details');
      }

      const detail = paymentDetail.data;
      const selectedPayment = paymentOptions.find(p => p.id === formData.paymentMethod);

      // Handle Payment Response Types
      if (detail.qrcode_string) {
        setPaymentState({
          status: 'waiting_payment',
          type: 'qris',
          data: {
            type: 'qris',
            qr_code_url: detail.qrcode_string,
            amount: detail.grand_total,
            expires_at: detail.expired_at,
            instructions: detail.cara_pembayaran || [],
            order_code: detail.order_code,
            order_id: detail.id,
          },
          bookingId: detail.order_code,
          orderId: detail.id,
        });
      } else if (detail.virtual_account) {
        setPaymentState({
          status: 'waiting_payment',
          type: 'va',
          data: {
            type: 'va',
            va_number: detail.virtual_account,
            bank: selectedPayment?.bank || 'Bank',
            bank_logo: selectedPayment?.image,
            amount: detail.grand_total,
            expires_at: detail.expired_at,
            instructions: detail.cara_pembayaran || [],
            order_code: detail.order_code,
            order_id: detail.id,
          },
          bookingId: detail.order_code,
          orderId: detail.id,
        });
      } else if (detail.webview_url || detail.flip_link_url) {
        const redirectUrl = detail.webview_url || detail.flip_link_url;
        const fullUrl = redirectUrl.startsWith('http') ? redirectUrl : `https://${redirectUrl}`;
        
        setPaymentState({
          status: 'processing',
          type: 'instant',
          data: { redirect_url: fullUrl },
          bookingId: detail.order_code,
          orderId: detail.id,
        });

        setTimeout(() => {
          window.open(fullUrl, '_blank');
          setPaymentState(prev => ({ 
            ...prev, 
            status: 'waiting_payment',
            data: { ...prev.data, order_code: detail.order_code, order_id: detail.id }
          }));
        }, 1500);
      
      } else if (detail.paymentmethod && (detail.paymentmethod.bank || detail.paymentmethod.account_number)) {
        // Handle case where payment method is detected but specific field (qr/va) might be pending
        const isQris = detail.paymentmethod.bank?.toLowerCase().includes('qris') || 
                       detail.paymentmethod.account_number?.toLowerCase().includes('qris');
        
        setPaymentState({
          status: 'waiting_payment',
          type: isQris ? 'qris' : 'va',
          data: {
            type: isQris ? 'qris' : 'va',
            qr_code_url: detail.qrcode_string || null, // Might be null initially
            va_number: detail.virtual_account || null,
            amount: detail.grand_total,
            expires_at: detail.expired_at,
            instructions: detail.cara_pembayaran || [],
            order_code: detail.order_code,
            order_id: detail.id,
          },
          bookingId: detail.order_code,
          orderId: detail.id,
        });

      } else {
        throw new Error('Invalid payment response: no payment method detected');
      }
      
    } catch (error) {
      console.error("❌ [Payment] Error:", error);
      setFormError(error.message || "Payment processing failed. Please try again.");
      setPaymentState({ 
        status: 'failed',
        errorMessage: error.message,
        errorDetails: error.stack 
      });
    } finally {
       setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentState(prev => ({ ...prev, status: 'success' }));
    
    // Send auto-notification to admin (background, user doesn't see)
    const totalAmount = calculatePrice();
    sendAdminAutoNotification(
      hotelData.contact.whatsapp,
      formData,
      paymentState.bookingId || 'BK-PENDING',
      totalAmount,
      hotelData  // Pass hotelData for route/hotel name lookup
    );
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

  const totalSteps = 3;

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "paymentMethod" || field === "termsAccepted") setFormError(null);
  };

  const nextStep = async () => {
    // Note: Trip submission now happens in Step1JourneyBuilder automatically
    // We only need validation before Step 2 (Passenger Details)
    if (currentStep === 1) {
      // Journey must be submitted (orderId exists)
      if (!formData.orderId) {
        setFormError("Please complete your journey selection first.");
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      const nextStepNum = currentStep + 1;
      setFormError(null);
      setCurrentStep(nextStepNum);

      // Step 3 (Payment) Initialization handled by useEffect now to avoid double calls
    }
  };


  // Validate pickup time is at least 60 minutes from now
  const isPickupTimeValid = () => {
    // Determine which date field to use based on booking type
    const isRental = formData.bookingType === 'rental';
    const dateField = isRental ? 'rentalDate' : 'pickupDate';
    const currentDate = formData[dateField];
    
    if (!formData.pickupTime || !currentDate) return false;
    
    // Calculate minimum time
    const now = new Date();
    const minDateTime = new Date(now.getTime() + 60 * 60 * 1000);
    const minDate = minDateTime.toISOString().split("T")[0];
    
    const selectedDate = new Date(currentDate + "T00:00:00");
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
    // Airport Transfer - Fixed Route pricing
    if (formData.bookingType === "airport" && formData.serviceType === "fixPrice" && formData.selectedRoute && formData.selectedVehicleClass) {
      const route = hotelData.routes.find(r => r.id === formData.selectedRoute);
      if (!route || !route.pricing) return 0;
      const pricing = route.pricing[formData.selectedVehicleClass];
      if (!pricing) return 0;
      return formData.isRoundTrip ? pricing.roundTrip : pricing.oneWay;
    }
    
    // Airport Transfer - Manual Destination pricing
    if (formData.bookingType === "airport" && formData.serviceType === "fixPrice" && formData.manualDestination && formData.backendCarData) {
      // Price comes from backend API response
      return formData.backendCarData.start_from_price || 0;
    }
    
    // Rental pricing
    if (formData.bookingType === "rental" && formData.selectedVehicle && formData.rentalDuration) {
      const { calculateRentalPrice } = require('@/lib/rental-pricing');
      return calculateRentalPrice(formData.selectedVehicle.id, formData.rentalDuration, formData.withDriver);
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
    // For airport bookings with unified journey builder
    if (formData.serviceType === "fixPrice") {
      // Journey is complete when orderId exists (set by Step1JourneyBuilder)
      // and vehicle class is selected
      const hasDestination = formData.selectedRoute || formData.manualDestination;
      const hasVehicle = formData.selectedVehicleClass;
      const hasOrderId = formData.orderId;
      
      return hasDestination && hasVehicle && hasOrderId;
    }
    
    // For rental bookings (still using separate component)
    if (formData.bookingType === "rental") {
      const hasDriver = formData.withDriver === true || formData.withDriver === false;
      const hasDuration = formData.rentalDuration;
      const hasVehicle = formData.selectedVehicle;
      const hasReturnLocation = formData.returnLocation;
      
      return hasDriver && hasDuration && hasVehicle && hasReturnLocation;
    }
    
    return true;
  };

  // Check if Step 2 is complete
  const isStep2Complete = () => {
    // Determine which date field to use based on booking type
    const isRental = formData.bookingType === 'rental';
    const dateField = isRental ? 'rentalDate' : 'pickupDate';
    const currentDate = formData[dateField];
    
    // Must have date and time
    if (!currentDate || !formData.pickupTime) return false;
    
    // If round trip, must have return date AND return time
    if (formData.isRoundTrip) {
      if (!formData.returnDate || !formData.returnTime) return false;
      
      // Return date must be >= pickup/rental date
      if (new Date(formData.returnDate) < new Date(currentDate)) {
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
      <div className="mb-12 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className={`flex items-center ${step === totalSteps ? '' : 'flex-1'}`}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 relative z-10 ${
                  step === currentStep
                    ? "scale-110 shadow-lg ring-4 ring-white"
                    : step < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-neutral-200 text-neutral-500"
                }`}
                style={{
                  backgroundColor: step === currentStep ? hotelData.theme.accentColor : undefined,
                  color: step === currentStep ? hotelData.theme.primaryColor : undefined,
                }}
              >
                {step < currentStep ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              {step < totalSteps && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                    step < currentStep ? "bg-green-500" : "bg-neutral-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold tracking-wide" style={{ color: hotelData.theme.accentColor }}>
            STEP {currentStep} OF {totalSteps}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        {/* Step 1: Unified Journey Builder for Airport */}
        {currentStep === 1 && formData.bookingType === "airport" && (
          <Step1JourneyBuilder formData={formData} updateFormData={updateFormData} hotelData={hotelData} />
        )}
        {currentStep === 1 && formData.bookingType === "rental" && (
          <Step1RentalSelection 
            formData={formData} 
            updateFormData={updateFormData} 
            hotelData={hotelData}
            onContinue={() => setCurrentStep(2)}
          />
        )}
        
        {/* Step 2: Passenger Details (Previously Step 3) */}
        {currentStep === 2 && (
          <Step2PassengerDetails formData={formData} updateFormData={updateFormData} hotelData={hotelData} />
        )}
        
        {/* Step 3: Payment (Previously Step 4) */}
        {currentStep === 3 && (
          <Step3Payment 
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
              <button 
                onClick={currentStep === totalSteps ? handleCheckoutSubmission : nextStep}
                disabled={
                  loading || 
                  (currentStep === 1 && !isStep1Complete()) ||
                  (currentStep === 2 && !isStep3Complete()) ||
                  (currentStep === 3 && !isStep4Complete())
                }
                className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                style={{ backgroundColor: hotelData.theme.accentColor, color: hotelData.theme.primaryColor }}
              >
                {loading ? "Processing..." : (currentStep === totalSteps ? "Complete Booking" : "Continue →")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
