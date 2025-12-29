import { notFound } from "next/navigation";
import { getHotelBySlug } from "@/lib/hotels";
import HotelPageContent from "./HotelPageContent";

/**
 * Dynamic Hotel Landing Page
 * 
 * Generates a unique landing page for each hotel partner based on slug.
 * Example URLs: /hotels/grand-plaza-jakarta, /hotels/royal-beach-bali
 * 
 * @param {Object} params - Route parameters (Promise in Next.js 15+)
 * @param {string} params.slug - Hotel identifier slug
 */
export default async function HotelPage({ params }) {
  const { slug } = await params;
  const hotelData = getHotelBySlug(slug);

  // Return 404 if hotel not found
  if (!hotelData) {
    notFound();
  }

  return <HotelPageContent hotelData={hotelData} />;
}

/**
 * Generate static params for all hotel pages
 * This enables static generation at build time for better performance
 */
export async function generateStaticParams() {
  // In production, fetch this from your database/CMS
  return [
    { slug: "grand-plaza-jakarta" },
    { slug: "royal-beach-bali" },
  ];
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const hotelData = getHotelBySlug(slug);

  if (!hotelData) {
    return {
      title: "Hotel Not Found | Evista",
    };
  }

  return {
    title: `${hotelData.name} × Evista | Luxury Electric Transport`,
    description: `Experience sustainable luxury with Evista's premium electric vehicle service at ${hotelData.name}. ${hotelData.hero.subtitle}`,
    keywords: ["electric vehicle", "luxury transport", "hotel transport", hotelData.name, "Evista"],
  };
}
