"use client";

import PaymentWaiting from "../PaymentWaiting";
import PaymentFailed from "../PaymentFailed";
import { useState, useEffect } from 'react';
import { isUrgentNightBooking, buildUrgentNightMessage, sendWhatsAppMessage } from '@/lib/whatsapp-utils';

/**
 * Step 4: Payment & Confirmation Component
 * Handles payment method selection and displays payment states
 */
export default function Step4Payment({ formData, updateFormData, calculatePrice, grandTotal, hotelData, paymentOptions, loading, paymentState, handlePaymentSuccess, handlePaymentExpired, handlePaymentCancel, handlePaymentFailed }) {
  // Use backend calculation (grandTotal) if available, otherwise fallback to local
  const totalPrice = grandTotal > 0 ? grandTotal : calculatePrice();

  // Map payment icons/emojis based on bank name
  const getPaymentIcon = (bankName = "") => {
    const n = bankName.toLowerCase();
    if (n.includes("qris")) return "📱";
    if (n.includes("virtual") || n.includes("va") || n.includes("account")) return "🏦";
    if (n.includes("flip")) return "💳";
    if (n.includes("wallet") || n.includes("ovo") || n.includes("dana")) return "💰";
    return "💵";
  };

  // Payment Success State
  if (paymentState?.status === 'success') {
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
          <p className="text-sm text-neutral-500 uppercase tracking-widest mb-2 font-bold">Order Code</p>
          <p className="text-3xl font-mono font-bold" style={{ color: hotelData.theme.accentColor }}>
            {paymentState.bookingId || paymentState.orderId}
          </p>
        </div>
        
        {/* Urgent Night Booking - Manual WhatsApp Contact */}
        {isUrgentNightBooking(formData) && (
          <div className="mb-8 max-w-md mx-auto">
            <div className="p-5 bg-amber-50 border-2 border-amber-200 rounded-2xl mb-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="text-2xl">🌙</div>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-800 mb-1">Night Service Booking</h4>
                  <p className="text-sm text-amber-700">
                    Your booking requires manual driver confirmation for night hours. 
                    Please contact our admin via WhatsApp.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                const message = buildUrgentNightMessage(formData, paymentState.bookingId || paymentState.orderId, hotelData);
                sendWhatsAppMessage(hotelData.contact.whatsapp, message);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Contact Admin via WhatsApp
            </button>
          </div>
        )}
        
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

  // Payment Error States (expired, failed, cancelled)
  if (paymentState?.status === 'expired' || paymentState?.status === 'failed' || paymentState?.status === 'cancelled') {
    return (
      <PaymentFailed
        errorType={paymentState.status}
        errorData={{
          orderCode: paymentState.bookingId || paymentState.orderId,
          message: paymentState.errorMessage,
          details: paymentState.errorDetails
        }}
        onRetry={() => window.location.reload()}
        onCancel={() => window.location.reload()}
        hotelData={hotelData}
      />
    );
  }

  // Waiting for Payment (VA or QRIS)
  if (paymentState?.status === 'waiting_payment' && paymentState?.data) {
    return (
      <PaymentWaiting 
        paymentData={paymentState.data}
        onPaymentSuccess={handlePaymentSuccess}
        onExpired={handlePaymentExpired}
        onCancel={handlePaymentCancel}
        onFailed={handlePaymentFailed}
        hotelData={hotelData}
      />
    );
  }

  // Processing State (Instant Payment redirect message)
  if (paymentState?.status === 'processing' && paymentState?.type === 'instant') {
    return (
      <div className="text-center py-16 animate-fadeIn">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mb-8"></div>
        <h2 className="text-3xl font-bold mb-4" style={{ color: hotelData.theme.primaryColor }}>
          Redirecting to Payment Gateway
        </h2>
        <p className="text-neutral-600 max-w-md mx-auto">
          Please wait while we redirect you to our secure payment partner...
        </p>
      </div>
    );
  }

  // Default: Show Payment Selection Form (idle state)
  return (
    <div className="space-y-10">
      <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: hotelData.theme.primaryColor }}>
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
            <span className="font-semibold">{formData.serviceType === "fixPrice" ? "Reservation" : "Rental"}</span>
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
          {formData.selectedVehicle && (
            <div className="flex justify-between py-3 border-b border-neutral-200">
              <span className="text-neutral-600">Vehicle</span>
              <span className="font-semibold text-right">
                {hotelData.fleet.find(v => v.id === formData.selectedVehicle)?.name || 'Selected Vehicle'}
              </span>
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
              <p className="text-xs text-neutral-500 mt-1">Excludes toll fees and parking</p>
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
                  <div 
                    className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xl shadow-md animate-scaleIn"
                    style={{ backgroundColor: hotelData.theme.accentColor }}
                  >
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
             I understand that <strong>toll fees and parking charges are not included</strong> in the price and will be paid separately during the trip
          </span>
        </label>
        
        <div className="flex items-start gap-4 pt-4 border-t border-blue-200/50">
          <div className="text-xl -mt-0.5 text-blue-600">🛡️</div>
          <p className="text-xs text-blue-800 leading-relaxed">
            Your payment information is encrypted and processed through our secure partner gateways.
          </p>
        </div>
      </div>
    </div>
  );
}
