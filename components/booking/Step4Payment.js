"use client";

import PaymentWaiting from "../PaymentWaiting";
import PaymentFailed from "../PaymentFailed";
import { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { isUrgentNightBooking, buildUrgentNightMessage, sendWhatsAppMessage } from '@/lib/whatsapp-utils';

/**
 * Step 4: Payment & Confirmation Component
 * Handles payment method selection and displays payment states
 */
export default function Step4Payment({ formData, updateFormData, calculatePrice, grandTotal, hotelData, paymentOptions, loading, paymentState, handlePaymentSuccess, handlePaymentExpired, handlePaymentCancel, handlePaymentFailed }) {
  // Use backend calculation (grandTotal) if available, otherwise fallback to local
  const totalPrice = grandTotal > 0 ? grandTotal : calculatePrice();

  // Refs and States for Ticket Download
  const ticketRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadTicket = async () => {
    if (!ticketRef.current) return;
    setIsDownloading(true);
    try {
        // give a tiny delay to ensure all styling is painted before capturing
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const dataUrl = await toPng(ticketRef.current, { cacheBust: true, pixelRatio: 2 });
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `EVISTA-Ticket-${paymentState.bookingId || paymentState.orderId}.png`;
        
        // Append to body necessary for Firefox & Mobile Safari sometimes
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        console.error("Error generating ticket image:", err);
        alert(`Gagal mengunduh (System: ${err.message || 'Error internal'}). Silakan screenshot manual resi ini.`);
    } finally {
        setIsDownloading(false);
    }
  };

  const handleShareTicket = async () => {
    const code = paymentState.bookingId || paymentState.orderId;
    const text = `*Evista Booking Confirmed!*\n\nPassenger: ${formData.passengerName}\nOrder Code: *${code}*\n\nPlease show this code to your driver.`;
    
    // Safety check: Web Share API & Clipboard API often fail on non-HTTPS (except localhost)
    const isSecureContext = window.isSecureContext;
    
    // Try native share first (usually works on Mobile Safari/Chrome even if HTTPS requirements are fussy, but better with HTTPS)
    if (navigator.share && isSecureContext) {
        try {
            await navigator.share({
                title: 'Evista E-Ticket',
                text: text,
            });
            return;
        } catch (err) {
            console.log("User cancelled share or share failed", err);
        }
    } 
    
    // Fallback logic
    if (navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(text);
            alert("Teks e-ticket berhasil disalin ke clipboard!");
            return;
        } catch (err) {
            console.error("Clipboard write failed", err);
        }
    }
    
    // Final fallback for HTTP environments (like testing via IP address)
    alert("Koneksi HTTP (bukan HTTPS) membatasi fitur salin/share otomatis. Silakan blok teks order di layar dan salin manual.");
  };

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
      <div className="text-center py-8 md:py-12 animate-fadeIn px-2 md:px-4">
        <div className="text-6xl md:text-8xl mb-6 md:mb-8 mx-auto animate-bounce-slow">🎉</div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4" style={{ color: hotelData.theme.primaryColor }}>
          Booking Confirmed!
        </h2>
        <p className="text-sm md:text-lg text-neutral-600 mb-8 max-w-lg mx-auto leading-relaxed px-2">
          Thank you, <span className="font-semibold text-neutral-800">{formData.passengerName}</span>. Your booking has been successfully processed. 
          Our driver will contact you via WhatsApp shortly.
        </p>
        
        {/* E-Ticket Card Wrapper */}
        <div style={{ maxWidth: '360px', margin: '0 auto', width: '100%', marginBottom: '24px', position: 'relative' }}>
           {/* The actual ticket card we export */}
           <div 
             ref={ticketRef}
             style={{ 
                 backgroundColor: '#ffffff', 
                 borderColor: '#e5e5e5', 
                 borderWidth: '1px', 
                 borderStyle: 'solid',
                 borderRadius: '24px',
                 overflow: 'hidden',
                 position: 'relative',
                 fontFamily: 'Arial, Helvetica, sans-serif'
             }} 
           >
              <div style={{ height: '8px', width: '100%', backgroundColor: '#10b981' }}></div>
              
              {/* Ticket Header */}
              <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ecfdf5', borderBottom: '1px dashed #e5e5e5' }}>
                 <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#064e3b' }}>EVISTA</div>
                 <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#d1fae5', color: '#047857' }}>
                   Confirmed
                 </div>
              </div>

              {/* Main Booking Code Area */}
              <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                 <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', color: '#737373', margin: '0 0 8px 0' }}>Booking Code</p>
                 <p style={{ fontSize: '32px', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '2px', wordBreak: 'break-all', color: '#b45309', textAlign: 'center', margin: 0, lineHeight: 1.2 }}>
                   {paymentState.bookingId || paymentState.orderId}
                 </p>
              </div>
              
              {/* Info Rows */}
              <div style={{ padding: '0 24px 24px 24px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 10 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', paddingBottom: '8px', borderBottom: '1px solid #fafafa' }}>
                   <span style={{ fontWeight: 500, whiteSpace: 'nowrap', color: '#737373' }}>Passenger</span>
                   <span style={{ fontWeight: 700, textAlign: 'right', paddingLeft: '16px', wordBreak: 'break-all', color: '#262626' }}>{formData.passengerName}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '14px', paddingBottom: '8px', borderBottom: '1px solid #fafafa' }}>
                   <span style={{ fontWeight: 500, whiteSpace: 'nowrap', marginTop: '2px', color: '#737373' }}>Service</span>
                   <div style={{ textAlign: 'right' }}>
                     <span style={{ fontWeight: 700, display: 'block', color: '#262626' }}>{formData.serviceType === "fixPrice" ? "Reservation" : "Rental"}</span>
                     <span style={{ fontSize: '11px', fontWeight: 500, display: 'block', marginTop: '2px', color: '#737373' }}>
                       {formData.serviceType === "rental" ? "Daily Rental" : (formData.isRoundTrip ? "Round Trip" : "One-Way")}
                     </span>
                   </div>
                 </div>
                 {formData.selectedVehicle && (
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', paddingBottom: '8px', borderBottom: '1px solid #fafafa' }}>
                       <span style={{ fontWeight: 500, whiteSpace: 'nowrap', color: '#737373' }}>Vehicle</span>
                       <span style={{ fontWeight: 700, textAlign: 'right', paddingLeft: '16px', color: '#262626' }}>
                         {(() => {
                           const vehicle = typeof formData.selectedVehicle === 'object' 
                             ? formData.selectedVehicle
                             : hotelData.fleet.find(v => v.id === formData.selectedVehicle);
                           return vehicle?.name || vehicle?.brand || vehicle?.typename || 'Selected Vehicle';
                         })()}
                       </span>
                     </div>
                 )}
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '14px' }}>
                   <span style={{ fontWeight: 500, whiteSpace: 'nowrap', marginTop: '2px', color: '#737373' }}>Date</span>
                   <div style={{ textAlign: 'right' }}>
                     <span style={{ fontWeight: 700, display: 'block', color: '#262626' }}>
                       {new Date(formData.pickupDate || formData.rentalDate || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                       {' • '}
                       {formData.pickupTime || formData.rentalTime || '00:00'}
                     </span>
                     {formData.isRoundTrip && formData.returnDate && (
                       <span style={{ fontSize: '11px', fontWeight: 500, display: 'block', marginTop: '2px', color: '#737373' }}>
                         Return: {new Date(formData.returnDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                         {' • '}
                         {formData.returnTime || '00:00'}
                       </span>
                     )}
                   </div>
                 </div>
              </div>

              {/* Footer text */}
              <div style={{ padding: '14px', fontSize: '11px', fontWeight: 500, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(250, 250, 250, 0.8)', color: '#737373', borderTop: '1px dashed #e5e5e5' }}>
                <svg style={{ width: '16px', height: '16px', color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Please show this E-Ticket to the driver
              </div>
           </div>
        </div>

        {/* Action Buttons: Save & Share */}
        <div className="max-w-[360px] mx-auto w-full flex gap-2 sm:gap-3 mb-10 px-2 sm:px-0">
            <button 
                onClick={handleDownloadTicket}
                disabled={isDownloading}
                className="flex-1 bg-white border-2 border-neutral-100 hover:border-emerald-500 text-neutral-700 hover:text-emerald-600 font-bold py-3.5 px-1 sm:px-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed group hover:-translate-y-0.5 whitespace-nowrap"
            >
                {isDownloading ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                )}
                <span className="text-xs sm:text-[13px] md:text-sm">Save E-Ticket</span>
            </button>
            <button 
                onClick={handleShareTicket}
                className="flex-1 bg-white border-2 border-neutral-100 hover:border-emerald-500 text-neutral-700 hover:text-emerald-600 font-bold py-3.5 px-1 sm:px-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 sm:gap-2 group hover:-translate-y-0.5 whitespace-nowrap"
            >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span id="share-btn-text" className="text-xs sm:text-[13px] md:text-sm">Share Info</span>
            </button>
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
      {/* Booking Summary Card - Luxury Grid Layout */}
      <div className="bg-neutral-50/50 rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 bg-white/50 backdrop-blur-sm">
          <h3 className="font-bold text-lg flex items-center gap-2 text-neutral-800">
            <span>📝</span> Booking Summary
          </h3>
        </div>

        {/* Content List */}
        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-4 border-b border-neutral-200/50 pb-3 last:border-0 last:pb-0">
            <span className="text-sm text-neutral-500 font-medium uppercase tracking-wide">Service</span>
            <span className="font-bold text-neutral-800 text-lg">
              {formData.serviceType === "fixPrice" ? "Reservation" : "Rental"}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-4 border-b border-neutral-200/50 pb-3">
             <span className="text-sm text-neutral-500 font-medium uppercase tracking-wide">Trip Type</span>
             <span className="font-bold text-neutral-800">
               {formData.serviceType === "rental" 
                  ? "Daily Rental" 
                  : (formData.isRoundTrip ? "Round Trip (PP)" : "One Way Trip")}
             </span>
          </div>

          {formData.rentalDate ? (
            // RENTAL DATE/TIME
             <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-4 border-b border-neutral-200/50 pb-3">
              <span className="text-sm text-neutral-500 font-medium uppercase tracking-wide">Date & Time</span>
              <div className="text-left md:text-right">
                <span className="font-bold text-neutral-800 block">
                  {new Date(formData.rentalDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-sm text-neutral-600">
                   {formData.pickupTime} • {formData.rentalDuration?.replace('_', ' ')}
                </span>
              </div>
            </div>
          ) : (
            // RESERVATION DATE/TIME
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-4 border-b border-neutral-200/50 pb-3">
              <span className="text-sm text-neutral-500 font-medium uppercase tracking-wide">Date & Time</span>
              <div className="text-left md:text-right">
                {formData.pickupDate && (
                  <span className="font-bold text-neutral-800 block">
                    {new Date(formData.pickupDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {formData.pickupTime}
                  </span>
                )}
                {formData.isRoundTrip && formData.returnDate && (
                   <span className="text-xs text-neutral-500 block mt-1">
                     Return: {new Date(formData.returnDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {formData.returnTime}
                   </span>
                )}
              </div>
            </div>
          )}

          {formData.selectedRoute && (
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1 md:gap-4 border-b border-neutral-200/50 pb-3">
              <span className="text-sm text-neutral-500 font-medium uppercase tracking-wide md:pt-1">Route</span>
              <span className="font-bold text-neutral-800 md:text-right md:max-w-[60%] leading-snug">
                {hotelData.routes.find(r => r.id === formData.selectedRoute)?.name}
              </span>
            </div>
          )}

          {formData.selectedVehicle && (
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-4 border-b border-neutral-200/50 pb-3">
              <span className="text-sm text-neutral-500 font-medium uppercase tracking-wide">Vehicle</span>
              <span className="font-bold text-neutral-800 md:text-right">
                {(() => {
                  const vehicle = typeof formData.selectedVehicle === 'object' 
                    ? formData.selectedVehicle
                    : hotelData.fleet.find(v => v.id === formData.selectedVehicle);
                  
                  const name = vehicle?.name || vehicle?.brand || vehicle?.typename || 'Selected Vehicle';
                  const capacity = vehicle?.seats_count || vehicle?.capacity;
                  
                  return capacity ? `${name} • ${capacity} Passengers` : name;
                })()}
              </span>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-4">
            <span className="text-sm text-neutral-500 font-medium uppercase tracking-wide">Passenger</span>
            <span className="font-bold text-neutral-800">{formData.passengerName}</span>
          </div>
        </div>

        {/* Total Price Section - Premium Dark Footer */}
        <div className="p-6 bg-neutral-900 mt-2 text-white">
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <span className="text-neutral-400 text-xs uppercase tracking-widest font-bold">Total Payment</span>
              <p className="text-xs text-neutral-500">Excludes toll fees and parking</p>
            </div>
            <div className="text-right">
               <div className="flex items-baseline justify-end gap-1.5" style={{ color: hotelData.theme.accentColor }}>
                 <span className="text-lg font-medium opacity-80">Rp</span>
                 <span className="text-3xl md:text-4xl font-black tracking-tight">
                   {totalPrice.toLocaleString("id-ID")}
                 </span>
               </div>
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
