"use client";

import VehicleSelector from './VehicleSelector';

/**
 * Step2RentalVehicle Component
 * 
 * Vehicle selection step for rental bookings
 * Shows all available vehicles grouped by class
 */
export default function Step2RentalVehicle({ formData, updateFormData, hotelData }) {
  // Get all vehicles
  const allVehicles = hotelData.fleet || [];
  
  // Group vehicles by class for better organization
  const vehiclesByClass = {
    economy: allVehicles.filter(v => v.vehicleClass === "economy"),
    premium: allVehicles.filter(v => v.vehicleClass === "premium"),
    elite: allVehicles.filter(v => v.vehicleClass === "elite"),
  };

  // Calculate rental price for a specific vehicle class
  const getRentalPrice = (vehicleClass) => {
    if (!formData.rentalDuration) return 0;
    
    const basePrices = hotelData.rentalPricing?.[vehicleClass] || {};
    const basePrice = basePrices[formData.rentalDuration] || 0;
    
    // Add driver surcharge if applicable
    if (formData.withDriver) {
      const surchargePercent = hotelData.rentalPricing?.driverSurchargePercent || 25;
      return basePrice + (basePrice * surchargePercent / 100);
    }
    
    return basePrice;
  };

  const handleVehicleSelect = (vehicleId) => {
    const vehicle = allVehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      updateFormData('selectedVehicle', vehicleId);
      updateFormData('selectedVehicleClass', vehicle.vehicleClass);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Your Vehicle</h2>
        <p className="text-neutral-600">
          Choose from our premium electric vehicle fleet
        </p>
      </div>

      {/* Display vehicles by class */}
      <div className="space-y-8">
        {/* Economy Class */}
        {vehiclesByClass.economy.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-800">Economy Class</h3>
              <div className="text-right">
                <p className="text-sm text-neutral-600">Starting from</p>
                <p className="text-xl font-bold" style={{ color: hotelData.theme.accentColor }}>
                  Rp {getRentalPrice('economy').toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {vehiclesByClass.economy.map(vehicle => (
                <VehicleCard 
                  key={vehicle.id}
                  vehicle={vehicle}
                  isSelected={formData.selectedVehicle === vehicle.id}
                  onSelect={() => handleVehicleSelect(vehicle.id)}
                  hotelData={hotelData}
                />
              ))}
            </div>
          </div>
        )}

        {/* Premium Class */}
        {vehiclesByClass.premium.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-800">Premium Class</h3>
              <div className="text-right">
                <p className="text-sm text-neutral-600">Starting from</p>
                <p className="text-xl font-bold" style={{ color: hotelData.theme.accentColor }}>
                  Rp {getRentalPrice('premium').toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {vehiclesByClass.premium.map(vehicle => (
                <VehicleCard 
                  key={vehicle.id}
                  vehicle={vehicle}
                  isSelected={formData.selectedVehicle === vehicle.id}
                  onSelect={() => handleVehicleSelect(vehicle.id)}
                  hotelData={hotelData}
                />
              ))}
            </div>
          </div>
        )}

        {/* Elite Class */}
        {vehiclesByClass.elite.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-800">Elite Class</h3>
              <div className="text-right">
                <p className="text-sm text-neutral-600">Starting from</p>
                <p className="text-xl font-bold" style={{ color: hotelData.theme.accentColor }}>
                  Rp {getRentalPrice('elite').toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {vehiclesByClass.elite.map(vehicle => (
                <VehicleCard 
                  key={vehicle.id}
                  vehicle={vehicle}
                  isSelected={formData.selectedVehicle === vehicle.id}
                  onSelect={() => handleVehicleSelect(vehicle.id)}
                  hotelData={hotelData}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Vehicle Card Component
function VehicleCard({ vehicle, isSelected, onSelect, hotelData }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-4 rounded-xl text-left transition-all duration-300 border-2 flex items-center gap-4 ${
        isSelected 
          ? "shadow-lg scale-[1.01] border-purple-500 bg-gradient-to-r from-purple-50 to-white" 
          : "border-neutral-200 bg-white hover:border-neutral-300"
      }`}
    >
      {/* Vehicle Image */}
      <div className="w-32 h-24 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
        <img 
          src={vehicle.image} 
          alt={vehicle.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.parentElement.innerHTML = `
              <div class="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-neutral-100 to-neutral-50">
                ${vehicle.category === 'sedan' ? '🚗' : vehicle.category === 'suv' ? '🚙' : '🚐'}
              </div>
            `;
          }}
        />
      </div>

      {/* Vehicle Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-bold text-lg" style={{ color: hotelData.theme.primaryColor }}>
            {vehicle.name}
          </h4>
          <span className="text-xs px-2 py-1 bg-neutral-100 rounded-full text-neutral-600 uppercase">
            {vehicle.vehicleClass}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
          <span>👥 {vehicle.capacity} Passengers</span>
          <span>•</span>
          <span className="capitalize">{vehicle.category}</span>
        </div>
        <p className="text-sm text-neutral-500">
          {vehicle.description}
        </p>
      </div>

      {/* Selected Checkmark */}
      {isSelected && (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 animate-scaleIn"
          style={{ backgroundColor: hotelData.theme.accentColor }}
        >
          ✓
        </div>
      )}
    </button>
  );
}
