/**
 * Journey Utilities
 * 
 * Pure utility functions for journey-related calculations and determinations.
 * Extracted from Step1JourneyBuilder.js (lines 31-39, 44, 328-334)
 */

/**
 * Get current price based on selections (for fixed routes)
 * @param {Object} formData - Form data object
 * @param {Object} hotelData - Hotel configuration data
 * @returns {number|null} Current price or null if not available
 */
export function getCurrentPrice(formData, hotelData) {
  if (!formData.selectedRoute || !formData.selectedVehicleClass) return null;
  
  const route = hotelData.routes?.find(r => r.id === formData.selectedRoute);
  if (!route) return null;
  
  const pricing = route.pricing?.[formData.selectedVehicleClass];
  if (!pricing) return null;
  
  return formData.isRoundTrip ? pricing.roundTrip : pricing.oneWay;
}

/**
 * Determine which route selection type is active
 * @param {Object} formData - Form data object
 * @returns {'fixed'|'manual'|null} Route selection type
 */
export function getRouteSelectionType(formData) {
  if (formData.selectedRoute) return 'fixed';
  if (formData.manualDestination) return 'manual';
  return null;
}

/**
 * Determine if date/time section should be shown
 * @param {Object} formData - Form data object
 * @returns {boolean}
 */
export function shouldShowDateTime(formData) {
  return (formData.selectedRoute || formData.manualDestination) || formData.bookingType === 'rental';
}

/**
 * Determine if vehicle selection section should be shown
 * @param {Object} formData - Form data object
 * @param {boolean} isSubmitting - Whether journey is currently being submitted
 * @returns {boolean}
 */
export function shouldShowVehicleSelection(formData, isSubmitting) {
  // Check if round trip is selected but return details are missing
  if (formData.isRoundTrip && (!formData.returnDate || !formData.returnTime)) {
    return false;
  }
  
  return formData.orderId && !isSubmitting;
}

/**
 * Create hotel pickup location object
 * @param {Object} hotelData - Hotel configuration data
 * @returns {Object} Pickup location object
 */
export function createHotelPickupLocation(hotelData) {
  return {
    lat: hotelData.coordinates?.lat || -6.1680722,
    lng: hotelData.coordinates?.lng || 106.8349,
    label: hotelData.name || 'Classic Hotel',
    name: hotelData.name || 'Classic Hotel',
    address: hotelData.address || 'Jl. K.H. Samanhudi No. 43-45, Pasar Baru, Jakarta Pusat',
  };
}

/**
 * Create destination location object from route
 * @param {Object} route - Selected route object
 * @returns {Object} Destination location object
 */
export function createDestinationLocation(route) {
  return {
    lat: route.destination?.lat || -6.2382699,
    lng: route.destination?.lng || 106.8553428,
    label: route.name || 'Destination',
    address: route.description || '',
  };
}
