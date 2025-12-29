"use client";

import { motion } from "framer-motion";
import { Car, Zap, Wind, Sparkles } from "lucide-react";

/**
 * FleetShowcase Component
 * 
 * Displays the available electric vehicle fleet for the hotel partner.
 * Features responsive grid layout and hover effects for premium feel.
 * 
 * @param {Object} hotelData - Hotel configuration containing fleet data and theme
 */
export default function FleetShowcase({ hotelData, onBook }) {
  const { theme, fleet } = hotelData;

  return (
    <section className="section-container bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 70, damping: 20 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl mb-4" style={{ color: theme.secondary }}>
          Our Electric Fleet
        </h2>
        <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
          Experience whisper-quiet luxury. Every vehicle is meticulously maintained and equipped with premium amenities.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {fleet.map((vehicle, index) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            theme={theme}
            index={index}
            onBook={onBook}
          />
        ))}
      </div>

      <SustainabilityBadge />
    </section>
  );
}

/**
 * Individual Vehicle Card Component
 */
function VehicleCard({ vehicle, theme, index, onBook }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 70,
        damping: 20,
        delay: index * 0.1 
      }}
      viewport={{ once: true }}
      className="card-luxury group"
    >
      {/* Vehicle Image Placeholder */}
      <div className="aspect-video w-full image-placeholder relative overflow-hidden">
        <span className="text-sm">{vehicle.name}</span>
        {/* When adding real images: */}
        {/* <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" /> */}
        
        {/* Gradient Overlay on Hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${theme.primary}40 100%)`
          }}
        />
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-2xl font-semibold mb-1" style={{ color: theme.secondary }}>
              {vehicle.name}
            </h3>
            <p className="text-sm uppercase tracking-wide" style={{ color: theme.primary }}>
              {vehicle.category}
            </p>
          </div>
          <Car className="w-6 h-6 text-neutral-400" />
        </div>

        <p className="text-neutral-600 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: theme.primary }} />
          {vehicle.capacity}
        </p>

        <div className="space-y-2">
          {vehicle.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-neutral-600">
              <Sparkles className="w-4 h-4" style={{ color: theme.primary }} />
              {feature}
            </div>
          ))}
        </div>

        <button
          onClick={() => onBook && onBook(vehicle)}
          className="w-full mt-6 py-3 px-4 text-sm uppercase tracking-wider font-medium text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          style={{ 
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}dd 100%)`,
            borderRadius: '2px'
          }}
        >
          Book This Car
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Sustainability Badge Component
 */
function SustainabilityBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 70,
        damping: 20,
        delay: 0.3 
      }}
      viewport={{ once: true }}
      className="mt-16 text-center"
    >
      <div className="inline-flex items-center gap-3 px-6 py-4 rounded-full bg-emerald-50 border border-emerald-200">
        <Wind className="w-5 h-5 text-emerald-600" />
        <span className="text-emerald-800 font-medium">100% Zero Emission Fleet</span>
      </div>
    </motion.div>
  );
}
