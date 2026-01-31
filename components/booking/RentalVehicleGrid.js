import { getRentalDurations, calculateRentalPrice } from '@/lib/rental-pricing';
import VehicleCard from './VehicleCard';

export default function RentalVehicleGrid({ 
  vehicles, 
  selectedVehicle, 
  onSelectVehicle, 
  hotelData,
  formData,
  isSubmitting 
}) {
  const rentalDurations = getRentalDurations();
  
  // Calculate price for a vehicle (when using mock fleet data)
  const getVehiclePrice = (vehicle) => {
    if (!formData.rentalDuration) return null;
    return calculateRentalPrice(vehicle.id, formData.rentalDuration, formData.withDriver);
  };

  // No vehicles to display
  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        <p>No vehicles available for this selection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slideDown">
      <h3 className="text-xl font-bold text-neutral-800">Choose Your Vehicle</h3>
      <p className="text-sm text-neutral-600">
        {formData.withDriver ? "With Driver" : "Self Drive"} • {rentalDurations.find(d => d.value === formData.rentalDuration)?.label}
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {vehicles.map((vehicle) => {
          // Handle both API response structure and Mock data structure
          // API cars have .id, .media.url, .seats_count, .brand, .typename
          const price = vehicle.start_from_price || getVehiclePrice(vehicle) || 0;
          const isSelected = selectedVehicle?.id === vehicle.id;
          
          // Data mapping with fallbacks
          const imageUrl = vehicle.media?.url || vehicle.image || '/images/cars/default.jpg';
          const vehicleName = vehicle.name || `${vehicle.brand || ''} ${vehicle.typename || ''}`.trim() || 'Rental Vehicle';
          const passengerCount = vehicle.seats_count || vehicle.capacity || 4;
          const category = vehicle.vehicleClass || vehicle.category || vehicle.typename || 'Standard';

          return (
            <VehicleCard
              key={vehicle.id}
              image={imageUrl}
              name={vehicleName}
              category={category}
              price={price}
              passengers={passengerCount}
              features={vehicle.features}
              isSelected={isSelected}
              onSelect={() => onSelectVehicle(vehicle)}
              disabled={isSubmitting}
              accentColor={hotelData.theme.accentColor}
              primaryColor={hotelData.theme.primaryColor}
            />
          );
        })}
      </div>
    </div>
  );
}
