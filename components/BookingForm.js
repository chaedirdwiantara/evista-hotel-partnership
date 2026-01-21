"use client";

import { useState, useEffect } from "react";
import { EvistaAPI } from "@/lib/evista-api";
import { selectPickupLocation, selectDestination } from "@/lib/manual-destination-api";
import { isUrgentNightBooking, buildUrgentNightMessage, sendWhatsAppMessage, sendAdminAutoNotification } from "@/lib/whatsapp-utils";
import PaymentWaiting from "./PaymentWaiting";
import Step1ServiceSelection from "./booking/Step1ServiceSelection";
import Step1RentalSelection from "./booking/Step1RentalSelection";
import Step2DateTime from "./booking/Step2DateTime";
import Step3PassengerDetails from "./booking/Step3PassengerDetails";
import Step4Payment from "./booking/Step4Payment";

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
    rentalDuration: null, // "6_hours", "12_hours", etc
    rentalDate: "",
    pickupLocation: "classic_hotel", // Fixed
    returnLocation: null, // "classic_hotel" | "halim_airport"
    
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
      
      let orderId = formData.orderId;
      
      // Step 2: Create order if not exists (for fixed routes that don't go through manual destination)
      if (!orderId) {
        console.log('[Payment] No existing order, creating new order for fixed route...');
        
        const orderType = formData.bookingType === 'rental' ? 'rental' : 'later';
        
        // Step 2.1: Set pickup location (hotel)
        console.log('[Payment] Setting pickup location (hotel)...');
        const pickupLocation = {
          lat: hotelData.coordinates?.lat || -6.1680722,
          lng: hotelData.coordinates?.lng || 106.8349,
          label: hotelData.name || 'Classic Hotel',
          address: hotelData.address || 'Jl. K.H. Samanhudi No. 43-45, Pasar Baru, Jakarta Pusat',
        };
        
        await selectPickupLocation(pickupLocation, orderType);
        console.log('[Payment] Pickup location set successfully');
        
        // Step 2.2: Set destination (from selected route)
        console.log('[Payment] Setting destination...');
        const selectedRoute = hotelData.routes?.find(r => r.id === formData.selectedRoute);
        if (!selectedRoute) {
          throw new Error('Please select a destination route first');
        }
        
        const destinationLocation = {
          lat: selectedRoute.destination?.lat || -6.2382699,
          lng: selectedRoute.destination?.lng || 106.8553428,
          label: selectedRoute.name || 'Destination',
          address: selectedRoute.description || '',
        };
        
        await selectDestination(destinationLocation, orderType);
        console.log('[Payment] Destination set successfully');
        
        // Step 2.3: Combine date and time for pickup_at (Backend requires Y-m-d H:i:s format with seconds!)
        const pickupDateTime = `${formData.pickupDate} ${formData.pickupTime}:00`;
        
        const tripData = {
          order_type: orderType,
          pickup_at: pickupDateTime,
        };
        
        // Add rental-specific fields
        if (formData.bookingType === 'rental') {
          const returnDateTime = `${formData.returnDate} ${formData.returnTime}:00`;
          tripData.return_at = returnDateTime;
          tripData.is_with_driver = formData.withDriver ? 1 : 0;
          tripData.is_same_return_location = formData.returnLocation === formData.pickupLocation ? 1 : 0;
        }
        
        console.log('[Payment] Submitting trip data:', tripData);
        
        const tripResponse = await EvistaAPI.trips.submit(tripData);
        
        console.log('[Payment] 📥 Trip submission response:', tripResponse);
        
        if (tripResponse.code !== 200) {
          throw new Error(tripResponse.message || 'Failed to create booking order');
        }
        
        // Extract order ID from response
        // Backend returns order object directly in .data, not .data.order
        // We need the primary key 'id' field, NOT 'trx_order_id' or 'ordercode'
        orderId = tripResponse.data?.id;
        
        console.log('[Payment] 📦 Response data structure:', {
          hasData: !!tripResponse.data,
          hasId: !!tripResponse.data?.id,
          id: tripResponse.data?.id,
          ordercode: tripResponse.data?.ordercode,
          trx_order_id: tripResponse.data?.trx_order_id,
        });
        
        if (!orderId) {
          console.error('[Payment] ❌ No order ID in response:', tripResponse);
          throw new Error('No order ID returned from trip submission');
        }
        
        console.log('[Payment] ✅ Order created successfully');
        console.log('[Payment] 🔑 Order ID:', orderId, '(type:', typeof orderId, ')');
        console.log('[Payment] 📄 Order Code:', tripResponse.data?.ordercode);
        
        // Step 2.5: Select car type (required for price calculation)
        const carTypeId = formData.backendCarData?.id || 
                          formData.selectedVehicleClass || 
                          1; // Default to economy
        
        console.log('[Payment] Selecting car type:', carTypeId);
        
        const carResponse = await EvistaAPI.cars.selectCar(carTypeId, tripData.order_type);
        
        if (carResponse.code !== 200) {
          console.warn('[Payment] Car selection warning:', carResponse.message);
          // Continue anyway, let payment fail if really needed
        } else {
          console.log('[Payment] Car selected successfully');
        }
      } else {
        console.log('[Payment] Using existing order ID:', orderId);
      }
      
      // CRITICAL: Validate order ID before proceeding to payment
      if (!orderId) {
        const errorMsg = 'Order ID is missing. Cannot proceed to payment.';
        console.error('[Payment] ERROR:', errorMsg);
        console.error('[Payment] Debug Info:', {
          formDataOrderId: formData.orderId,
          tripResponseData: formData.tripResponseData,
          bookingType: formData.bookingType,
        });
        throw new Error(errorMsg);
      }
      
      console.log('[Payment] ✅ Order ID validated:', orderId);
      console.log('[Payment] Order ID type:', typeof orderId);
      
      // Step 3: Get selected payment method for UI display
      const selectedPayment = paymentOptions.find(p => p.id === formData.paymentMethod);
      
      // Step 4: Create payment transaction via backend API
      const paymentPayload = {
        order_id: orderId,
        ref_payment_methods_id: formData.paymentMethod,
        version: '3.1.0',
      };

      console.log('[Payment] 📤 Submitting checkout with payload:', paymentPayload);
      console.log('[Payment] 📤 Order ID being sent:', orderId, '(type:', typeof orderId, ')');
      const paymentResponse = await EvistaAPI.checkout.submitCheckout(paymentPayload);

      if (paymentResponse.code !== 200) {
        console.error('[Payment] ❌ Payment creation failed:', paymentResponse);
        throw new Error(paymentResponse.message || 'Payment creation failed');
      }
      
      console.log('[Payment] ✅ Checkout submitted successfully');

      // Step 5: Fetch payment details to get VA/QRIS/redirect info
      console.log('[Payment] Fetching payment details for order:', orderId);
      const paymentDetail = await EvistaAPI.checkout.getPaymentDetail(orderId);

      if (paymentDetail.code !== 200) {
        throw new Error(paymentDetail.message || 'Failed to fetch payment details');
      }

      const detail = paymentDetail.data;
      console.log('[Payment] Payment detail received:', detail);

      // Step 5: Route to appropriate payment UI based on backend response
      if (detail.qrcode_string) {
        // QRIS Payment - Display QR Code
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
        // Virtual Account Payment - Display VA Number
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
        // Flip WebView/Instant Payment - Redirect to external gateway
        const redirectUrl = detail.webview_url || detail.flip_link_url;
        const fullUrl = redirectUrl.startsWith('http') ? redirectUrl : `https://${redirectUrl}`;
        
        setPaymentState({
          status: 'processing',
          type: 'instant',
          data: { redirect_url: fullUrl },
          bookingId: detail.order_code,
          orderId: detail.id,
        });

        // Auto-redirect to payment gateway
        setTimeout(() => {
          window.open(fullUrl, '_blank');
          // Return to waiting state for payment confirmation
          setPaymentState(prev => ({ 
            ...prev, 
            status: 'waiting_payment',
            data: {
              ...prev.data,
              order_code: detail.order_code,
              order_id: detail.id,
            }
          }));
        }, 1500);

      } else {
        // Unknown payment type from backend
        throw new Error('Invalid payment response: no payment method detected');
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error("❌ [Payment] Checkout error:", error);
      console.error("❌ [Payment] Error details:", {
        message: error.message,
        stack: error.stack,
        orderId: formData.orderId,
        paymentMethod: formData.paymentMethod,
      });
      
      setFormError(error.message || "Payment processing failed. Please try again.");
      setPaymentState({ 
        status: 'failed',
        errorMessage: error.message,
        errorDetails: error.stack 
      });
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
    if (formData.serviceType === "fixPrice") {
      // Check for EITHER fixed route OR manual destination
      const hasFixedRoute = formData.selectedRoute && formData.selectedVehicleClass;
      const hasManualDestination = formData.manualDestination && formData.selectedVehicleClass;
      
      return hasFixedRoute || hasManualDestination;
    }
    
    // For rental bookings
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
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className={`flex items-center ${step === 4 ? '' : 'flex-1'}`}>
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
              {step < 4 && (
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
        {/* Step 1: Service Selection - Conditional based on bookingType */}
        {currentStep === 1 && formData.bookingType === "airport" && (
          <Step1ServiceSelection formData={formData} updateFormData={updateFormData} hotelData={hotelData} />
        )}
        {currentStep === 1 && formData.bookingType === "rental" && (
          <Step1RentalSelection 
            formData={formData} 
            updateFormData={updateFormData} 
            hotelData={hotelData}
            onContinue={() => setCurrentStep(2)}
          />
        )}
        
        {/* Step 2: Date/Time for BOTH Airport and Rental */}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
