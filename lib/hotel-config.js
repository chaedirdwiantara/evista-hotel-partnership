/**
 * Hotel Configuration Schema
 * 
 * This file defines the hotel-specific configurations for the landing page.
 * Each hotel has its own configuration object with branding, services, and routes.
 * 
 * When API is ready, this structure will be fetched from the backend instead.
 */

export const hotelConfigs = {
  "classic-hotel": {
    // Basic Information
    name: "Classic Hotel",
    slug: "classic-hotel",
    
    // Branding
    theme: {
      primaryColor: "#1a1a1a",     // Dark elegant color
      accentColor: "#d4af37",       // Gold accent
      backgroundColor: "#ffffff",
      textPrimary: "#1a1a1a",
      textSecondary: "#666666",
    },
    
    // Contact & Assets
    contact: {
      whatsapp: "+6287773845676",  // From Constant.js
      email: "reservation@classichotel.com",
      phone: "+62-21-XXXXXXX",
    },
    
    assets: {
      logo: "/images/hotels/classic-hotel/branding/classic-hotel-logo.png",
      evistaLogo: "/images/branding/evista-logo.png",
      hero: "/images/hotels/classic-hotel/branding/hero-bg.jpg",
      favicon: "/favicon.ico",
    },
    
    // Services Configuration
    services: {
      fixPrice: {
        enabled: true,
        label: "Airport Transfer",
        description: "Pre-configured routes with fixed pricing",
      },
      rental: {
        enabled: true,
        label: "Car Rental",
        description: "Hourly car rental service",
        durations: [
          { hours: 12, label: "12 Hours" },
          { hours: 24, label: "24 Hours" },
        ],
      },
      nightReservation: {
        enabled: true,
        startHour: 0,   // 00:00
        endHour: 6,     // 06:00
        whatsappMessage: "Halo, saya ingin melakukan reservasi kendaraan untuk penjemputan malam hari dari Classic Hotel.",
      },
    },
    
    // Fleet Configuration
    fleet: [
      {
        id: "fleet-1",
        name: "Wuling Air EV",
        category: "sedan",
        capacity: 4,
        features: ["100% Electric", "Panoramic Roof", "Smart Navigation"],
        image: "/images/hotels/classic-hotel/fleet/wuling-air-ev.jpg",
        description: "Compact luxury electric sedan perfect for city transfers",
      },
      {
        id: "fleet-2",
        name: "BYD Atto 3",
        category: "suv",
        capacity: 5,
        features: ["Spacious Interior", "Advanced Safety", "Long Range"],
        image: "/images/hotels/classic-hotel/fleet/byd-atto3.jpg",
        description: "Premium electric SUV with exceptional comfort",
      },
      {
        id: "fleet-3",
        name: "Hyundai Ioniq 5",
        category: "suv",
        capacity: 5,
        features: ["Ultra-Fast Charging", "Luxury Interior", "V2L Technology"],
        image: "/images/hotels/classic-hotel/fleet/hyundai-ioniq5.jpg",
        description: "Cutting-edge electric SUV with futuristic design",
      },
      {
        id: "fleet-4",
        name: "Tesla Model 3",
        category: "sedan",
        capacity: 5,
        features: ["Autopilot", "Premium Sound", "Glass Roof"],
        image: "/images/hotels/classic-hotel/fleet/tesla-model3.jpg",
        description: "The benchmark of electric luxury sedans",
      },
    ],
    
    // Vehicle Class Definitions (from MOU)
    vehicleClasses: [
      { 
        id: "economy", 
        name: "Evista Economy+", 
        vehicles: ["Wuling Bingou", "NETA", "BYD M6"],
        description: "Comfortable and efficient electric vehicles"
      },
      { 
        id: "premium", 
        name: "Evista Premium", 
        vehicles: ["BYD Seal", "Hyundai Ioniq"],
        description: "Premium electric vehicles with enhanced comfort"
      },
      { 
        id: "elite", 
        name: "Evista Elite", 
        vehicles: ["BYD Denza"],
        description: "Luxury electric vehicles for exclusive experience"
      }
    ],
    
    // Fix Price Routes (from MOU with vehicle class pricing)
    routes: [
      {
        id: "route-cgk",
        name: "Classic Hotel ↔ Soekarno-Hatta",
        shortName: "CGK Airport",
        image: "/images/hotels/classic-hotel/routes/cgk-terminal3.jpg",
        pickup: {
          name: "Classic Hotel",
          address: "Jl. Example No. 123, Jakarta",
          lat: -6.2088,
          lng: 106.8456,
        },
        destination: {
          name: "Bandara Soekarno-Hatta",
          address: "Terminal 2/3, Tangerang",
          lat: -6.1256,
          lng: 106.6559,
        },
        estimatedDuration: 60,
        distance: 35,
        // Pricing per vehicle class from MOU
        pricing: {
          economy: { oneWay: 220000, roundTrip: 430000 },
          premium: { oneWay: 290000, roundTrip: 570000 },
          elite: { oneWay: 440000, roundTrip: 870000 }
        }
      },
      {
        id: "route-hlp",
        name: "Classic Hotel ↔ Halim Perdanakusuma",
        shortName: "HLP Airport",
        image: "/images/hotels/classic-hotel/routes/halim-airport.jpg",
        pickup: {
          name: "Classic Hotel",
          address: "Jl. Example No. 123, Jakarta",
          lat: -6.2088,
          lng: 106.8456,
        },
        destination: {
          name: "Bandara Halim Perdanakusuma",
          address: "Halim Perdanakusuma, Jakarta Timur",
          lat: -6.2666,
          lng: 106.8911,
        },
        estimatedDuration: 45,
        distance: 25,
        // Pricing per vehicle class from MOU
        pricing: {
          economy: { oneWay: 230000, roundTrip: 450000 },
          premium: { oneWay: 360000, roundTrip: 710000 },
          elite: { oneWay: 510000, roundTrip: 1000000 }
        }
      },
    ],
    
    // UI Copy & Content
    content: {
      hero: {
        title: "Premium Electric Vehicle Service",
        subtitle: "Exclusive for Classic Hotel Guests",
        cta: "Book Your Ride",
      },
      features: [
        {
          icon: "⚡",
          title: "100% Electric",
          description: "Eco-friendly luxury vehicles",
        },
        {
          icon: "💎",
          title: "Premium Service",
          description: "Professional drivers and top-tier cars",
        },
        {
          icon: "💰",
          title: "Fixed Pricing",
          description: "No surge pricing, clear rates",
        },
      ],
    },
  },
  
  // Future hotels can be added here following the same schema
  // "swiss-belinn": { ... },
};

/**
 * Get hotel configuration by slug
 * @param {string} slug - Hotel slug (e.g., "classic-hotel")
 * @returns {Object|null} Hotel configuration or null if not found
 */
export function getHotelConfig(slug) {
  return hotelConfigs[slug] || null;
}

/**
 * Get all available hotel slugs
 * @returns {string[]} Array of hotel slugs
 */
export function getAllHotelSlugs() {
  return Object.keys(hotelConfigs);
}

/**
 * Validate if a hotel exists
 * @param {string} slug - Hotel slug
 * @returns {boolean} True if hotel exists
 */
export function hotelExists(slug) {
  return slug in hotelConfigs;
}
