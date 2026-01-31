import VehicleCard from './VehicleCard';

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
            
            const isSelected = formData.selectedVehicleClass === car.id;
            const imageUrl = car.media?.url || car.image;
            const priceLabel = car.distance ? `${car.distance.toFixed(1)} km` : null;

            return (
              <VehicleCard
                key={car.id}
                image={imageUrl}
                name={car.typename}
                category={car.brand}
                price={displayPrice}
                passengers={car.seats_count || car.capacity || 4}
                features={[]}
                isSelected={isSelected}
                onSelect={() => onCarSelect(car)}
                accentColor={hotelData.theme.accentColor}
                primaryColor={hotelData.theme.primaryColor}
                priceLabel={priceLabel}
              />
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
