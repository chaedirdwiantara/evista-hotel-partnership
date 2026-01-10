/**
 * Manual Destination Pricing Logic
 * Calculates pricing for manual destinations with round trip support
 */

/**
 * Calculate round trip price with discount
 * Formula: (one-way price × 2) - 10,000
 * @param {number} oneWayPrice - One-way trip price
 * @returns {number} Round trip price
 */
export function calculateRoundTripPrice(oneWayPrice) {
  return (oneWayPrice * 2) - 10000;
}

/**
 * Calculate base price based on distance
 * @param {number} distance - Distance in kilometers
 * @param {Object} vehicle - Vehicle object with priceMultiplier
 * @returns {number} Base price for one-way trip
 */
export function calculateDistancePrice(distance, vehicle) {
  // Base rate per kilometer (will be replaced with actual API calculation)
  const BASE_RATE_PER_KM = 15000;
  
  const vehicleMultiplier = vehicle.priceMultiplier || 1;
  return Math.round(BASE_RATE_PER_KM * distance * vehicleMultiplier);
}

/**
 * Calculate final price for manual destination
 * @param {number} distance - Distance in kilometers
 * @param {Object} vehicle - Vehicle object
 * @param {boolean} isRoundTrip - Whether it's a round trip
 * @returns {number} Final price
 */
export function calculateManualDestinationPrice(distance, vehicle, isRoundTrip = false) {
  const oneWayPrice = calculateDistancePrice(distance, vehicle);
  
  if (isRoundTrip) {
    return calculateRoundTripPrice(oneWayPrice);
  }
  
  return oneWayPrice;
}

/**
 * Format price to Indonesian Rupiah
 * @param {number} price - Price amount
 * @returns {string} Formatted price
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Calculate estimated distance between two points (Haversine formula)
 * This is a temporary solution until we integrate with Google Distance Matrix API
 * @param {number} lat1 - Origin latitude
 * @param {number} lon1 - Origin longitude
 * @param {number} lat2 - Destination latitude
 * @param {number} lon2 - Destination longitude
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  // Add 30% buffer for road distance (straight line vs actual road)
  return Math.round(distance * 1.3);
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
