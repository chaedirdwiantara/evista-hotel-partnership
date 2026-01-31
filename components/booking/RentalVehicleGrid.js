"use client";

import { getRentalDurations, formatPrice, calculateRentalPrice } from '@/lib/rental-pricing';

/**
 * RentalVehicleGrid Component
 * 
 * Displays available rental vehicles in a grid layout.
 * Handles vehicle selection and API submission.
 * 
 * Extracted from Step1RentalSelection.js (lines 482-575)
 * 
 * @param {Object} props
 * @param {Array} props.vehicles - Available vehicles from API or fleet
 * @param {Object} props.selectedVehicle - Currently selected vehicle
 * @param {Function} props.onSelectVehicle - Callback when vehicle is selected
 * @param {Object} props.hotelData - Hotel configuration
 * @param {Object} props.formData - Current form state
 * @param {boolean} props.isSubmitting - Whether selection is being submitted
 */
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
          // API cars have .id, .name, .image, .start_from_price
          const price = vehicle.start_from_price || getVehiclePrice(vehicle) || 0;
          const isSelected = selectedVehicle?.id === vehicle.id;

          return (
            <button
              key={vehicle.id}
              disabled={isSubmitting}
              onClick={() => onSelectVehicle(vehicle)}
              className={`text-left p-6 rounded-2xl border-2 transition-all transform hover:scale-[1.02] ${
                isSelected
                  ? 'border-amber-500 bg-amber-50 shadow-lg'
                  : 'border-neutral-200 hover:border-amber-300 bg-white'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-start gap-4">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-24 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-neutral-800">{vehicle.name}</h4>
                  <p className="text-sm text-neutral-600 mb-2 capitalize">
                    {vehicle.vehicleClass || vehicle.category || 'Standard'}
                  </p>
                  {price > 0 ? (
                    <p className="text-xl font-bold" style={{ color: hotelData.theme.accentColor }}>
                      {formatPrice(price)}
                    </p>
                  ) : (
                    <p className="text-sm text-neutral-400">Select duration first</p>
                  )}
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white" 
                      style={{ backgroundColor: hotelData.theme.accentColor }}
                    >
                      ✓
                    </div>
                  </div>
                )}
              </div>

              {/* Vehicle Features */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-neutral-100 rounded-full text-xs text-neutral-700">
                  {vehicle.capacity} Passengers
                </span>
                {vehicle.features && vehicle.features.slice(0, 2).map((feature, idx) => (
                  <span key={idx} className="px-3 py-1 bg-neutral-100 rounded-full text-xs text-neutral-700">
                    {feature}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
