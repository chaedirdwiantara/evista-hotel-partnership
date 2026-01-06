"use client";

import VehicleSelector from './VehicleSelector';

/**
 * Step 1: Service Selection Component
 * Handles route, vehicle class, trip type, and specific vehicle selection
 */
export default function Step1ServiceSelection({ formData, updateFormData, hotelData }) {
  // Get current price based on selections
  const getCurrentPrice = () => {
    if (!formData.selectedRoute || !formData.selectedVehicleClass) return null;
    const route = hotelData.routes.find(r => r.id === formData.selectedRoute);
    if (!route) return null;
    const pricing = route.pricing[formData.selectedVehicleClass];
    if (!pricing) return null;
    return formData.isRoundTrip ? pricing.roundTrip : pricing.oneWay;
  };

  const currentPrice = getCurrentPrice();

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-6" style={{ color: hotelData.theme.primaryColor }}>Select Your Service</h2>
      
      {/* Service Type Selection */}
      <div className="flex gap-4">
        <button 
          onClick={() => updateFormData("serviceType", "fixPrice")} 
          className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${formData.serviceType === "fixPrice" ? "shadow-lg scale-105" : "bg-neutral-100"}`} 
          style={{ 
            backgroundColor: formData.serviceType === "fixPrice" ? hotelData.theme.accentColor : undefined, 
            color: formData.serviceType === "fixPrice" ? hotelData.theme.primaryColor : "#666" 
          }}
        >
          ✈️ Airport Transfer
        </button>
        {hotelData.services.rental.enabled && (
          <button 
            onClick={() => updateFormData("serviceType", "rental")} 
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${formData.serviceType === "rental" ? "shadow-lg scale-105" : "bg-neutral-100"}`} 
            style={{ 
              backgroundColor: formData.serviceType === "rental" ? hotelData.theme.accentColor : undefined, 
              color: formData.serviceType === "rental" ? hotelData.theme.primaryColor : "#666" 
            }}
          >
            🚗 Car Rental
          </button>
        )}
      </div>

      {formData.serviceType === "fixPrice" && (
        <div className="space-y-6">
          {/* Route Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-neutral-700">Select Route</h3>
            {hotelData.routes.map((route) => (
              <button 
                key={route.id} 
                onClick={() => updateFormData("selectedRoute", route.id)} 
                className={`w-full p-5 rounded-xl text-left transition-all duration-300 border-2 ${
                  formData.selectedRoute === route.id 
                    ? "shadow-lg scale-[1.01] bg-amber-50/50" 
                    : "border-neutral-200 hover:border-neutral-300"
                }`} 
                style={{ borderColor: formData.selectedRoute === route.id ? hotelData.theme.accentColor : undefined }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-lg" style={{ color: hotelData.theme.primaryColor }}>{route.name}</h4>
                    <p className="text-sm text-neutral-500">{route.distance} km • {route.estimatedDuration} min</p>
                  </div>
                  {formData.selectedRoute === route.id && (
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: hotelData.theme.accentColor }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Vehicle Class Selection */}
          {formData.selectedRoute && hotelData.vehicleClasses && (
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-700">Select Vehicle Class</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hotelData.vehicleClasses.map((vehicleClass) => {
                  const route = hotelData.routes.find(r => r.id === formData.selectedRoute);
                  const pricing = route?.pricing[vehicleClass.id];
                  const isSelected = formData.selectedVehicleClass === vehicleClass.id;
                  
                  return (
                    <button
                      key={vehicleClass.id}
                      onClick={() => updateFormData("selectedVehicleClass", vehicleClass.id)}
                      className={`p-5 rounded-xl text-left transition-all duration-300 border-2 ${
                        isSelected 
                          ? "shadow-lg scale-[1.02] bg-gradient-to-br from-amber-50 to-white" 
                          : "border-neutral-200 hover:border-neutral-300 bg-white"
                      }`}
                      style={{ borderColor: isSelected ? hotelData.theme.accentColor : undefined }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold" style={{ color: hotelData.theme.primaryColor }}>
                          {vehicleClass.name}
                        </h4>
                        {isSelected && (
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: hotelData.theme.accentColor }}
                          >
                            ✓
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mb-3">{vehicleClass.vehicles.join(", ")}</p>
                      {pricing && (
                        <p className="text-lg font-bold" style={{ color: hotelData.theme.accentColor }}>
                          Rp {(formData.isRoundTrip ? pricing.roundTrip : pricing.oneWay).toLocaleString("id-ID")}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vehicle Selection - Shows after Vehicle Class is selected */}
          {formData.selectedVehicleClass && hotelData.fleet && (
            <VehicleSelector
              selectedVehicleClass={formData.selectedVehicleClass}
              selectedVehicle={formData.selectedVehicle}
              onSelectVehicle={(vehicleId) => updateFormData("selectedVehicle", vehicleId)}
              vehicles={hotelData.fleet.filter(v => v.vehicleClass === formData.selectedVehicleClass && v.available)}
              hotelData={hotelData}
            />
          )}

          {/* Trip Type Selection - Elegant Radio Buttons */}
          {formData.selectedRoute && formData.selectedVehicleClass && (
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-700">Trip Type</h3>
              <div className="bg-neutral-100 p-1.5 rounded-xl flex gap-2">
                {/* One Way Option */}
                <button
                  onClick={() => updateFormData("isRoundTrip", false)}
                  className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all duration-300 relative ${
                    !formData.isRoundTrip 
                      ? "bg-white shadow-md text-neutral-900" 
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      !formData.isRoundTrip 
                        ? "border-transparent" 
                        : "border-neutral-400"
                    }`}
                    style={{ 
                      backgroundColor: !formData.isRoundTrip ? hotelData.theme.accentColor : "transparent",
                      borderColor: !formData.isRoundTrip ? hotelData.theme.accentColor : undefined
                    }}
                    >
                      {!formData.isRoundTrip && (
                        <div className="w-2 h-2 rounded-full bg-white animate-scaleIn"></div>
                      )}
                    </div>
                    <span>One Way</span>
                  </div>
                </button>

                {/* Round Trip Option */}
                <button
                  onClick={() => updateFormData("isRoundTrip", true)}
                  className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all duration-300 relative ${
                    formData.isRoundTrip 
                      ? "bg-white shadow-md text-neutral-900" 
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      formData.isRoundTrip 
                        ? "border-transparent" 
                        : "border-neutral-400"
                    }`}
                    style={{ 
                      backgroundColor: formData.isRoundTrip ? hotelData.theme.accentColor : "transparent",
                      borderColor: formData.isRoundTrip ? hotelData.theme.accentColor : undefined
                    }}
                    >
                      {formData.isRoundTrip && (
                        <div className="w-2 h-2 rounded-full bg-white animate-scaleIn"></div>
                      )}
                    </div>
                    <span>Round Trip</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Price Summary */}
          {currentPrice && (
            <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-neutral-400 mb-1">
                    {formData.isRoundTrip ? "Round Trip" : "One Way"} • {hotelData.vehicleClasses.find(v => v.id === formData.selectedVehicleClass)?.name}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {hotelData.routes.find(r => r.id === formData.selectedRoute)?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold" style={{ color: hotelData.theme.accentColor }}>
                    Rp {currentPrice.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
