/**
 * Hotel Configuration Store
 * 
 * This file contains mock data for each hotel partner.
 * In production, this would be fetched from a database or CMS.
 * 
 * Structure:
 * - hotelData: Object containing all hotel configurations
 * - getHotelBySlug: Function to retrieve specific hotel data
 * - getAllHotelSlugs: Function to get all available hotel identifiers
 */

export const hotelData = {
  "grand-plaza-jakarta": {
    name: "The Grand Plaza Jakarta",
    slug: "grand-plaza-jakarta",
    theme: {
      primary: "#C9A961", // Champagne Gold
      secondary: "#1a1a1a", // Rich Black
      accent: "#f5f5f0", // Cream
    },
    hero: {
      title: "Your Journey Begins in Elegance",
      subtitle: "Experience sustainable luxury with Evista's electric fleet",
      // When adding images, use: backgroundImage: "/assets/hotels/backgrounds/grand-plaza.jpg"
      backgroundPlaceholder: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
    },
    branding: {
      // When adding images, use: logo: "/assets/hotels/logos/grand-plaza-logo.png"
      address: "Jl. MH Thamrin No.1, Jakarta Pusat",
      contactPhone: "+62 21 2358 0000",
    },
    fleet: [
      {
        id: 1,
        name: "Tesla Model S",
        category: "Luxury Sedan",
        capacity: "4 passengers",
        features: ["Premium Sound", "Panoramic Roof", "Executive Comfort"],
        // When adding images, use: image: "/assets/hotels/vehicles/tesla-s.jpg"
      },
      {
        id: 2,
        name: "Mercedes EQS",
        category: "Ultra Luxury",
        capacity: "4 passengers",
        features: ["MBUX System", "First Class Rear", "Ambient Lighting"],
      },
      {
        id: 3,
        name: "Tesla Model X",
        category: "Premium SUV",
        capacity: "6 passengers",
        features: ["Falcon Wing Doors", "Spacious Interior", "Maximum Luggage"],
      },
    ],
    curatedDestinations: [
      {
        name: "Pacific Place Mall",
        description: "High-end shopping experience",
        distance: "2.5 km",
      },
      {
        name: "National Monument (Monas)",
        description: "Iconic Jakarta landmark",
        distance: "1.2 km",
      },
      {
        name: "SKYE Bar & Restaurant",
        description: "Fine dining with skyline views",
        distance: "3.8 km",
      },
    ],
    gallery: [
      // When adding images, add paths like: "/assets/hotels/gallery/grand-plaza-1.jpg"
    ],
  },
  
  "royal-beach-bali": {
    name: "Royal Beach Resort Bali",
    slug: "royal-beach-bali",
    theme: {
      primary: "#2C5F2D", // Forest Green
      secondary: "#1F1F1F",
      accent: "#FAF8F3",
    },
    hero: {
      title: "Paradise Awaits Your Arrival",
      subtitle: "Eco-conscious travel meets tropical luxury",
      backgroundPlaceholder: "linear-gradient(135deg, #1F4E3D 0%, #2C5F2D 100%)",
    },
    branding: {
      address: "Jl. Pratama No.88, Nusa Dua, Bali",
      contactPhone: "+62 361 773 377",
    },
    fleet: [
      {
        id: 1,
        name: "IONIQ 5",
        category: "Modern Electric",
        capacity: "5 passengers",
        features: ["Beach Gear Storage", "Climate Control", "Panoramic View"],
      },
      {
        id: 2,
        name: "BMW iX",
        category: "Premium SUV",
        capacity: "5 passengers",
        features: ["Luxurious Comfort", "Advanced Safety", "Quiet Cabin"],
      },
    ],
    curatedDestinations: [
      {
        name: "Uluwatu Temple",
        description: "Cliffside temple with ocean views",
        distance: "15 km",
      },
      {
        name: "Seminyak Beach",
        description: "Sunset and fine dining",
        distance: "12 km",
      },
      {
        name: "Nusa Dua Beach",
        description: "Pristine white sand beach",
        distance: "2 km",
      },
    ],
    gallery: [],
  },
};

/**
 * Get hotel data by slug
 * 
 * @param {string} slug - Hotel identifier (e.g., "grand-plaza-jakarta")
 * @returns {Object|null} Hotel configuration object or null if not found
 */
export function getHotelBySlug(slug) {
  return hotelData[slug] || null;
}

/**
 * Get all hotel slugs (for static generation)
 * 
 * @returns {string[]} Array of hotel slugs
 */
export function getAllHotelSlugs() {
  return Object.keys(hotelData);
}
