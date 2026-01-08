import { getHotelConfig } from "@/lib/hotel-config";
import RentalBookingPageContent from "./RentalBookingPageContent";

// Generate static params for all hotels
export async function generateStaticParams() {
  return [
    { slug: 'classic-hotel' },
    // Add other hotels here as they're configured
  ];
}

export default function RentalBookingPage({ params }) {
  const hotelData = getHotelConfig(params.slug);

  if (!hotelData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral-800">Hotel Not Found</h1>
          <p className="text-neutral-600 mt-2">The requested hotel does not exist.</p>
        </div>
      </div>
    );
  }

  return <RentalBookingPageContent hotelData={hotelData} />;
}
