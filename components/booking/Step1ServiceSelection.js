"use client";

import { useState, useEffect } from 'react';
import VehicleSelector from './VehicleSelector';
import ManualDestinationInput from '../ManualDestinationInput';
import { selectPickupLocation, selectDestination, setRoundTrip, submitTrip, getCarList } from '@/lib/manual-destination-api';

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
  
  // Manual destination states
  const [availableCars, setAvailableCars] = useState([]);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [manualDestinationError, setManualDestinationError] = useState(null);
  
  // Track which route selection type is active: 'fixed' | 'manual' | null
  const routeSelectionType = formData.selectedRoute ? 'fixed' : (formData.manualDestination ? 'manual' : null);

  // Handle manual destination selection
  const handleManualDestinationSelect = async (destination) => {
    console.log('[Step1] handleManualDestinationSelect called with:', destination);
    
    // Handle clear selection (when destination is null)
    if (!destination) {
      console.log('[Manual Destination] Clearing selection');
      updateFormData('manualDestination', null);
      updateFormData('selectedVehicleClass', null);
      updateFormData('selectedVehicle', null);
      updateFormData('backendCarData', null);
      setAvailableCars([]);
      setManualDestinationError(null);
      return; // Exit early
    }
    
    try {
      setIsLoadingCars(true);
      setManualDestinationError(null);

      // Step 0: Set pickup location to hotel (CRITICAL: Must be done first!)
      console.log('[Manual Destination] Setting pickup location to hotel:', hotelData.name);
      
      // Get hotel pickup coordinates from config
      // Classic Hotel coordinates from hotel-config.js
      const hotelPickupLocation = {
        lat: -6.1696,
        lng: 106.8349,
        label: hotelData.name || 'Classic Hotel',
        name: hotelData.name || 'Classic Hotel',
        address: 'Jl. K.H. Samanhudi No. 43-45, Pasar Baru, Jakarta Pusat',
      };
      
      await selectPickupLocation(hotelPickupLocation, 'later');
      console.log('[Manual Destination] Hotel pickup location set successfully');

      // Step 1: Select destination - creates/updates draft order
      console.log('[Manual Destination] Selecting destination:', destination);
      await selectDestination(destination, 'later');

      // Step 2: Set round trip if needed
      if (formData.isRoundTrip) {
        console.log('[Manual Destination] Setting round trip mode');
        await setRoundTrip(true);
      } else {
        console.log('[Manual Destination] Setting one-way trip mode');
        await setRoundTrip(false);
      }

      // Step 3: Submit trip with pickup time (use current time + 2 hours as default)
      const defaultPickupTime = new Date();
      defaultPickupTime.setHours(defaultPickupTime.getHours() + 2);
      const pickupAt = defaultPickupTime.toISOString().slice(0, 19).replace('T', ' ');
      
      console.log('[Manual Destination] Submitting trip with pickup time:', pickupAt);
      await submitTrip({
        orderType: 'later',
        pickupAt: pickupAt,
      });

      // Step 4: Get available cars with pricing
      console.log('[Manual Destination] Fetching available cars...');
      const cars = await getCarList('later');
      console.log('[Manual Destination] Received cars:', cars);
      
      setAvailableCars(cars);
      
      // Clear fixed route selection and reset vehicle selection
      updateFormData('selectedRoute', null);
      updateFormData('selectedVehicleClass', null);
      updateFormData('selectedVehicle', null);
      
      // Update form data with manual destination
      updateFormData('manualDestination', destination);
      
    } catch (error) {
      console.error('[Manual Destination] Error:', error);
      setManualDestinationError(error.message || 'Failed to load vehicles. Please try again.');
      setAvailableCars([]);
    } finally {
      setIsLoadingCars(false);
    }
  };

  // Handle fixed route selection - clear manual destination state
  const handleFixedRouteSelect = (routeId) => {
    // Clear manual destination data
    updateFormData('manualDestination', null);
    updateFormData('backendCarData', null);
    updateFormData('selectedVehicleClass', null);
    updateFormData('selectedVehicle', null);
    setAvailableCars([]);
    setManualDestinationError(null);
    
    // Set the selected fixed route
    updateFormData('selectedRoute', routeId);
  };

  // Watch for round trip changes when using manual destination
  useEffect(() => {
    // Only re-fetch if we have a manual destination and cars already loaded
    if (formData.manualDestination && availableCars.length > 0) {
      const updateRoundTrip = async () => {
        try {
          setIsLoadingCars(true);
          console.log('[Manual Destination] Round trip changed, updating...');
          
          // Update round trip status
          await setRoundTrip(formData.isRoundTrip);
          
          // Re-fetch car list with updated pricing
          const cars = await getCarList('later');
          setAvailableCars(cars);
          
          // UPDATE: If user had selected a vehicle, update backendCarData with new pricing
          if (formData.selectedVehicleClass) {
            const updatedCar = cars.find(c => c.id === formData.selectedVehicleClass);
            if (updatedCar) {
              console.log('[Manual Destination] Updating backendCarData with new price:', updatedCar.start_from_price);
              updateFormData('backendCarData', updatedCar);
            }
          }
          
        } catch (error) {
          console.error('[Manual Destination] Failed to update round trip:', error);
        } finally {
          setIsLoadingCars(false);
        }
      };
      
      updateRoundTrip();
    }
  }, [formData.isRoundTrip, formData.manualDestination, availableCars.length]); // Fixed dependency array


  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-6" style={{ color: hotelData.theme.primaryColor }}>Select Your Service</h2>
      
      {/* Service Type Selection */}
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
          📋 Reservation
        </button>
        {hotelData.services.rental.enabled && (
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
                onClick={() => handleFixedRouteSelect(route.id)} 
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
          
          {/* OR Divider */}
          <div className="mt-8 mb-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-neutral-200"></div>
            <span className="text-neutral-400 font-medium text-sm">OR</span>
            <div className="flex-1 h-px bg-neutral-200"></div>
          </div>

          {/* Manual Destination Section - Always Visible */}
          <div className="bg-gradient-to-br from-neutral-50 to-white rounded-xl shadow-md border-2 border-neutral-200 p-6">
            <div className="mb-4">
              <h4 className="text-lg font-bold mb-1" style={{ color: hotelData.theme.primaryColor }}>
                📍 Search Other Destinations
              </h4>
              <p className="text-sm text-neutral-600">
                Can't find your route? Search manually
              </p>
            </div>
            
            <ManualDestinationInput
              onDestinationSelect={handleManualDestinationSelect}
              onInputFocus={() => {
                // Clear fixed route selection when user focuses manual input
                updateFormData('selectedRoute', null);
                updateFormData('selectedVehicleClass', null);
                updateFormData('selectedVehicle', null);
              }}
              primaryColor={hotelData.theme.primaryColor}
              accentColor={hotelData.theme.accentColor}
            />
            
            {/* Loading State */}
            {isLoadingCars && (
              <div className="mt-6 p-8 bg-neutral-50 rounded-xl text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: hotelData.theme.accentColor }}></div>
                <p className="mt-4 text-neutral-600">Loading available vehicles...</p>
              </div>
            )}
            
            {/* Error State */}
            {manualDestinationError && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{manualDestinationError}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* SHARED COMPONENTS SECTION */}
      {/* Appears after EITHER Fixed Route OR Manual Destination is selected */}
      {/* ========================= */}
      
      {routeSelectionType && formData.serviceType === "fixPrice" && (
        <div className="space-y-8 animate-slideDown">
          
          {/* Vehicle Class Selection - Unified for both Fixed and Manual */}
          {routeSelectionType === 'fixed' && hotelData.vehicleClasses && (
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

          {/* Vehicle Class Selection for Manual Destination (Backend Cars) */}
          {routeSelectionType === 'manual' && availableCars.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-700">Select Vehicle Class</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableCars.map((car) => (
                  <button
                    key={car.id}
                    type="button"
                    onClick={() => {
                      updateFormData('selectedVehicleClass', car.id);
                      updateFormData('backendCarData', car);
                    }}
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
                          Rp {(car.start_from_price || 0).toLocaleString('id-ID')}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {car.distance?.toFixed(1)} km
                        </p>
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
                ))}
              </div>
            </div>
          )}

          {/* Optional Vehicle Selection - Only for Fixed Routes */}
          {routeSelectionType === 'fixed' && formData.selectedVehicleClass && hotelData.fleet && (
            <VehicleSelector
              selectedVehicleClass={formData.selectedVehicleClass}
              selectedVehicle={formData.selectedVehicle}
              onSelectVehicle={(vehicleId) => updateFormData("selectedVehicle", vehicleId)}
              vehicles={hotelData.fleet.filter(v => v.vehicleClass === formData.selectedVehicleClass && v.available)}
              hotelData={hotelData}
            />
          )}

          {/* Trip Type Selection - Shared for Both */}
          {formData.selectedVehicleClass && (
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-700">Trip Type</h3>
              <div className="bg-neutral-100 p-1.5 rounded-xl flex gap-2">
                {/* One Way Option */}
                <button
                  type="button"
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
                  type="button"
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

          {/* Price Summary - Shared for Both */}
          {currentPrice && routeSelectionType === 'fixed' && (
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

            {/* Price Summary for Manual Destination */}
            {formData.backendCarData && routeSelectionType === 'manual' && (
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
            )}
          </div>
      )}

      {/* Car Rental Fields */}
      {formData.serviceType === "rental" && (
        <div className="space-y-6 animate-slideDown">
          {/* With Driver Toggle */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-neutral-800">
              With Driver? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateFormData('withDriver', true)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  formData.withDriver === true
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-neutral-300 bg-white hover:border-neutral-400'
                }`}
                style={{
                  borderColor: formData.withDriver === true ? hotelData.theme.accentColor : undefined,
                  backgroundColor: formData.withDriver === true ? `${hotelData.theme.accentColor}10` : undefined
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">With Driver</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => updateFormData('withDriver', false)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  formData.withDriver === false
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-neutral-300 bg-white hover:border-neutral-400'
                }`}
                style={{
                  borderColor: formData.withDriver === false ? hotelData.theme.accentColor : undefined,
                  backgroundColor: formData.withDriver === false ? `${hotelData.theme.accentColor}10` : undefined
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Self Drive</span>
                </div>
              </button>
            </div>
          </div>

          {/* Rental Duration */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-neutral-800">
              Rental Duration <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.rentalDuration || ''}
              onChange={(e) => updateFormData('rentalDuration', e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select duration...</option>
              <option value="6_hours">6 Jam</option>
              <option value="12_hours">12 Jam</option>
              <option value="24_hours">24 Jam (1 Hari)</option>
              <option value="2_days">2 Hari</option>
              <option value="3_days">3 Hari</option>
              <option value="week">1 Minggu</option>
            </select>
          </div>

          {/* Rental Date */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-neutral-800">
              Rental Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.rentalDate || ''}
              onChange={(e) => updateFormData('rentalDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Pickup Time */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-neutral-800">
              Pickup Time <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.pickupTime || ''}
              onChange={(e) => updateFormData('pickupTime', e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select time...</option>
              {Array.from({ length: 48 }, (_, i) => {
                const hour = Math.floor(i / 2);
                const minute = (i % 2) * 30;
                const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                return <option key={value} value={value}>{value}</option>;
              })}
            </select>
            
            {/* Pickup Time Validation Warning */}
            {formData.rentalDate && formData.pickupTime && (() => {
              const selectedDate = new Date(formData.rentalDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              if (selectedDate.getTime() === today.getTime()) {
                const [hour, min] = formData.pickupTime.split(':').map(Number);
                const pickupDateTime = new Date();
                pickupDateTime.setHours(hour, min, 0, 0);
                
                const minTime = new Date();
                minTime.setMinutes(minTime.getMinutes() + 60);
                
                if (pickupDateTime < minTime) {
                  return (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        ⚠️ Pickup time must be at least 60 minutes from now. Please select a later time.
                      </p>
                    </div>
                  );
                }
              }
              
              // Night service warning (00:00 - 05:59) - NO button inside, just warning
              const hour = parseInt(formData.pickupTime.split(':')[0]);
              if (hour >= 0 && hour < 6) {
                return (
                  <div className="mt-2 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🌙</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-amber-800 mb-1">Night Service (00:00 - 06:00)</h4>
                        <p className="text-sm text-amber-700">
                          For night hours, please contact via WhatsApp for manual confirmation.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
              
              return null;
            })()}
          </div>

          {/* Pickup Location (Fixed) */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-neutral-800">
              Pickup Location
            </label>
            <div className="px-4 py-3 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-700">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: hotelData.theme.accentColor }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">Classic Hotel Jakarta</span>
              </div>
              <p className="text-sm text-neutral-500 mt-1 ml-7">Jl. Sudirman No. 123, Jakarta</p>
            </div>
          </div>

          {/* Return Location */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-neutral-800">
              Return Location <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.returnLocation || ''}
              onChange={(e) => updateFormData('returnLocation', e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select return location...</option>
              <option value="classic_hotel">Classic Hotel (Same as Pickup)</option>
              <option value="halim_airport">Halim Perdanakusuma Airport (HLP)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
