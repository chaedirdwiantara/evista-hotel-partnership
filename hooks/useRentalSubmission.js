import { useState, useEffect, useCallback } from 'react';
import { EvistaAPI } from '@/lib/evista-api';
import { getCarList, selectPickupLocation, selectDestination } from '@/lib/manual-destination-api';
import { getRentalDurations } from '@/lib/rental-pricing';
import { RETURN_LOCATIONS } from '@/components/booking/RentalFields';

/**
 * useRentalSubmission Hook
 * 
 * Handles rental trip auto-submission logic:
 * - Selects pickup/destination locations
 * - Submits rental trip to API
 * - Loads available cars
 * 
 * Consolidated from Step1RentalSelection.js (lines 242-376)
 */
export function useRentalSubmission(formData, hotelData, updateFormData) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCars, setAvailableCars] = useState([]);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [error, setError] = useState(null);

  const rentalDurations = getRentalDurations();

  // Helper to get duration in hours
  const getDurationHours = useCallback((durationVal) => {
    const durationObj = rentalDurations.find(d => d.value === durationVal);
    return durationObj ? durationObj.hours : 0;
  }, [rentalDurations]);

  // Helper to calculate return date/time
  const calculateReturnDateTime = useCallback((pickupDateStr, pickupTimeStr, durationVal) => {
    if (!pickupDateStr || !pickupTimeStr || !durationVal) return null;

    try {
      const startDateTime = new Date(`${pickupDateStr}T${pickupTimeStr}:00`);
      const hoursToAdd = getDurationHours(durationVal);
      
      const endDateTime = new Date(startDateTime.getTime() + hoursToAdd * 60 * 60 * 1000);
      
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
  }, [getDurationHours]);

  // Check if all rental fields are filled
  const isReadyToSubmit = useCallback(() => {
    const hasDriver = formData.withDriver !== null && formData.withDriver !== undefined;
    const hasDuration = !!formData.rentalDuration;
    const hasReturnLoc = !!formData.returnLocation;
    const hasDate = !!formData.rentalDate;
    const hasTime = !!formData.pickupTime;
    const noOrder = !formData.orderId;
    
    return hasDriver && hasDuration && hasReturnLoc && hasDate && hasTime && noOrder;
  }, [formData]);

  // Submit rental trip
  const submitRentalTrip = useCallback(async () => {
    if (!isReadyToSubmit() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      console.log('[Rental Hook] Auto-submitting trip...');

      // 1. Select Pickup Location (Hotel)
      const defaultPickup = hotelData.routes?.[0]?.pickup || {};
      const hotelLocation = {
        lat: hotelData.location?.lat || defaultPickup.lat,
        long: hotelData.location?.long || defaultPickup.lng,
        name: hotelData.name,
        address: hotelData.location?.address || defaultPickup.address
      };

      if (!hotelLocation.lat) {
        console.error('[Rental Hook] Missing hotel location data');
        setError('Missing hotel location data');
        return;
      }

      console.log('[Rental Hook] Selecting Pickup:', hotelLocation);
      await selectPickupLocation(hotelLocation, 'rental');

      // 2. Select Destination (Return Location)
      let returnLocationData = {};
      if (formData.returnLocation === 'classic_hotel') {
        returnLocationData = hotelLocation;
      } else {
        const halim = RETURN_LOCATIONS.find(l => l.value === 'halim_airport');
        returnLocationData = {
          lat: halim.lat,
          long: halim.long,
          name: halim.label,
          address: "Jakarta Timur"
        };
      }
      console.log('[Rental Hook] Selecting Return Location:', returnLocationData);
      await selectDestination(returnLocationData, 'rental');

      // 3. Submit Trip
      const durationHours = getDurationHours(formData.rentalDuration);
      
      const tripData = {
        order_type: "rental",
        pickup_at: `${formData.rentalDate} ${formData.pickupTime}:00`,
        rental_duration_h: durationHours,
        hotel_slug: hotelData.slug
      };

      console.log('[Rental Hook] Trip Payload:', tripData);

      const response = await EvistaAPI.trips.submit(tripData);
      console.log('[Rental Hook] Submit Response:', response);
      
      if (response?.data?.id) {
        console.log('[Rental Hook] ✅ Order Created:', response.data.id);
        updateFormData('orderId', response.data.id);
        
        // Now load available cars
        setIsLoadingCars(true);
        try {
          console.log('[Rental Hook] Fetching car list...');
          const cars = await getCarList('rental');
          console.log('[Rental Hook] Cars loaded:', cars);
          setAvailableCars(cars);
        } catch (carError) {
          console.error('[Rental Hook] Failed to load cars:', carError);
          setError('Failed to load available vehicles');
        } finally {
          setIsLoadingCars(false);
        }
      } else {
        console.error('[Rental Hook] Submit succeeded but no ID returned:', response);
        setError('Failed to create rental order');
      }

    } catch (err) {
      console.error('[Rental Hook] Auto-submit error:', err);
      setError(err.message || 'Failed to submit rental booking');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, hotelData, isReadyToSubmit, isSubmitting, getDurationHours, updateFormData]);

  // Clear vehicles (for mode switch)
  const clearVehicles = useCallback(() => {
    setAvailableCars([]);
  }, []);

  return {
    isSubmitting,
    availableCars,
    isLoadingCars,
    error,
    isReadyToSubmit,
    submitRentalTrip,
    clearVehicles,
    getDurationHours,
    calculateReturnDateTime
  };
}
