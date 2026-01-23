"use client";

/**
 * VehicleClassSelection Component
 * 
 * Unified vehicle class selection for both fixed and manual routes.
 * Uses car list API for both route types, with pricing override for fixed routes.
 * 
 * @param {Object} props
 * @param {Object} props.formData - Current form state
 * @param {Object} props.hotelData - Hotel configuration
 * @param {'fixed'|'manual'} props.routeSelectionType - Type of route selection
 * @param {Array} props.availableCars - Available cars from API
 * @param {boolean} props.isLoadingCars - Loading state for cars
 * @param {Function} props.onCarSelect - Car selection handler for both route types
 */
export default function VehicleClassSelection({ 
  formData, 
  hotelData, 
  routeSelectionType,
  availableCars,
  isLoadingCars,
  onCarSelect
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-neutral-700">Select Vehicle Class</h3>
      
      {/* Unified Vehicle Selection - Works for both Fixed and Manual Routes */}
      {isLoadingCars && (
        <div className="p-8 bg-neutral-50 rounded-xl text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: hotelData.theme.accentColor }}></div>
          <p className="mt-4 text-neutral-600">Loading available vehicles...</p>
        </div>
      )}
      
      {!isLoadingCars && availableCars.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableCars.map((car) => {
            // For fixed routes: use configured pricing from hotelData
            // For manual routes: use API pricing
            let displayPrice = car.start_from_price || 0;
            
            if (routeSelectionType === 'fixed') {
              const route = hotelData.routes?.find(r => r.id === formData.selectedRoute);
              
              // Map car ID to vehicle class key
              // Car ID 9 = Economy+, Car ID 2 = Premium
              let vehicleClassKey = null;
              if (car.id === 9) {
                vehicleClassKey = 'economy';
              } else if (car.id === 2) {
                vehicleClassKey = 'premium';
              }
              
              if (vehicleClassKey && route?.pricing?.[vehicleClassKey]) {
                const pricing = route.pricing[vehicleClassKey];
                displayPrice = formData.isRoundTrip ? pricing.roundTrip : pricing.oneWay;
              }
            }
            
            return (
              <button
                key={car.id}
                type="button"
                onClick={() => onCarSelect(car)}
                className={`p-5 rounded-xl text-left transition-all duration-300 border-2 ${
                  formData.selectedVehicleClass === car.id
                    ? 'shadow-lg scale-[1.02] bg-gradient-to-br from-amber-50 to-white'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
                style={{ borderColor: formData.selectedVehicleClass === car.id ? hotelData.theme.accentColor : undefined }}
              >
                <div className="flex items-start gap-4">
                  {car.media?.url && (
                    <img 
                      src={car.media.url} 
                      alt={car.typename} 
                      className="w-16 h-16 object-contain"
                    />
                  )}
                  <div className="flex-1">
                    <h5 className="font-bold text-neutral-900 mb-1">{car.typename}</h5>
                    <p className="text-xs text-neutral-600 mb-2">{car.brand}</p>
                    <p className="text-sm font-semibold mb-1" style={{ color: hotelData.theme.accentColor }}>
                      Rp {displayPrice.toLocaleString('id-ID')}
                    </p>
                    {car.distance && (
                      <p className="text-xs text-neutral-500">
                        {car.distance.toFixed(1)} km
                      </p>
                    )}
                  </div>
                  {formData.selectedVehicleClass === car.id && (
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                      style={{ backgroundColor: hotelData.theme.accentColor }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
      
      {!isLoadingCars && availableCars.length === 0 && (
        <div className="p-6 bg-neutral-50 rounded-xl text-center">
          <p className="text-neutral-600">No vehicles available. Please try again.</p>
        </div>
      )}
    </div>
  );
}
