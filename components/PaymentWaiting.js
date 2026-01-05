import { useState, useEffect } from 'react';

export default function PaymentWaiting({ paymentData, onPaymentSuccess, hotelData }) {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [copied, setCopied] = useState(false);
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

  // Copy to clipboard handler
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock payment polling - simulates checking payment status every 5s
  useEffect(() => {
    if (!paymentData) return;

    const mockPollInterval = setInterval(() => {
      setPollingStatus('checking');
      
      // Simulate API check with random delay (100-500ms)
      setTimeout(() => {
        setPollingStatus('waiting');
      }, Math.random() * 400 + 100);
    }, 5000);

    // Mock auto-success after 15 seconds
    const mockSuccessTimeout = setTimeout(() => {
      setPollingStatus('success');
      setTimeout(() => {
        onPaymentSuccess?.();
      }, 1000);
    }, 15000);

    return () => {
      clearInterval(mockPollInterval);
      clearTimeout(mockSuccessTimeout);
    };
  }, [paymentData, onPaymentSuccess]);

  if (!paymentData) return null;

  // Virtual Account Display
  if (paymentData.type === 'va') {
    return (
      <div className="max-w-2xl mx-auto animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏦</div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: hotelData.theme.primaryColor }}>
            Complete Your Payment
          </h2>
          <p className="text-neutral-600">
            Transfer to the virtual account number below
          </p>
        </div>

        {/* VA Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl border-2 border-blue-200 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-blue-700 font-semibold mb-1">Bank</p>
              <p className="text-2xl font-bold text-blue-900">{paymentData.bank}</p>
            </div>
            {paymentData.bank_logo && (
              <img src={paymentData.bank_logo} alt={paymentData.bank} className="h-12" />
            )}
          </div>

          <div className="mb-6">
            <p className="text-sm text-blue-700 font-semibold mb-2">Virtual Account Number</p>
            <div className="flex items-center gap-3">
              <p className="text-3xl font-mono font-bold text-blue-900 tracking-wider flex-1">
                {paymentData.va_number}
              </p>
              <button
                onClick={() => handleCopy(paymentData.va_number)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm text-blue-700 font-semibold mb-2">Total Amount</p>
            <p className="text-4xl font-black text-blue-900">
              Rp {paymentData.amount.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Timer */}
        {timeRemaining && !timeRemaining.expired && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">⏱️</div>
              <div className="flex-1">
                <p className="font-bold text-amber-900 mb-1">Payment Expires In</p>
                <p className="text-2xl font-mono font-bold text-amber-700">
                  {timeRemaining.hours.toString().padStart(2, '0')}:
                  {timeRemaining.minutes.toString().padStart(2, '0')}:
                  {timeRemaining.seconds.toString().padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-neutral-50 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-4" style={{ color: hotelData.theme.primaryColor }}>
            Payment Instructions
          </h3>
          <ol className="space-y-3">
            {paymentData.instructions?.steps?.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-neutral-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Status Indicator */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${
            pollingStatus === 'checking' ? 'bg-blue-100 border-2 border-blue-300' : 'bg-neutral-100 border-2 border-neutral-200'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              pollingStatus === 'checking' ? 'bg-blue-500 animate-pulse' : 'bg-neutral-400'
            }`}></div>
            <p className="font-semibold text-neutral-700">
              {pollingStatus === 'checking' ? 'Checking payment status...' : 'Waiting for payment...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // QRIS Display
  if (paymentData.type === 'qris') {
    return (
      <div className="max-w-2xl mx-auto animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: hotelData.theme.primaryColor }}>
            Scan QR Code to Pay
          </h2>
          <p className="text-neutral-600">
            Use any e-wallet or mobile banking app
          </p>
        </div>

        {/* QR Code Card */}
        <div className="bg-white p-8 rounded-3xl border-2 border-neutral-200 shadow-lg mb-6">
          <div className="flex flex-col items-center">
            <div className="bg-white p-6 rounded-2xl border-4 border-neutral-800 mb-6">
              {paymentData.qr_code_url ? (
                <img 
                  src={paymentData.qr_code_url} 
                  alt="QR Code" 
                  className="w-64 h-64"
                />
              ) : (
                <div className="w-64 h-64 bg-neutral-100 flex items-center justify-center text-neutral-400">
                  QR Code
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-neutral-500 font-semibold mb-2">Total Amount</p>
              <p className="text-4xl font-black" style={{ color: hotelData.theme.accentColor }}>
                Rp {paymentData.amount.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        {/* Timer */}
        {timeRemaining && !timeRemaining.expired && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">⏱️</div>
              <div className="flex-1">
                <p className="font-bold text-amber-900 mb-1">QR Code Expires In</p>
                <p className="text-2xl font-mono font-bold text-amber-700">
                  {timeRemaining.minutes.toString().padStart(2, '0')}:
                  {timeRemaining.seconds.toString().padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-neutral-50 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-4" style={{ color: hotelData.theme.primaryColor }}>
            How to Pay
          </h3>
          <ol className="space-y-3">
            {paymentData.instructions?.steps?.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-sm flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-neutral-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Status Indicator */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${
            pollingStatus === 'checking' ? 'bg-purple-100 border-2 border-purple-300' : 'bg-neutral-100 border-2 border-neutral-200'
          }`}>
            <div className={`w-3 h-3 rounded-full ${
              pollingStatus === 'checking' ? 'bg-purple-500 animate-pulse' : 'bg-neutral-400'
            }`}></div>
            <p className="font-semibold text-neutral-700">
              {pollingStatus === 'checking' ? 'Checking payment status...' : 'Waiting for payment...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
