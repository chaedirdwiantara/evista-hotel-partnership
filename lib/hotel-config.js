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
      whatsapp: "620811953090",  // Admin WhatsApp for bookings
      email: "reservation@classichotel.com",
      phone: "+62-21-XXXXXXX",
    },
    
    assets: {
      logo: "/images/hotels/classic-hotel/branding/classic-hotel-logo.png",
      icon: "/images/branding/classic_hotel_icon.png", // New: Clean icon for header
      evistaLogo: "/images/branding/evista-logo.png",
      evistaIcon: "/images/branding/evista_logo_resmi.png", // UPDATED: Official Logo
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
    
    // Rental Pricing Configuration
    rentalPricing: {
      economy: {
        "6_hours": 350000,
        "12_hours": 600000,
        "24_hours": 900000,
        "2_days": 1700000,
        "3_days": 2400000,
        "week": 4200000,
      },
      premium: {
        "6_hours": 500000,
        "12_hours": 850000,
        "24_hours": 1300000,
        "2_days": 2500000,
        "3_days": 3600000,
        "week": 6000000,
      },
      elite: {
        "6_hours": 750000,
        "12_hours": 1300000,
        "24_hours": 2000000,
        "2_days": 3800000,
        "3_days": 5500000,
        "week": 9000000,
      },
      driverSurchargePercent: 25, // 25% surcharge if with driver
    },
    
    // Fleet Configuration
    fleet: [
      // Economy+ Class Vehicles
      {
        id: "fleet-economy-1",
        name: "Wuling Bingou",
        vehicleClass: "economy",
        category: "sedan",
        capacity: 4,
        features: ["Compact Design", "City-Efficient", "Comfortable Seats"],
        image: "/assets/hotels/vehicles/01_Wuling_Bingou.avif",
        description: "Compact and efficient electric vehicle perfect for city transfers",
        available: true,
      },
      {
        id: "fleet-economy-2",
        name: "NETA V",
        vehicleClass: "economy",
        category: "suv",
        capacity: 5,
        features: ["Spacious Interior", "Smart Technology", "Eco-Friendly"],
        image: "/assets/hotels/vehicles/03_Neta_V.png",
        description: "Modern electric SUV with smart features",
        available: true,
      },
      {
        id: "fleet-economy-3",
        name: "BYD M6",
        vehicleClass: "economy",
        category: "mpv",
        capacity: 7,
        features: ["Family-Sized", "Ample Luggage", "Smooth Ride"],
        image: "/assets/hotels/vehicles/02_BYD_M6.webp",
        description: "Spacious MPV ideal for groups and families",
        available: true,
      },
      
      // Premium Class Vehicles
      {
        id: "fleet-premium-1",
        name: "BYD Seal",
        vehicleClass: "premium",
        category: "sedan",
        capacity: 5,
        features: ["Luxury Interior", "Advanced Safety", "Premium Sound"],
        image: "/assets/hotels/vehicles/04_BYD_SEAL.webp",
        description: "Premium electric sedan with sophisticated design",
        available: true,
      },
      {
        id: "fleet-premium-2",
        name: "Hyundai Ioniq 5",
        vehicleClass: "premium",
        category: "suv",
        capacity: 5,
        features: ["Ultra-Fast Charging", "V2L Technology", "Panoramic Roof"],
        image: "/assets/hotels/vehicles/05_Ionic_5.jpeg",
        description: "Cutting-edge electric SUV with futuristic design",
        available: true,
      },
      
      // Elite Class Vehicles
      {
        id: "fleet-elite-1",
        name: "BYD Denza D9",
        vehicleClass: "elite",
        category: "mpv",
        capacity: 7,
        features: ["Executive Seating", "Premium Materials", "Top-tier Comfort"],
        image: "/assets/hotels/vehicles/06_BYD_DENZA_9.jpg",
        description: "Ultra-luxury MPV with executive-class amenities",
        available: true,
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
    
    // Fix Price Routes will be fetched dynamically from API
    routes: [],
    
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
