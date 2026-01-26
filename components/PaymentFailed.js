"use client";

/**
 * Payment Failed/Error Component
 * Handles all negative payment cases: failed, expired, cancelled
 */
export default function PaymentFailed({ errorType, errorData, onRetry, onCancel, hotelData }) {
  const getErrorContent = () => {
    switch (errorType) {
      case 'expired':
        return {
          icon: '⏰',
          title: 'Payment Time Expired',
          message: 'Your payment session has timed out. Please try booking again with a new payment method.',
          color: 'amber',
          showRetry: true,
          showCancel: true,
          showOrderCode: false
        };
      
      case 'failed':
        return {
          icon: '❌',
          title: 'Payment Failed',
          message: errorData?.message || 'We couldn\'t process your payment. Please try again or use a different payment method.',
          color: 'red',
          showRetry: true,
          showCancel: true,
          showOrderCode: true
        };
      
      case 'cancelled':
        return {
          icon: '🚫',
          title: 'Payment Cancelled',
          message: 'You have cancelled the payment. Your booking has not been confirmed.',
          color: 'neutral',
          showRetry: true,
          showCancel: false,
          showOrderCode: false
        };
      
      default:
        return {
          icon: '⚠️',
          title: 'Something Went Wrong',
          message: 'An unexpected error occurred. Please try again later.',
          color: 'red',
          showRetry: true,
          showCancel: false,
          showOrderCode: true
        };
    }
  };

  const content = getErrorContent();
  
  const colorClasses = {
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      subtext: 'text-amber-700',
      button: 'bg-amber-500 hover:bg-amber-600'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      subtext: 'text-red-700',
      button: 'bg-red-500 hover:bg-red-600'
    },
    neutral: {
      bg: 'bg-neutral-50',
      border: 'border-neutral-200',
      text: 'text-neutral-900',
      subtext: 'text-neutral-700',
      button: 'bg-neutral-500 hover:bg-neutral-600'
    }
  };

  const colors = colorClasses[content.color];

  return (
    <div className="text-center py-12 animate-fadeIn">
      {/* Error Icon */}
      <div className="text-8xl mb-8">{content.icon}</div>
      
      {/* Error Title */}
      <h2 className="text-4xl font-bold mb-4" style={{ color: hotelData.theme.primaryColor }}>
        {content.title}
      </h2>
      
      {/* Error Message */}
      <p className="text-xl text-neutral-600 mb-8 max-w-lg mx-auto">
        {content.message}
      </p>

      {/* Order Code if available and strictly needed */}
      {(errorData?.orderCode || errorData?.orderId) && content.showOrderCode && (
        <div className={`p-6 rounded-2xl mb-8 max-w-md mx-auto border-2 ${colors.bg} ${colors.border}`}>
          <p className={`text-sm uppercase tracking-widest mb-2 font-bold ${colors.subtext}`}>
            Order Code
          </p>
          <p className={`text-2xl font-mono font-bold ${colors.text}`}>
            {errorData.orderCode || errorData.orderId}
          </p>
        </div>
      )}

      {/* Additional Error Details */}
      {errorData?.details && (
        <div className={`p-4 rounded-xl mb-8 max-w-md mx-auto ${colors.bg} border ${colors.border}`}>
          <p className={`text-sm ${colors.subtext}`}>
            {errorData.details}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        {content.showRetry && (
          <button
            onClick={onRetry}
            className="px-8 py-4 rounded-xl font-bold text-white transition-all transform hover:scale-105 shadow-lg"
            style={{ backgroundColor: hotelData.theme.accentColor, color: hotelData.theme.primaryColor }}
          >
            Try Again
          </button>
        )}
      </div>

      {/* Help Text */}
      <p className="text-sm text-neutral-500 mt-8">
        Need help? Contact us via{' '}
        <a
          href={`https://wa.me/${hotelData.contact.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold hover:underline"
          style={{ color: hotelData.theme.accentColor }}
        >
          WhatsApp
        </a>
      </p>
    </div>
  );
}
