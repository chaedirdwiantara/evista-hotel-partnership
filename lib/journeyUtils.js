/**
 * Journey Utilities
 * 
 * Pure utility functions for journey-related calculations and determinations.
 * Extracted from Step1JourneyBuilder.js (lines 31-39, 44, 328-334)
 */

export const JOURNEY_DIRECTIONS = Object.freeze({
  FROM_HOTEL: 'from_hotel',
  TO_HOTEL: 'to_hotel',
});

export const DEFAULT_JOURNEY_DIRECTION = JOURNEY_DIRECTIONS.FROM_HOTEL;

/**
 * Check whether the hotel is the destination instead of the pickup point.
 * @param {Object} formData - Form data object
 * @returns {boolean}
 */
export function isHotelDestination(formData) {
  return formData?.routeDirection === JOURNEY_DIRECTIONS.TO_HOTEL;
}

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
  return createHotelLocation(hotelData);
}

/**
 * Create hotel location object.
 * Kept separate from pickup semantics so the hotel can be either endpoint.
 * @param {Object} hotelData - Hotel configuration data
 * @returns {Object} Location object
 */
export function createHotelLocation(hotelData) {
  // Try to get pickup data from the first route since it's dynamically populated
  const firstRoutePickup = hotelData?.routes?.[0]?.pickup;
  const lng = firstRoutePickup?.lng ?? firstRoutePickup?.long ?? hotelData?.coordinates?.lng;

  return {
    lat: firstRoutePickup?.lat || hotelData?.coordinates?.lat,
    lng,
    long: lng,
    label: hotelData?.name,
    name: hotelData?.name,
    address: firstRoutePickup?.address || hotelData?.address,
  };
}

/**
 * Create destination location object from route
 * @param {Object} route - Selected route object
 * @returns {Object} Destination location object
 */
export function createDestinationLocation(route) {
  const destination = route?.destination || {};
  const lng = destination.lng ?? destination.long;

  return {
    lat: destination.lat,
    lng,
    long: lng,
    label: route?.name || 'Destination',
    name: route?.name || 'Destination',
    address: route?.description || destination.address || '',
  };
}

/**
 * Get the non-hotel endpoint name from a fixed route.
 * @param {Object} route - Selected route object
 * @returns {string}
 */
export function getRouteExternalLocationName(route) {
  const routeName = route?.name || '';
  const trimmedRouteName = routeName.replace(/^(classic hotel|hotel classic)\s*-\s*/i, '').trim();

  return route?.destination?.name
    || route?.destination?.label
    || trimmedRouteName
    || routeName
    || 'Selected location';
}

/**
 * Create pickup and destination location pair based on the selected direction.
 * @param {Object} params
 * @param {Object} params.formData - Current form data
 * @param {Object} params.hotelData - Hotel configuration data
 * @param {Object} [params.route] - Selected fixed route
 * @param {Object} [params.manualLocation] - Selected manual location
 * @returns {{ pickupLocation: Object, destinationLocation: Object }}
 */
export function createJourneyLocations({ formData, hotelData, route, manualLocation }) {
  const hotelLocation = createHotelLocation(hotelData);
  const externalLocation = manualLocation || createDestinationLocation(route);

  if (isHotelDestination(formData)) {
    return {
      pickupLocation: externalLocation,
      destinationLocation: hotelLocation,
    };
  }

  return {
    pickupLocation: hotelLocation,
    destinationLocation: externalLocation,
  };
}

/**
 * Return readable pickup and destination labels for reservation summaries.
 * @param {Object} formData - Current form data
 * @param {Object} hotelData - Hotel configuration data
 * @returns {{ pickup: string, destination: string }}
 */
export function getReservationLocationLabels(formData, hotelData) {
  const hotelName = hotelData?.name || 'Classic Hotel';
  const route = hotelData?.routes?.find(r => r.id === formData?.selectedRoute);
  const externalName = formData?.manualDestination?.name || getRouteExternalLocationName(route);

  if (isHotelDestination(formData)) {
    return {
      pickup: externalName,
      destination: hotelName,
    };
  }

  return {
    pickup: hotelName,
    destination: externalName,
  };
}

/**
 * Return a compact route label with the effective direction.
 * @param {Object} formData - Current form data
 * @param {Object} hotelData - Hotel configuration data
 * @returns {string}
 */
export function getReservationRouteLabel(formData, hotelData) {
  const labels = getReservationLocationLabels(formData, hotelData);
  return `${labels.pickup} to ${labels.destination}`;
}
