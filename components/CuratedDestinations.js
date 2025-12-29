"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";

/**
 * CuratedDestinations Component
 * 
 * Displays curated destinations near the hotel with booking integration.
 * 
 * @param {Object} hotelData - Hotel configuration containing destinations and theme
 */
export default function CuratedDestinations({ hotelData }) {
  const { theme, curatedDestinations, name } = hotelData;

  if (!curatedDestinations || curatedDestinations.length === 0) {
    return null;
  }

  return (
    <section className="section-container bg-neutral-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 70, damping: 20 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl mb-4" style={{ color: theme.secondary }}>
          Curated Experiences
        </h2>
        <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
          Discover the finest destinations near {name}. Let us take you there in comfort.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {curatedDestinations.map((destination, index) => (
          <DestinationCard
            key={index}
            destination={destination}
            theme={theme}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Individual Destination Card Component
 */
function DestinationCard({ destination, theme, index }) {
  const handleBookRide = () => {
    // Scroll to booking form with pre-filled destination
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
      bookingForm.scrollIntoView({ behavior: 'smooth' });
      // In production, you would also pre-fill the destination field
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 70,
        damping: 20,
        delay: index * 0.1 
      }}
      viewport={{ once: true }}
      className="card-luxury p-6 hover:shadow-xl"
    >
      <div className="flex items-start justify-between mb-3">
        <MapPin className="w-6 h-6 flex-shrink-0" style={{ color: theme.primary }} />
        <span className="text-sm text-neutral-500">{destination.distance}</span>
      </div>

      <h3 className="text-xl font-semibold mb-2" style={{ color: theme.secondary }}>
        {destination.name}
      </h3>

      <p className="text-neutral-600 mb-4 text-sm">
        {destination.description}
      </p>

      <button
        onClick={handleBookRide}
        className="flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:gap-3"
        style={{ color: theme.primary }}
      >
        Book a Ride
        <Navigation className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
