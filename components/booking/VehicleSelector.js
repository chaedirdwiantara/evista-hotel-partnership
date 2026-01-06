"use client";

/**
 * Vehicle Selector Component
 * Displays available vehicles for selected vehicle class
 * Allows users to choose specific vehicle for their booking
 */
export default function VehicleSelector({ 
  selectedVehicleClass, 
  selectedVehicle, 
  onSelectVehicle, 
  vehicles, 
  hotelData 
}) {
  if (!selectedVehicleClass || !vehicles || vehicles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 animate-slideDown">
      <h3 className="font-semibold text-neutral-700">Choose Your Vehicle (Optional)</h3>
      
      <div className="space-y-3">
        {vehicles.map((vehicle) => {
          const isSelected = selectedVehicle === vehicle.id;
          
          return (
            <button
              key={vehicle.id}
              onClick={() => onSelectVehicle(vehicle.id)}
              className={`w-full p-4 rounded-xl text-left transition-all duration-300 border-2 flex items-center gap-4 ${
                isSelected 
                  ? "shadow-lg scale-[1.01] border-amber-500 bg-gradient-to-r from-amber-50 to-white" 
                  : "border-neutral-200 bg-white"
              }`}
              style={{ borderColor: isSelected ? hotelData.theme.accentColor : undefined }}
            >
              {/* Vehicle Image Thumbnail */}
              <div className="w-24 h-20 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={vehicle.image} 
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to emoji if image fails to load
                    e.target.parentElement.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-neutral-100 to-neutral-50">
                        ${vehicle.category === 'sedan' ? '🚗' : vehicle.category === 'suv' ? '🚙' : '🚐'}
                      </div>
                    `;
                  }}
                />
              </div>

              {/* Vehicle Info - Compact */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-base" style={{ color: hotelData.theme.primaryColor }}>
                    {vehicle.name}
                  </h4>
                  <span className="text-xs text-neutral-400">•</span>
                  <span className="text-xs text-neutral-600">👥 {vehicle.capacity} seats</span>
                </div>
                <p className="text-xs text-neutral-500 line-clamp-1">
                  {vehicle.features[0]}
                </p>
              </div>

              {/* Selected Checkmark */}
              {isSelected && (
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 animate-scaleIn"
                  style={{ backgroundColor: hotelData.theme.accentColor }}
                >
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-neutral-500 italic">
        💡 Vehicle selection is optional. If not selected, you'll be assigned an available vehicle from your chosen class.
      </p>
    </div>
  );
}
