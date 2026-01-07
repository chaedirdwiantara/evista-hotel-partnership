"use client";

import BookingForm from "@/components/BookingForm";

export default function RentalBookingPageContent({ hotelData }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={hotelData.assets.logo} 
                alt={hotelData.name}
                className="h-12"
              />
              <div className="h-8 w-px bg-neutral-300"></div>
              <img 
                src={hotelData.assets.evistaLogo} 
                alt="Evista"
                className="h-8"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Book Your Rental Car</h1>
          <p className="text-xl text-purple-100">
            Flexible hourly and daily car rental with optional driver service
          </p>
        </div>
      </div>

      {/* Booking Form */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <BookingForm hotelData={hotelData} bookingType="rental" />
      </div>

      {/* Footer */}
      <div className="bg-neutral-900 text-white py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-neutral-400">
            {hotelData.name} × Evista Electric Vehicle Service
          </p>
          <p className="text-neutral-500 text-sm mt-2">
            Need help? Contact us via WhatsApp: {hotelData.contact.whatsapp}
          </p>
        </div>
      </div>
    </div>
  );
}
