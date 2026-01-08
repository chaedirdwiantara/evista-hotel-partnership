/**
 * Rental Pricing Utility
 * Calculate rental prices based on vehicle, duration, and driver option
 * Pricing from MOU Table - includes 20% commission
 */

// Pricing Matrix - Using fleet IDs from hotel-config.js
// Durasi hanya 6 Jam dan 12 Jam (1 hari) sesuai tabel MOU
const RENTAL_PRICING_MATRIX = {
  // Economy Class - Wuling Air EV pricing
  "fleet-economy-1": { // Wuling Bingou
    "6_hours": { withDriver: 700000, selfDrive: 500000 },
    "12_hours": { withDriver: 1100000, selfDrive: 700000 },
  },
  "fleet-economy-2": { // NETA V
    "6_hours": { withDriver: 700000, selfDrive: 500000 },
    "12_hours": { withDriver: 1100000, selfDrive: 700000 },
  },
  "fleet-economy-3": { // BYD M6
    "6_hours": { withDriver: 700000, selfDrive: 500000 },
    "12_hours": { withDriver: 1100000, selfDrive: 700000 },
  },
  // Premium Class
  "fleet-premium-1": { // BYD Seal
    "6_hours": { withDriver: 1200000, selfDrive: 900000 },
    "12_hours": { withDriver: 2100000, selfDrive: 1800000 },
  },
  "fleet-premium-2": { // Hyundai Ioniq 5
    "6_hours": { withDriver: 1200000, selfDrive: 900000 },
    "12_hours": { withDriver: 2100000, selfDrive: 1800000 },
  },
  // Elite Class
  "fleet-elite-1": { // BYD Denza D9
    "6_hours": { withDriver: 1500000, selfDrive: 1300000 },
    "12_hours": { withDriver: 2800000, selfDrive: 2500000 },
  },
};

/**
 * Calculate rental price
 * @param {string} vehicleId - Vehicle ID from hotel-config (e.g., "fleet-economy-1")
 * @param {string} duration - Duration key ("6_hours" or "12_hours")
 * @param {boolean} withDriver - true for with driver, false for self drive
 * @returns {number} Price in IDR
 */
export function calculateRentalPrice(vehicleId, duration, withDriver) {
  const vehiclePricing = RENTAL_PRICING_MATRIX[vehicleId];
  
  if (!vehiclePricing) {
    console.warn(`No pricing found for vehicle: ${vehicleId}`);
    return 0;
  }
  
  const durationPricing = vehiclePricing[duration];
  
  if (!durationPricing) {
    console.warn(`No pricing found for duration: ${duration}`);
    return 0;
  }
  
  return withDriver ? durationPricing.withDriver : durationPricing.selfDrive;
}

/**
 * Get all available rental durations
 * Only 6 Jam and 12 Jam (1 hari) per MOU table
 */
export function getRentalDurations() {
  return [
    { value: "6_hours", label: "6 Jam", hours: 6 },
    { value: "12_hours", label: "1 hari (12 Jam)", hours: 12 },
  ];
}

/**
 * Format price to IDR currency string
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
