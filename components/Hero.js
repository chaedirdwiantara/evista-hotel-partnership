"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function Hero({ hotelData }) {
  const { theme, hero, name } = hotelData;

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Placeholder - Replace with actual image */}
      <div 
        className="absolute inset-0 image-placeholder"
        style={{
          background: hero.backgroundPlaceholder || 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
        }}
      >
        {/* Optional: Show placeholder text during development */}
        <span className="text-sm opacity-30">Hero Background Image</span>
      </div>

      {/* Gradient Overlay */}
      <div className="gradient-overlay" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 20,
            delay: 0.2 
          }}
          className="max-w-4xl"
        >
          {/* Evista x Hotel Logo Area */}
          <div className="mb-8 flex items-center justify-center gap-4">
            <div className="w-20 h-20 image-placeholder rounded-full">
              <span className="text-xs">Evista</span>
            </div>
            <span className="text-white text-2xl font-light">×</span>
            <div className="w-20 h-20 image-placeholder rounded-full">
              <span className="text-xs">Hotel</span>
            </div>
          </div>

          <h1 
            className="text-5xl md:text-7xl lg:text-8xl text-white mb-6 text-shadow-lg"
            style={{ color: theme.accent }}
          >
            {hero.title}
          </h1>
          
          <p className="text-xl md:text-2xl text-neutral-200 mb-12 font-light">
            {hero.subtitle}
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary"
            style={{
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}dd 100%)`,
            }}
            onClick={() => {
              document.getElementById('booking-form')?.scrollIntoView({ 
                behavior: 'smooth' 
              });
            }}
          >
            Reserve Your Ride
          </motion.button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12"
        >
          <ChevronDown className="w-8 h-8 text-white opacity-60" />
        </motion.div>
      </div>
    </section>
  );
}
