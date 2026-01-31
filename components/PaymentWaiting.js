import { useState, useEffect } from 'react';
import QRCode from "react-qr-code";

export default function PaymentWaiting({ paymentData, onPaymentSuccess, onExpired, onCancel, onFailed, hotelData }) {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [copiedField, setCopiedField] = useState(null); // Track which field was copied
  const [pollingStatus, setPollingStatus] = useState('waiting'); // waiting | checking | success

  // Calculate time remaining until expiry
  useEffect(() => {
    if (!paymentData?.expires_at) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const expiry = new Date(paymentData.expires_at);
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining({ expired: true });
        // Trigger expired callback
        if (onExpired) {
          onExpired();
        }
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds, expired: false });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [paymentData?.expires_at]);

  // Copy to clipboard handler with field tracking
  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Real-time payment status polling - Progressive backoff strategy
  // Starts at 5s, increases to 10s, 20s, then caps at 30s to reduce server load
  useEffect(() => {
    if (!paymentData?.order_id) return;

    let isActive = true;
    let pollCount = 0;
    
    const getNextInterval = (count) => {
      // Progressive intervals: 5s → 10s → 20s → 30s (capped)
      if (count < 3) return 5000;  // First 3 polls: 5 seconds
      if (count < 6) return 10000; // Next 3 polls: 10 seconds
      if (count < 9) return 20000; // Next 3 polls: 20 seconds
      return 30000; // After that: 30 seconds
    };
    
    const checkPaymentStatus = async () => {
      if (!isActive) return;
      
      try {
        setPollingStatus('checking');
        
        // Import API service
        const { EvistaAPI } = await import('@/lib/evista-api');
        const result = await EvistaAPI.checkout.getPaymentDetail(paymentData.order_id);
        
        if (!isActive) return; // Component unmounted during fetch
        
        if (result.code === 200 && result.data) {
          const paymentStatus = result.data.payment_status || result.data.flip_payment_status;
          
          if (paymentStatus === 'paid' || paymentStatus === 'success') {
            // Payment confirmed!
            setPollingStatus('success');
            console.log('[Payment Polling] Payment successful!');
            setTimeout(() => {
              if (isActive && onPaymentSuccess) {
                onPaymentSuccess();
              }
            }, 1000);
          } else if (paymentStatus === 'expired') {
            console.log('[Payment Polling] Payment expired');
            if (isActive && onExpired) {
              onExpired();
            }
          } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
            console.log('[Payment Polling] Payment failed/cancelled');
            if (isActive && onFailed) {
              onFailed();
            }
          } else {
            // Still waiting - schedule next poll with progressive interval
            setPollingStatus('waiting');
            pollCount++;
            const nextInterval = getNextInterval(pollCount);
            console.log(`[Payment Polling] Next check in ${nextInterval/1000}s (poll #${pollCount})`);
            setTimeout(() => {
              if (isActive) checkPaymentStatus();
            }, nextInterval);
          }
        } else {
          setPollingStatus('waiting');
          pollCount++;
          const nextInterval = getNextInterval(pollCount);
          setTimeout(() => {
            if (isActive) checkPaymentStatus();
          }, nextInterval);
        }
      } catch (error) {
        console.error('[Payment Polling] Error:', error);
        setPollingStatus('waiting');
        pollCount++;
        const nextInterval = getNextInterval(pollCount);
        setTimeout(() => {
          if (isActive) checkPaymentStatus();
        }, nextInterval);
      }
    };

    // Initial check (immediate)
    checkPaymentStatus();

    return () => {
      isActive = false;
    };
  }, [paymentData?.order_id, onPaymentSuccess, onExpired, onFailed]);

  if (!paymentData) return null;

  // Virtual Account Display
  if (paymentData.type === 'va') {
    return (
      <div className="max-w-xl mx-auto animate-fadeIn px-2 md:px-0">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-neutral-800">
            Complete Payment
          </h2>
          <p className="text-neutral-500 text-sm md:text-base">
            Please transfer to the Virtual Account below
          </p>
        </div>

        {/* VA Card */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl shadow-blue-900/5 overflow-hidden mb-6 relative">
          {/* Decorative top accent */}
          <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 w-full"></div>
          
          <div className="p-6 md:p-8 space-y-6">
            {/* Bank Info */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-5">
              <div>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Bank</p>
                <p className="text-xl font-bold text-neutral-800">{paymentData.bank}</p>
              </div>
              {paymentData.bank_logo ? (
                 <div className="h-10 px-2 bg-white border border-neutral-100 rounded-lg flex items-center justify-center">
                    <img src={paymentData.bank_logo} alt={paymentData.bank} className="h-6 object-contain" />
                 </div>
              ) : (
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
                   <span className="text-lg">🏦</span>
                </div>
              )}
            </div>

            {/* Order Code */}
            {paymentData.order_code && (
              <div className="flex items-center justify-between bg-neutral-50 rounded-xl p-3 border border-neutral-100">
                <div>
                   <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Order Code</p>
                   <p className="text-sm font-semibold text-neutral-700 font-mono tracking-wide">
                     {paymentData.order_code}
                   </p>
                </div>
                <button
                  onClick={() => handleCopy(paymentData.order_code, 'order_code')}
                  className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Copy Order Code"
                >
                  {copiedField === 'order_code' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  )}
                </button>
              </div>
            )}

            {/* Virtual Account Number */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider text-center">Virtual Account Number</p>
              <div className="bg-blue-50/50 rounded-2xl p-4 md:p-6 border-2 border-dashed border-blue-200 text-center relative group">
                <p className="text-2xl md:text-3xl font-mono font-bold text-blue-700 tracking-widest break-all">
                  {paymentData.va_number}
                </p>
                <div className="mt-3 flex justify-center">
                   <button
                    onClick={() => handleCopy(paymentData.va_number, 'va_number')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-full hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md shadow-blue-600/20"
                  >
                    <span>{copiedField === 'va_number' ? 'Copied!' : 'Copy Number'}</span>
                    {copiedField !== 'va_number' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>}
                  </button>
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="pt-2 text-center">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-3xl md:text-4xl font-black text-neutral-800">
                Rp {paymentData.amount.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        {/* Timer */}
        {timeRemaining && !timeRemaining.expired && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">⏱️</div>
               <div>
                 <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Expires In</p>
                 <p className="text-Amber-600 text-xs">Complete payment before time ends</p>
               </div>
             </div>
             <p className="text-xl md:text-2xl font-mono font-bold text-amber-700 bg-white px-3 py-1 rounded-lg border border-amber-100 shadow-inner">
                {timeRemaining.hours.toString().padStart(2, '0')}:
                {timeRemaining.minutes.toString().padStart(2, '0')}:
                {timeRemaining.seconds.toString().padStart(2, '0')}
             </p>
          </div>
        )}

        {/* Status Indicator */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-full text-sm font-medium transition-all ${
            pollingStatus === 'checking' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'bg-neutral-100 text-neutral-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              pollingStatus === 'checking' ? 'bg-blue-500 animate-pulse' : 'bg-neutral-400'
            }`}></div>
            {pollingStatus === 'checking' ? 'Checking payment status...' : 'Waiting for payment confirmation...'}
          </div>
        </div>
          
        {/* Cancel Payment */}
        {onCancel && (
          <div className="text-center">
            <button
              onClick={onCancel}
              className="text-neutral-400 hover:text-red-500 text-xs font-medium transition-colors flex items-center justify-center gap-2 mx-auto py-2"
            >
              Cancel Transaction
            </button>
          </div>
        )}
      </div>
    );
  }

  // QRIS Display
  if (paymentData.type === 'qris') {
    return (
      <div className="max-w-xl mx-auto animate-fadeIn px-2 md:px-0">
         {/* Header */}
         <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-neutral-800">
            Scan to Pay
          </h2>
          <p className="text-neutral-500 text-sm md:text-base">
            Use any e-wallet or mobile banking app
          </p>
        </div>

        {/* QR Code Card */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-neutral-200 shadow-xl shadow-purple-900/5 mb-6 relative overflow-hidden">
           <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 w-full absolute top-0 left-0"></div>
           
          <div className="flex flex-col items-center mt-4">
            <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-neutral-200 mb-6 shadow-sm">
              {paymentData.qr_code_url ? (
                <div className="p-2 bg-white rounded-xl">
                  <QRCode 
                    value={paymentData.qr_code_url}
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                  />
                </div>
              ) : (
                <div className="w-56 h-56 bg-neutral-50 flex items-center justify-center text-neutral-400 rounded-xl">
                  QR Code Unavailable
                </div>
              )}
            </div>

            <div className="text-center w-full">
              {paymentData.order_code && (
                <div className="mb-6 pb-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50 p-4 rounded-xl">
                    <div className="text-left">
                       <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Order Code</p>
                       <p className="text-sm font-semibold text-neutral-700 font-mono tracking-wide">{paymentData.order_code}</p>
                    </div>
                     <button
                      onClick={() => handleCopy(paymentData.order_code, 'qris_order_code')}
                      className="p-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      {copiedField === 'qris_order_code' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      )}
                    </button>
                </div>
              )}
              
              <div className="pt-2">
                 <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Total Amount</p>
                 <p className="text-3xl md:text-4xl font-black text-neutral-800">
                    Rp {paymentData.amount.toLocaleString('id-ID')}
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timer */}
        {timeRemaining && !timeRemaining.expired && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">⏱️</div>
               <div>
                 <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Expires In</p>
                 <p className="text-Amber-600 text-xs">Complete payment before time ends</p>
               </div>
             </div>
             <p className="text-xl md:text-2xl font-mono font-bold text-amber-700 bg-white px-3 py-1 rounded-lg border border-amber-100 shadow-inner">
                {timeRemaining.minutes.toString().padStart(2, '0')}:
                {timeRemaining.seconds.toString().padStart(2, '0')}
             </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm mb-6">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs">?</span>
            How to Pay
          </h3>
          <ol className="space-y-4">
            {paymentData.instructions?.steps?.map((step, idx) => (
              <li key={idx} className="flex gap-4 group">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-100 text-neutral-500 font-bold text-xs flex items-center justify-center mt-0.5 group-hover:bg-purple-100 group-hover:text-purple-700 transition-colors">
                  {idx + 1}
                </span>
                <span className="text-sm text-neutral-600 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Status Indicator */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-full text-sm font-medium transition-all ${
            pollingStatus === 'checking' ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-200' : 'bg-neutral-100 text-neutral-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              pollingStatus === 'checking' ? 'bg-purple-500 animate-pulse' : 'bg-neutral-400'
            }`}></div>
            {pollingStatus === 'checking' ? 'Checking payment status...' : 'Waiting for payment confirmation...'}
          </div>
        </div>
          
        {/* Cancel Payment */}
        {onCancel && (
          <div className="text-center">
            <button
              onClick={onCancel}
              className="text-neutral-400 hover:text-red-500 text-xs font-medium transition-colors flex items-center justify-center gap-2 mx-auto py-2"
            >
              Cancel Transaction
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
