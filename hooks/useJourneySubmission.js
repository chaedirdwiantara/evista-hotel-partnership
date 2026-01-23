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
 * @returns {Object} Submission state and functions
 */
export function useJourneySubmission(formData, hotelData) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Check if journey is ready to be submitted
   * @returns {boolean}
   */
  const isReadyToSubmit = () => {
    const hasDestination = formData.selectedRoute || formData.manualDestination;
    if (!hasDestination) return false;
    
    const isRental = formData.bookingType === 'rental';
    const dateField = isRental ? 'rentalDate' : 'pickupDate';
    const currentDate = formData[dateField];
    
    const hasDateTime = currentDate && formData.pickupTime;
    if (!hasDateTime) return false;
    
    // Time validation is handled by useDateTimeValidation hook
    // We'll assume it's valid here as this check is done externally
    
    if (formData.bookingType === 'rental') {
      const hasRentalFields = formData.withDriver !== null && formData.rentalDuration && formData.returnLocation;
      if (!hasRentalFields) return false;
    }
    
    if (formData.orderId) return false;
    
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
      const isRental = formData.bookingType === 'rental';
      const dateField = isRental ? 'rentalDate' : 'pickupDate';
      const currentDate = formData[dateField];
      
      let tripData = {
        order_type: orderType,
        pickup_at: `${currentDate} ${formData.pickupTime}:00`,
      };

      // Set pickup and destination for fixed routes
      if (formData.selectedRoute) {
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

      // Add rental-specific fields
      if (formData.bookingType === 'rental') {
        tripData.return_at = `${formData.returnDate} ${formData.returnTime}:00`;
        tripData.is_with_driver = formData.withDriver ? 1 : 0;
        tripData.is_same_return_location = formData.returnLocation === formData.pickupLocation ? 1 : 0;
      }

      // Submit trip
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
   * Select car for fixed routes (after journey submission)
   * @param {string} carId - Car ID to select
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
