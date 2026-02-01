"use client";

import { motion } from "framer-motion";
import Image from "next/image";

/**
 * AboutPartnership Component
 * 
 * Displays Evista's competitive advantages through visual benefit cards with custom premium icons.
 * 
 * @param {Object} hotelData - Hotel configuration containing branding and theme
 */
export default function AboutPartnership({ hotelData }) {
  const { theme } = hotelData;

  const benefits = [
    {
      icon: "/assets/icons/evista-benefits/zero-emissions-v2.png",
      title: "Zero Emissions",
      subtitle: "Ramah Lingkungan",
    },
    {
      icon: "/assets/icons/evista-benefits/modern-fleet-v4.png",
      title: "Modern Fleet",
      subtitle: "Mobil Listrik Terkini",
    },
    {
      icon: "/assets/icons/evista-benefits/whisper-quiet-v3.png",
      title: "Whisper Quiet",
      subtitle: "Senyap dan Nyaman",
    },
    {
      icon: "/assets/icons/evista-benefits/better-pricing-v5.png",
      title: "Better Pricing",
      subtitle: "Harga Lebih Hemat",
    },
    {
      icon: "/assets/icons/evista-benefits/professional-driver.png",
      title: "Professional Drivers",
      subtitle: "Sopan dan Terlatih",
    },
    {
      icon: "/assets/icons/evista-benefits/protected-v3.png",
      title: "24/7 Available",
      subtitle: "Siap Kapan Saja",
    }
  ];

  return (
    <section className="py-28 bg-gradient-to-b from-neutral-50 via-white to-neutral-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-amber-100/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-100/20 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 
            className="text-6xl md:text-7xl font-bold mb-8"
            style={{ 
              color: theme.accent || "#d4af37",
              letterSpacing: "-0.02em"
            }}
          >
            The Evista Difference
          </h2>
          <div 
            className="w-32 h-1.5 mx-auto mb-8"
            style={{ backgroundColor: theme.accent || "#d4af37" }}
          ></div>
          <p className="text-neutral-600 text-xl max-w-2xl mx-auto font-medium">
            Experience premium electric transportation designed for your comfort
          </p>
        </motion.div>

        {/* Benefits Grid */}
        {/* Benefits Grid - Horizontal Scroll on Mobile, Grid on Desktop */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 md:max-w-6xl md:mx-auto overflow-x-auto overflow-y-hidden md:overflow-visible snap-x snap-mandatory pb-8 md:pb-0 -mx-6 md:mx-auto px-6 md:px-0 scrollbar-hide">
          {benefits.map((benefit, index) => (
            <div 
              key={benefit.title} 
              className="snap-center shrink-0 w-[80vw] md:w-auto md:first:ml-0 md:last:mr-0"
            >
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                }}
                viewport={{ once: true }}
                className="h-full group relative bg-gradient-to-br from-white to-neutral-50 rounded-3xl p-8 md:p-10 border-2 border-neutral-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >

              <div className="relative">
                {/* Icon */}
                <div className="mb-6 md:mb-8 flex justify-center">
                  <div className="relative w-20 h-20 md:w-24 md:h-24 transform group-hover:scale-110 transition-transform duration-500">
                    <Image 
                      src={benefit.icon} 
                      alt={benefit.title}
                      width={96}
                      height={96}
                      className="object-contain"
                      style={{ mixBlendMode: 'multiply' }}
                      priority={index < 3}
                    />
                  </div>
                </div>

                {/* Title */}
                <h3 
                  className="text-xl md:text-2xl font-extrabold mb-2 md:mb-3 text-center"
                  style={{ 
                    color: theme.primary || "#1a1a1a",
                    letterSpacing: "-0.01em"
                  }}
                >
                  {benefit.title}
                </h3>

                {/* Subtitle */}
                <p className="text-sm md:text-base text-neutral-600 leading-relaxed text-center font-medium">
                  {benefit.subtitle}
                </p>
              </div>
            </motion.div>
            </div>
          ))}
        </div>

        {/* Bottom Info Bar */}

      </div>
    </section>
  );
}
