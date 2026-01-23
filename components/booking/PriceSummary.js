"use client";

/**
 * PriceSummary Component
 * 
 * Price summary display for both fixed and manual routes.
 * Extracted from Step1JourneyBuilder.js (lines 894-937)
 * 
 * @param {Object} props
 * @param {Object} props.formData - Current form state
 * @param {Object} props.hotelData - Hotel configuration
 * @param {'fixed'|'manual'} props.routeSelectionType - Type of route selection
 * @param {number|null} props.currentPrice - Calculated price for fixed routes
 */
export default function PriceSummary({ formData, hotelData, routeSelectionType, currentPrice }) {
  // Price Summary - Fixed Route
  if (currentPrice && routeSelectionType === 'fixed') {
    const vehicleClassName = hotelData.vehicleClasses.find(v => v.id === formData.selectedVehicleClass)?.name;
    const routeName = hotelData.routes.find(r => r.id === formData.selectedRoute)?.name;

    return (
      <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-neutral-400 mb-1">
              {formData.isRoundTrip ? "Round Trip" : "One Way"} • {vehicleClassName}
            </p>
            <p className="text-sm text-neutral-500">
              {routeName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold" style={{ color: hotelData.theme.accentColor }}>
              Rp {currentPrice.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Price Summary - Manual Destination
  if (formData.backendCarData && routeSelectionType === 'manual') {
    return (
      <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-neutral-400 mb-1">
              {formData.isRoundTrip ? "Round Trip" : "One Way"} • {formData.backendCarData.typename}
            </p>
            <p className="text-sm text-neutral-500">
              {formData.manualDestination?.name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold" style={{ color: hotelData.theme.accentColor }}>
              Rp {(formData.backendCarData.start_from_price || 0).toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              {formData.backendCarData.distance?.toFixed(1)} km
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
