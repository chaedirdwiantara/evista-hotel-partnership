"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import AboutPartnership from "@/components/AboutPartnership";
import FleetShowcase from "@/components/FleetShowcase";
import BookingForm from "@/components/BookingForm";
import CuratedDestinations from "@/components/CuratedDestinations";
import Footer from "@/components/Footer";

export default function HotelPageContent({ hotelData }) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleBookVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    document.getElementById('booking-form')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <main className="min-h-screen">
      <Hero hotelData={hotelData} />
      <AboutPartnership hotelData={hotelData} />
      <FleetShowcase 
        hotelData={hotelData} 
        onBook={handleBookVehicle} 
      />
      <CuratedDestinations hotelData={hotelData} />
      <BookingForm 
        hotelData={hotelData} 
        preSelectedVehicle={selectedVehicle}
      />
      <Footer hotelData={hotelData} />
    </main>
  );
}
