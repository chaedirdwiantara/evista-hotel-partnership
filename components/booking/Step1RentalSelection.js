import { useState, useEffect } from 'react';
import { calculateRentalPrice, getRentalDurations, formatPrice } from '@/lib/rental-pricing';
import { Car, CalendarCheck, UserCheck, Key, MapPin, Calendar, Clock } from 'lucide-react';
import { EvistaAPI } from '@/lib/evista-api';
import { getCarList, selectPickupLocation, selectDestination } from '@/lib/manual-destination-api';

/**
 * Step1RentalSelection Component
 * 
 * Rental service configuration with:
 * - Tab Switcher (Airport Transfer / Car Rental)
 * - With/Without Driver toggle
 * - Rental Duration selection (6 Jam, 12 Jam)
 * - Return Location dropdown
 * - Date & Time Selection
 * - Auto-submission for vehicle selection
 * - Vehicle Selection Grid with dynamic pricing
 */
import { useDateTimeValidation } from "@/hooks/useDateTimeValidation";
import DateTimeSection from "./DateTimeSection";

export default function Step1RentalSelection({ formData, updateFormData, hotelData, onContinue }) {
  const rentalDurations = getRentalDurations();
  const rentalVehicles = hotelData.fleet || [];
  
  // State for auto-submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCars, setAvailableCars] = useState([]);
  const [isLoadingCars, setIsLoadingCars] = useState(false);

  // Initialize validation hook
  const validation = useDateTimeValidation(formData);

  // Return location options - WITH COORDINATES
  // Note: Using hotelData for Classic Hotel, and hardcoded logic for Halim
  const returnLocations = [
    { 
      value: "classic_hotel", 
      label: "Classic Hotel (Same as Pickup)",
      // Coordinates will be taken from hotelData
    },
    { 
      value: "halim_airport", 
      label: "Halim Perdanakusuma Airport (HLP)",
      lat: -6.2657,
      long: 106.8913
    }
  ];

  // Calculate price for a vehicle
  const getVehiclePrice = (vehicle) => {
    if (!formData.rentalDuration) return null;
    return calculateRentalPrice(vehicle.id, formData.rentalDuration, formData.withDriver);
  };

  // Helper to get duration in hours
  const getDurationHours = (durationVal) => {
    const durationObj = rentalDurations.find(d => d.value === durationVal);
    return durationObj ? durationObj.hours : 0;
  };

  // Helper to calculate return date/time
  const calculateReturnDateTime = (pickupDateStr, pickupTimeStr, durationVal) => {
    if (!pickupDateStr || !pickupTimeStr || !durationVal) return null;

    try {
      const startDateTime = new Date(`${pickupDateStr}T${pickupTimeStr}:00`);
      const hoursToAdd = getDurationHours(durationVal);
      
      const endDateTime = new Date(startDateTime.getTime() + hoursToAdd * 60 * 60 * 1000);
      
      // Format to YYYY-MM-DD HH:mm:ss
      const year = endDateTime.getFullYear();
      const month = String(endDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(endDateTime.getDate()).padStart(2, '0');
      const hours = String(endDateTime.getHours()).padStart(2, '0');
      const minutes = String(endDateTime.getMinutes()).padStart(2, '0');
      const seconds = String(endDateTime.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
      console.error("Error calculating return time:", e);
      return null;
    }
  };

  // Calculate return date/time for display or debug
  useEffect(() => {
    if (formData.rentalDate && formData.pickupTime && formData.rentalDuration) {
      const returnAt = calculateReturnDateTime(formData.rentalDate, formData.pickupTime, formData.rentalDuration);
      console.log('[Rental] Calculated Return Time:', returnAt);
    }
  }, [formData.rentalDate, formData.pickupTime, formData.rentalDuration]);

  /**
   * Effect: Reset orderId when rental fields change to trigger re-submission
   * This is critical so that we generate a new order when params change
   */
   useEffect(() => {
     if (formData.orderId && formData.bookingType === 'rental') {
       console.log('[Rental] Fields changed, resetting orderId to force re-submit');
       updateFormData('orderId', null);
     }
   }, [
     formData.withDriver,
     formData.rentalDuration,
     formData.returnLocation,
     formData.rentalDate,
     formData.pickupTime
   ]);

  /**
   * Effect: Auto-submit rental trip when all fields are filled
   */
  useEffect(() => {
    const submitRentalTrip = async () => {
      // Check if all required fields are filled
      const hasDriver = formData.withDriver !== null && formData.withDriver !== undefined;
      const hasDuration = !!formData.rentalDuration;
      const hasReturnLoc = !!formData.returnLocation;
      const hasDate = !!formData.rentalDate;
      const hasTime = !!formData.pickupTime;

      console.log('[Rental] Checking auto-submit conditions:', {
        hasDriver, hasDuration, hasReturnLoc, hasDate, hasTime,
        orderId: formData.orderId,
        isSubmitting
      });

      // Only submit if all fields are valid AND no order yet
      if (hasDriver && hasDuration && hasReturnLoc && hasDate && hasTime && !formData.orderId && !isSubmitting) {
        try {
          setIsSubmitting(true);
          console.log('[Rental] Auto-submitting trip...');

          // 1. Select Pickup Location (Hotel)
          // Fallback to first route's pickup if top-level location is missing
          const defaultPickup = hotelData.routes?.[0]?.pickup || {};
          const hotelLocation = {
            lat: hotelData.location?.lat || defaultPickup.lat,
            long: hotelData.location?.long || defaultPickup.lng,
            name: hotelData.name,
            address: hotelData.location?.address || defaultPickup.address
          };

          if (!hotelLocation.lat) {
            console.error('[Rental] Missing hotel location data');
            setIsSubmitting(false);
            return;
          }

          console.log('[Rental] Selecting Pickup:', hotelLocation);
          await selectPickupLocation(hotelLocation, 'rental');

          // 2. Select Destination (Return Location)
          let returnLocationData = {};
          if (formData.returnLocation === 'classic_hotel') {
            returnLocationData = hotelLocation;
          } else {
             const halim = returnLocations.find(l => l.value === 'halim_airport');
             returnLocationData = {
               lat: halim.lat,
               long: halim.long,
               name: halim.label,
               address: "Jakarta Timur"
             };
          }
          console.log('[Rental] Selecting Return Location:', returnLocationData);
          await selectDestination(returnLocationData, 'rental');

          // 3. Submit Trip
          const returnAt = calculateReturnDateTime(formData.rentalDate, formData.pickupTime, formData.rentalDuration);
          const durationHours = getDurationHours(formData.rentalDuration);
          
          const tripData = {
            order_type: "rental",
            pickup_at: `${formData.rentalDate} ${formData.pickupTime}:00`,
            rental_duration_h: durationHours,
            hotel_slug: hotelData.slug
          };

          console.log('[Rental] Trip Payload:', tripData);

          const response = await EvistaAPI.trips.submit(tripData);
          console.log('[Rental] Submit Response:', response);
          
          // Relaxed check: if we have an ID, it's a success. 
          // apiRequest throws on HTTP error, so if we are here, HTTP is OK.
          if (response?.data?.id) {
            console.log('[Rental] ✅ Order Created:', response.data.id);
            updateFormData('orderId', response.data.id);
            
            // Now load available cars
            setIsLoadingCars(true);
            try {
              console.log('[Rental] Fetching car list...');
              const cars = await getCarList('rental');
              console.log('[Rental] Cars loaded:', cars);
              setAvailableCars(cars);
            } catch (carError) {
              console.error('[Rental] Failed to load cars:', carError);
            } finally {
              setIsLoadingCars(false);
            }
          } else {
            console.error('[Rental] Submit succeeded but no ID returned:', response);
          }

        } catch (error) {
          console.error('[Rental] Auto-submit error:', error);
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    // Debounce to avoid rapid API calls
    const timeoutId = setTimeout(() => {
      submitRentalTrip();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    formData.withDriver,
    formData.rentalDuration,
    formData.returnLocation,
    formData.rentalDate,
    formData.pickupTime,
    formData.orderId,
    hotelData.slug,
    hotelData.routes,
    hotelData.location
  ]);

  return (
    <div className="space-y-8 animate-slideDown">
      <h2 className="text-3xl font-bold mb-6" style={{ color: hotelData.theme.primaryColor }}>Select Your Service</h2>
      
      {/* Service Type Selection - Tab Switcher */}
      <div className="flex gap-4">
        <button 
          onClick={() => {
            // Switch to Reservation (Airport Transfer)
            updateFormData("serviceType", "fixPrice");
            updateFormData("bookingType", "airport");
            
            // Cleanup Rental Data
            updateFormData("rentalDate", "");
            updateFormData("rentalDuration", ""); 
            updateFormData("pickupTime", "");
            updateFormData("orderId", null); // Reset order
            updateFormData("selectedVehicle", null);
          }} 
          className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
            formData.serviceType === "fixPrice" 
              ? "shadow-md scale-[1.02]" 
              : "bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-500"
          }`} 
          style={{ 
            backgroundColor: formData.serviceType === "fixPrice" ? hotelData.theme.accentColor : undefined, 
            color: formData.serviceType === "fixPrice" ? hotelData.theme.primaryColor : undefined,
            borderColor: formData.serviceType === "fixPrice" ? 'transparent' : undefined
          }}
        >
          <CalendarCheck className={`w-5 h-5 ${formData.serviceType === "fixPrice" ? "" : "text-neutral-400"}`} />
          <span>Reservation</span>
        </button>
        <button 
          onClick={() => {
            // Switch to Rental
            updateFormData("serviceType", "rental");
            updateFormData("bookingType", "rental");
            
            // Cleanup Reservation Data
            updateFormData("selectedRoute", null);
            updateFormData("selectedVehicleClass", null);
            updateFormData("pickupTime", "");
            updateFormData("orderId", null); // Reset order
            updateFormData("selectedVehicle", null);
          }} 
          className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
            formData.serviceType === "rental" 
              ? "shadow-md scale-[1.02]" 
              : "bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-500"
          }`} 
          style={{ 
            backgroundColor: formData.serviceType === "rental" ? hotelData.theme.accentColor : undefined, 
            color: formData.serviceType === "rental" ? hotelData.theme.primaryColor : undefined,
            borderColor: formData.serviceType === "rental" ? 'transparent' : undefined
          }}
        >
          <Car className={`w-5 h-5 ${formData.serviceType === "rental" ? "" : "text-neutral-400"}`} />
          <span>Car Rental</span>
        </button>
      </div>

      {/* With Driver Toggle */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">
          Driver Service <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => updateFormData("withDriver", !formData.withDriver)}
            className="relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: formData.withDriver ? hotelData.theme.accentColor : '#9CA3AF',
              focusRingColor: hotelData.theme.accentColor
            }}
            aria-label={`Switch to ${formData.withDriver ? 'Self Drive' : 'With Driver'}`}
          >
            <span 
              className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out"
              style={{
                transform: formData.withDriver ? 'translateX(28px)' : 'translateX(0)'
              }}
            />
          </button>

          <span 
            className="font-semibold text-neutral-900 transition-all duration-300 min-w-[100px]"
            role="status"
          >
            {formData.withDriver ? 'With Driver' : 'Self Drive'}
          </span>
        </div>
      </div>

      {/* Pickup Location */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">
          Pickup Location <span className="text-red-500">*</span>
        </label>
        <div className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 bg-neutral-50 text-neutral-600 text-lg flex items-center gap-3">
          <span><MapPin className="w-5 h-5 text-red-500" /></span>
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

      {/* Date and Time Selection (Unified Component) */}
      <DateTimeSection 
         formData={formData}
         updateFormData={updateFormData}
         hotelData={hotelData}
         validation={validation}
         isSubmitting={isSubmitting} // Use local submitting state or pass correct one
      />

      {/* Vehicle Selection Grid - Shows when all fields are valid */}
      {formData.rentalDuration && formData.withDriver !== null && formData.returnLocation && formData.rentalDate && formData.pickupTime && !validation.nightServiceRestricted && (
        <div className="space-y-4 animate-slideDown">
          <h3 className="text-xl font-bold text-neutral-800">Choose Your Vehicle</h3>
          <p className="text-sm text-neutral-600">
            {formData.withDriver ? "With Driver" : "Self Drive"} • {rentalDurations.find(d => d.value === formData.rentalDuration)?.label}
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {(availableCars.length > 0 ? availableCars : rentalVehicles).map((vehicle) => {
              // Handle both API response structure and Mock data structure
              // API cars have .id, .name, .image, .start_from_price
              const price = availableCars.length > 0 
                  ? (vehicle.start_from_price || 0) 
                  : getVehiclePrice(vehicle);
              
              const isSelected = formData.selectedVehicle?.id === vehicle.id;

              return (
                <button
                  key={vehicle.id}
                  disabled={isSubmitting}
                  onClick={async () => {
                    try {
                      setIsSubmitting(true);
                      console.log('[Rental] Submitting Car Selection:', vehicle.id);
                      
                      // Update form data
                      updateFormData("selectedVehicle", vehicle);
                      
                      // Call API to submit car selection
                      const response = await EvistaAPI.cars.submitCarSelection(vehicle.id, 'rental');
                      console.log('[Rental] Car Submit Response:', response);

                      if (response.code === 200) {
                          if (onContinue) onContinue();
                      } else {
                          console.error('[Rental] Car submit failed:', response.message);
                      }
                    } catch (err) {
                      console.error('[Rental] Error selecting car:', err);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
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
                      <p className="text-sm text-neutral-600 mb-2 capitalize">{vehicle.vehicleClass || vehicle.category || 'Standard'}</p>
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
