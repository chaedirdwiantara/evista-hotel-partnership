"use client";

import { calculateRentalPrice, getRentalDurations, formatPrice } from '@/lib/rental-pricing';

/**
 * Step1RentalSelection Component
 * 
 * Rental service configuration with:
 * - Tab Switcher (Airport Transfer / Car Rental)
 * - With/Without Driver toggle
 * - Rental Duration selection (6 Jam, 12 Jam)
 * - Return Location dropdown
 * - Vehicle Selection Grid with dynamic pricing
 */
export default function Step1RentalSelection({ formData, updateFormData, hotelData }) {
  const rentalDurations = getRentalDurations();
  const rentalVehicles = hotelData.fleet || []; // Changed from vehicles to fleet

  // Return location options
  const returnLocations = [
    { value: "classic_hotel", label: "Classic Hotel (Same as Pickup)" },
    { value: "halim_airport", label: "Halim Perdanakusuma Airport (HLP)" }
  ];

  // Calculate price for a vehicle
  const getVehiclePrice = (vehicle) => {
    if (!formData.rentalDuration) return null;
    return calculateRentalPrice(vehicle.id, formData.rentalDuration, formData.withDriver);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-6" style={{ color: hotelData.theme.primaryColor }}>Select Your Service</h2>
      
      {/* Service Type Selection - Tab Switcher */}
      <div className="flex gap-4">
        <button 
          onClick={() => {
            updateFormData("serviceType", "fixPrice");
            updateFormData("bookingType", "airport");
          }} 
          className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${formData.serviceType === "fixPrice" ? "shadow-lg scale-105" : "bg-neutral-100"}`} 
          style={{ 
            backgroundColor: formData.serviceType === "fixPrice" ? hotelData.theme.accentColor : undefined, 
            color: formData.serviceType === "fixPrice" ? hotelData.theme.primaryColor : "#666" 
          }}
        >
          ✈️ Airport Transfer
        </button>
        <button 
          onClick={() => {
            updateFormData("serviceType", "rental");
            updateFormData("bookingType", "rental");
          }} 
          className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${formData.serviceType === "rental" ? "shadow-lg scale-105" : "bg-neutral-100"}`} 
          style={{ 
            backgroundColor: formData.serviceType === "rental" ? hotelData.theme.accentColor : undefined, 
            color: formData.serviceType === "rental" ? hotelData.theme.primaryColor : "#666" 
          }}
        >
          🚗 Car Rental
        </button>
      </div>

      {/* With Driver Toggle */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">
          With Driver? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => updateFormData("withDriver", true)}
            className={`py-4 px-6 rounded-xl border-2 font-semibold transition-all ${
              formData.withDriver === true
                ? 'border-amber-500 bg-amber-50 text-amber-800'
                : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>👨</span>
              <span>With Driver</span>
            </div>
          </button>
          <button
            onClick={() => updateFormData("withDriver", false)}
            className={`py-4 px-6 rounded-xl border-2 font-semibold transition-all ${
              formData.withDriver === false
                ? 'border-amber-500 bg-amber-50 text-amber-800'
                : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>✓</span>
              <span>Self Drive</span>
            </div>
          </button>
        </div>
      </div>

      {/* Pickup Location */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">
          Pickup Location <span className="text-red-500">*</span>
        </label>
        <div className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 bg-neutral-50 text-neutral-600 text-lg flex items-center gap-3">
          <span>📍</span>
          <span>{hotelData.name}</span>
        </div>
      </div>

      {/* Rental Duration */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">
          Rental Duration <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.rentalDuration || ""}
          onChange={(e) => updateFormData("rentalDuration", e.target.value)}
          className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 focus:border-amber-500 focus:outline-none transition-all text-lg"
        >
          <option value="">Select Duration</option>
          {rentalDurations.map((duration) => (
            <option key={duration.value} value={duration.value}>
              {duration.label}
            </option>
          ))}
        </select>
      </div>

      {/* Return Location */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">
          Return Location <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.returnLocation || ""}
          onChange={(e) => updateFormData("returnLocation", e.target.value)}
          className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 focus:border-amber-500 focus:outline-none transition-all text-lg"
        >
          <option value="">Select return location...</option>
          {returnLocations.map((loc) => (
            <option key={loc.value} value={loc.value}>
              {loc.label}
            </option>
          ))}
        </select>
      </div>

      {/* Vehicle Selection Grid - Shows when duration is selected */}
      {formData.rentalDuration && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-neutral-800">Choose Your Vehicle</h3>
          <p className="text-sm text-neutral-600">
            {formData.withDriver ? "With Driver" : "Self Drive"} • {rentalDurations.find(d => d.value === formData.rentalDuration)?.label}
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {rentalVehicles.map((vehicle) => {
              const price = getVehiclePrice(vehicle);
              const isSelected = formData.selectedVehicle?.id === vehicle.id;

              return (
                <button
                  key={vehicle.id}
                  onClick={() => updateFormData("selectedVehicle", vehicle)}
                  className={`text-left p-6 rounded-2xl border-2 transition-all transform hover:scale-[1.02] ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 shadow-lg'
                      : 'border-neutral-200 hover:border-amber-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-24 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-neutral-800">{vehicle.name}</h4>
                      <p className="text-sm text-neutral-600 mb-2 capitalize">{vehicle.vehicleClass}</p>
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
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: hotelData.theme.accentColor }}>
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
      )}
    </div>
  );
}
