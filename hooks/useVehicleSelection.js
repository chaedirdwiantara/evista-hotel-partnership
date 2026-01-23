import { useState } from 'react';
import { getCarList, setRoundTrip } from '@/lib/manual-destination-api';
import { EvistaAPI } from '@/lib/evista-api';

/**
 * Custom Hook: useVehicleSelection
 * 
 * Handles vehicle selection logic for manual destinations.
 * Extracted from Step1JourneyBuilder.js (lines 197-211, 290-316)
 * 
 * @returns {Object} Vehicle selection state and functions
 */
export function useVehicleSelection() {
  const [availableCars, setAvailableCars] = useState([]);
  const [isLoadingCars, setIsLoadingCars] = useState(false);

  /**
   * Filter cars based on allowed IDs
   * Only Premium (2) and Economy+ (9) are allowed
   * @param {Array} rawCars - Raw car list from API
   * @returns {Array} Filtered car list
   */
  const filterAllowedCars = (rawCars) => {
    const allowedCarIds = [2, 9]; // Premium (2), Economy+ (9)
    return rawCars.filter(car => allowedCarIds.includes(car.id));
  };

  /**
   * Load available cars for manual destinations
   * @param {string} orderType - 'later' or 'rental'
   * @returns {Promise<Array>} List of available cars
   */
  const loadAvailableCars = async (orderType = 'later') => {
    try {
      setIsLoadingCars(true);
      const rawCars = await getCarList(orderType);
      const filteredCars = filterAllowedCars(rawCars);
      setAvailableCars(filteredCars);
      return filteredCars;
    } catch (error) {
      console.error('[Vehicle Selection] Error loading cars:', error);
      setAvailableCars([]);
      return [];
    } finally {
      setIsLoadingCars(false);
    }
  };

  /**
   * Handle car selection (for manual destinations)
   * @param {Object} car - Selected car object
   * @param {string} orderType - 'later' or 'rental'
   * @param {Function} updateFormData - Form data update function
   */
  const handleCarSelect = async (car, orderType, updateFormData) => {
    try {
      updateFormData('selectedVehicleClass', car.id);
      updateFormData('backendCarData', car);
      
      const response = await EvistaAPI.cars.selectCar(car.id, orderType);
      
      if (response.code === 200 && response.order?.id) {
        updateFormData('orderId', response.order.id);
      }
    } catch (error) {
      console.error('[Car Selection] Error:', error);
    }
  };

  /**
   * Update round trip and refresh car list
   * @param {boolean} isRoundTrip - Round trip status
   * @param {string} orderType - 'later' or 'rental'
   * @param {number} selectedVehicleClassId - Currently selected vehicle class ID
   * @param {Function} updateFormData - Form data update function
   */
  const updateRoundTripAndRefreshCars = async (isRoundTrip, orderType, selectedVehicleClassId, updateFormData) => {
    try {
      setIsLoadingCars(true);
      
      // Update round trip status
      await setRoundTrip(isRoundTrip);
      
      // Refresh car list
      const rawCars = await getCarList(orderType);
      const filteredCars = filterAllowedCars(rawCars);
      setAvailableCars(filteredCars);
      
      // Update selected car data if it exists
      if (selectedVehicleClassId) {
        const updatedCar = filteredCars.find(c => c.id === selectedVehicleClassId);
        if (updatedCar) {
          updateFormData('backendCarData', updatedCar);
        }
      }
    } catch (error) {
      console.error('[Vehicle Selection] updateRoundTrip error:', error);
    } finally {
      setIsLoadingCars(false);
    }
  };

  /**
   * Clear vehicle selection
   */
  const clearVehicles = () => {
    setAvailableCars([]);
    setIsLoadingCars(false);
  };

  return {
    availableCars,
    isLoadingCars,
    loadAvailableCars,
    handleCarSelect,
    updateRoundTripAndRefreshCars,
    clearVehicles,
    filterAllowedCars,
  };
}
