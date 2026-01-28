import { useState } from 'react';
import { selectPickupLocation, selectDestination } from '@/lib/manual-destination-api';
import { EvistaAPI } from '@/lib/evista-api';

/**
 * Custom Hook: useJourneySubmission
 * 
 * Handles journey submission logic including API calls and state management.
 * Extracted from Step1JourneyBuilder.js (lines 213-282)
 * 
 * @param {Object} formData - The form data object
 * @param {Object} hotelData - Hotel configuration data
 * @param {Object} validation - Validation states from useDateTimeValidation hook
 * @returns {Object} Submission state and functions
 */
// Helper to calculate return date/time
const calculateReturnDateTime = (pickupDateStr, pickupTimeStr, durationVal) => {
  if (!pickupDateStr || !pickupTimeStr || !durationVal) return "";

  try {
    const startDateTime = new Date(`${pickupDateStr} ${pickupTimeStr}:00`);
    let hoursToAdd = 0;
    
    // Parse duration
    if (durationVal === "6_hours") hoursToAdd = 6;
    else if (durationVal === "12_hours") hoursToAdd = 12;
    else if (durationVal === "24_hours") hoursToAdd = 24;
    else if (durationVal === "2_days") hoursToAdd = 48;
    else if (durationVal === "3_days") hoursToAdd = 72;
    else if (durationVal === "week") hoursToAdd = 168; // 7 * 24
    
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
    return "";
  }
};

export function useJourneySubmission(formData, hotelData, validation) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Check if journey is ready to be submitted
   * @returns {boolean}
   */
  const isReadyToSubmit = () => {
    // For Rental, we don't need destination/route selected initially
    const isRental = formData.bookingType === 'rental';
    
    if (!isRental) {
      const hasDestination = formData.selectedRoute || formData.manualDestination;
      if (!hasDestination) return false;
      
      // Must have a valid route ID (draft trip)
      if (!formData.routeId) return false;
    }
    
    const dateField = isRental ? 'rentalDate' : 'pickupDate';
    const currentDate = formData[dateField];
    
    const hasDateTime = currentDate && formData.pickupTime;
    if (!hasDateTime) return false;
    
    // Validate round trip fields for non-rental bookings
    if (!isRental && formData.isRoundTrip) {
      const hasRoundTripFields = formData.returnDate && formData.returnTime;
      if (!hasRoundTripFields) return false;
    }
    
    // Validate time constraints
    if (validation?.timeIsInvalid) {
         console.log('[Validation] Time is invalid (too early)');
         return false;
    }
    if (validation?.returnDateTimeIsInvalid) {
         console.log('[Validation] Return time invalid');
         return false;
    }
    if (validation?.nightServiceRestricted) {
         console.log('[Validation] Blocked: Urgent Night Service restricted');
         return false;
    }
    
    if (isRental) {
      const hasRentalFields = formData.withDriver !== null && formData.rentalDuration && formData.returnLocation;
      if (!hasRentalFields) {
          console.log('[Validation] Missing rental fields:', { 
              driver: formData.withDriver, 
              duration: formData.rentalDuration, 
              loc: formData.returnLocation 
          });
          return false;
      }
    }
    
    if (formData.orderId) {
         console.log('[Validation] Order ID already exists:', formData.orderId);
         return false;
    }
    
    return true;
  };

  /**
   * Submit journey to create booking order
   * @returns {Promise<Object>} Response with orderId
   */
  const submitJourney = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const orderType = formData.bookingType === 'rental' ? 'rental' : 'later';
      
      let tripData = {};

      if (orderType === 'rental') {
         // Specific Rental Payload
         const returnAt = calculateReturnDateTime(formData.rentalDate, formData.pickupTime, formData.rentalDuration);
         
         tripData = {
          order_type: "rental",
          pickup_at: `${formData.rentalDate} ${formData.pickupTime}:00`,
          return_at: returnAt,
          is_with_driver: formData.withDriver ? 1 : 0,
          is_same_return_location: formData.returnLocation === "classic_hotel" ? 1 : 0,
          hotel_slug: hotelData?.slug
         };
      } else {
        // Standard Trip Payload
        const currentDate = formData.pickupDate;
        tripData = {
          order_type: orderType,
          pickup_at: `${currentDate} ${formData.pickupTime}:00`,
          return_at: formData.isRoundTrip && formData.returnDate && formData.returnTime ? `${formData.returnDate} ${formData.returnTime}:00` : "",
          hotel_slug: hotelData?.slug,
        };

        // Flow 1: Fixed Route
        if (formData.selectedRoute) {
          tripData.route_id = formData.selectedRoute;
          
          // Set Pickup & Destination
          const pickupLocation = {
            lat: hotelData.coordinates?.lat || -6.1680722,
            lng: hotelData.coordinates?.lng || 106.8349,
            label: hotelData.name || 'Classic Hotel',
            address: hotelData.address || 'Jl. K.H. Samanhudi No. 43-45, Pasar Baru, Jakarta Pusat',
          };
          await selectPickupLocation(pickupLocation, orderType);
  
          const selectedRoute = hotelData.routes?.find(r => r.id === formData.selectedRoute);
          const destinationLocation = {
            lat: selectedRoute.destination?.lat || -6.2382699,
            long: selectedRoute.destination?.lng || 106.8553428,
            label: selectedRoute.name || 'Destination',
            address: selectedRoute.description || '',
          };
          await selectDestination(destinationLocation, orderType);
        }
        // Flow 2: Manual Destination
        else if (formData.manualDestination) {
           // Manual logic (route_id excluded)
        }
        else {
           tripData.route_id = formData.isRoundTrip ? 1 : 0;
        }

        if (formData.isRoundTrip && formData.returnDate && formData.returnTime) {
          tripData.return_at = `${formData.returnDate} ${formData.returnTime}:00`;
        }
      }

      // Submit trip
      console.log('[Journey Submission] Payload:', tripData);
      const tripResponse = await EvistaAPI.trips.submit(tripData);
      if (tripResponse.code !== 200) {
        throw new Error(tripResponse.message || 'Failed to create booking order');
      }

      const orderId = tripResponse.data?.id;
      if (!orderId) throw new Error('No order ID returned');

      return { orderId, success: true };

    } catch (err) {
      console.error('[Journey Submission] Error:', err);
      setError(err.message || 'Failed to process journey.');
      return { orderId: null, success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Select car for fixed routes (or rental finalization)
   */
  const selectCarForFixedRoute = async (carId) => {
    try {
      const orderType = formData.bookingType === 'rental' ? 'rental' : 'later';
      await EvistaAPI.cars.selectCar(carId, orderType);
    } catch (err) {
      console.error('[Car Selection] Error:', err);
      throw err;
    }
  };

  return {
    isSubmitting,
    error,
    isReadyToSubmit,
    submitJourney,
    selectCarForFixedRoute,
  };
}
