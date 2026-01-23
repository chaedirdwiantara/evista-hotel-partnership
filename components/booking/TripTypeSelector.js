"use client";

/**
 * TripTypeSelector Component
 * 
 * Trip type selection (One Way vs Round Trip).
 * Extracted from Step1JourneyBuilder.js (lines 834-892)
 * 
 * @param {Object} props
 * @param {boolean} props.isRoundTrip - Current trip type
 * @param {Function} props.onTripTypeChange - Trip type change handler
 * @param {Object} props.hotelData - Hotel configuration for theme
 */
export default function TripTypeSelector({ isRoundTrip, onTripTypeChange, hotelData }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-neutral-700">Trip Type</h3>
      <div className="bg-neutral-100 p-1.5 rounded-xl flex gap-2">
        <button
          type="button"
          onClick={() => onTripTypeChange(false)}
          className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all duration-300 relative ${
            !isRoundTrip 
              ? "bg-white shadow-md text-neutral-900" 
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              !isRoundTrip ? "border-transparent" : "border-neutral-400"
            }`}
            style={{ 
              backgroundColor: !isRoundTrip ? hotelData.theme.accentColor : "transparent",
              borderColor: !isRoundTrip ? hotelData.theme.accentColor : undefined
            }}
            >
              {!isRoundTrip && (
                <div className="w-2 h-2 rounded-full bg-white animate-scaleIn"></div>
              )}
            </div>
            <span>One Way</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onTripTypeChange(true)}
          className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all duration-300 relative ${
            isRoundTrip 
              ? "bg-white shadow-md text-neutral-900" 
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              isRoundTrip ? "border-transparent" : "border-neutral-400"
            }`}
            style={{ 
              backgroundColor: isRoundTrip ? hotelData.theme.accentColor : "transparent",
              borderColor: isRoundTrip ? hotelData.theme.accentColor : undefined
            }}
            >
              {isRoundTrip && (
                <div className="w-2 h-2 rounded-full bg-white animate-scaleIn"></div>
              )}
            </div>
            <span>Round Trip</span>
          </div>
        </button>
      </div>
    </div>
  );
}
