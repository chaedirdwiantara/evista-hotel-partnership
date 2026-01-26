"use client";

/**
 * TripTypeSelector Component
 * 
 * Trip type selection (One Way vs Round Trip) using toggle switch UI.
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
      <div className="flex items-center gap-4">
        {/* Toggle Switch */}
        <button
          type="button"
          onClick={() => onTripTypeChange(!isRoundTrip)}
          className="relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            backgroundColor: isRoundTrip ? hotelData.theme.accentColor : '#9CA3AF',
            focusRingColor: hotelData.theme.accentColor
          }}
          aria-label={`Switch to ${isRoundTrip ? 'One Way' : 'Round Trip'}`}
        >
          <span 
            className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out"
            style={{
              transform: isRoundTrip ? 'translateX(28px)' : 'translateX(0)'
            }}
          />
        </button>

        <span 
          className="font-semibold text-neutral-900 transition-all duration-300 min-w-[100px]"
          role="status"
        >
          {isRoundTrip ? 'Round Trip' : 'One Way'}
        </span>
      </div>
    </div>
  );
}
