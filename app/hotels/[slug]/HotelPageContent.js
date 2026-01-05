"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import FixPriceRoutes from "@/components/FixPriceRoutes";
import BookingForm from "@/components/BookingForm";

/**
 * Hotel Landing Page Content
 * Client component with luxury animations and navigation
 */
export default function HotelPageContent({ hotelData }) {
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations on mount
    setIsVisible(true);

    // Handle scroll for navbar
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to booking form
  const scrollToBooking = () => {
    const bookingSection = document.getElementById('services');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div 
      className="relative"
      style={{ 
        "--primary-color": hotelData.theme.primaryColor, 
        "--accent-color": hotelData.theme.accentColor 
      }}
    >
      {/* Navigation Bar */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-white/95 backdrop-blur-lg shadow-lg" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Partnership Logo - Dual Brand */}
          <Link href="/" className="flex items-center gap-4 group">
            {/* Hotel Logo */}
            <div className="relative h-10 w-32 transition-opacity duration-300">
              <Image
                src={hotelData.assets.logo}
                alt={hotelData.name}
                fill
                className="object-contain"
                priority
              />
            </div>
            
            {/* Partnership Separator */}
            <span 
              className="text-2xl font-light transition-colors duration-300"
              style={{ color: scrolled ? hotelData.theme.accentColor : "#ffffff" }}
            >
              ×
            </span>
            
            {/* Evista Logo */}
            <div className="relative h-10 w-24 transition-opacity duration-300">
              <Image
                src={hotelData.assets.evistaLogo}
                alt="Evista"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a 
              href="#routes" 
              className={`font-medium transition-all duration-300 hover:scale-105 ${
                scrolled ? "text-neutral-700 hover:text-amber-600" : "text-white hover:text-amber-300"
              }`}
            >
              Routes
            </a>
            <a 
              href="#fleet" 
              className={`font-medium transition-all duration-300 hover:scale-105 ${
                scrolled ? "text-neutral-700 hover:text-amber-600" : "text-white hover:text-amber-300"
              }`}
            >
              Fleet
            </a>
            <a 
              href="#features" 
              className={`font-medium transition-all duration-300 hover:scale-105 ${
                scrolled ? "text-neutral-700 hover:text-amber-600" : "text-white hover:text-amber-300"
              }`}
            >
              Features
            </a>
            <button 
              onClick={scrollToBooking}
              className="px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{ 
                backgroundColor: hotelData.theme.accentColor,
                color: hotelData.theme.primaryColor 
              }}
            >
              Book Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Gradient Overlay Animation */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent animate-pulse-slow"></div>
        </div>
        
        {/* Floating Particles Effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div 
          className={`relative max-w-6xl mx-auto px-6 py-32 text-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h1 
            className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight"
            style={{ 
              animation: "fadeInUp 1s ease-out",
              textShadow: "0 4px 20px rgba(0,0,0,0.3)" 
            }}
          >
            {hotelData.content.hero.title}
          </h1>
          
          <p 
            className="text-xl md:text-3xl text-neutral-200 mb-12 max-w-3xl mx-auto leading-relaxed"
            style={{ 
              animation: "fadeInUp 1s ease-out 0.2s backwards",
              textShadow: "0 2px 10px rgba(0,0,0,0.3)" 
            }}
          >
            {hotelData.content.hero.subtitle}
          </p>
          
          <button 
            onClick={scrollToBooking}
            className="group relative px-10 py-5 text-xl font-bold rounded-xl overflow-hidden transition-all duration-500 hover:scale-110 hover:shadow-2xl"
            style={{ 
              backgroundColor: hotelData.theme.accentColor,
              color: hotelData.theme.primaryColor,
              animation: "fadeInUp 1s ease-out 0.4s backwards"
            }}
          >
            <span className="relative z-10">{hotelData.content.hero.cta}</span>
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          </button>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-scroll"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neutral-100/50 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto px-6">
          <h2 
            className="text-5xl md:text-6xl font-bold text-center mb-6 animate-fadeIn"
            style={{ color: hotelData.theme.primaryColor }}
          >
            Why Choose {hotelData.name}?
          </h2>
          <div 
            className="w-24 h-1 mx-auto mb-20 animate-expandWidth"
            style={{ backgroundColor: hotelData.theme.accentColor }}
          ></div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {hotelData.content.features.map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-gradient-to-br from-white to-neutral-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-neutral-100"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.2}s backwards`
                }}
              >
                {/* Hover Glow Effect */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                  style={{ 
                    background: `radial-gradient(circle at center, ${hotelData.theme.accentColor}20, transparent)` 
                  }}
                ></div>
                
                <div className="relative">
                  <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-500">
                    {feature.icon}
                  </div>
                  <h3 
                    className="text-2xl font-bold mb-4 group-hover:text-amber-600 transition-colors duration-300"
                    style={{ color: hotelData.theme.primaryColor }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Corner Accent */}
                <div 
                  className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${hotelData.theme.accentColor}20, transparent)`,
                    borderTopRightRadius: "1rem"
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fix Price Routes Section */}
      <div id="routes">
        <FixPriceRoutes 
          routes={hotelData.routes}
          accentColor={hotelData.theme.accentColor}
          primaryColor={hotelData.theme.primaryColor}
        />
      </div>

      {/* Fleet Showcase Section */}
      <section id="fleet" className="py-24 bg-gradient-to-b from-white to-neutral-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ color: hotelData.theme.primaryColor }}
          >
            Our Premium Fleet
          </h2>
          <div 
            className="w-24 h-1 mx-auto mb-8"
            style={{ backgroundColor: hotelData.theme.accentColor }}
          ></div>
          <p className="text-neutral-600 text-lg mb-12 max-w-2xl mx-auto">
            Experience sustainable luxury with our collection of premium electric vehicles
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {hotelData.fleet && hotelData.fleet.map((vehicle, index) => (
              <div 
                key={vehicle.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                style={{animation: `fadeInUp 0.6s ease-out ${index * 0.15}s backwards`}}
              >
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: hotelData.theme.primaryColor }}>
                  {vehicle.name}
                </h3>
                <p className="text-sm text-neutral-600 mb-4">{vehicle.description}</p>
                <div className="text-sm font-semibold" style={{ color: hotelData.theme.accentColor }}>
                  {vehicle.capacity} Passengers
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gradient-to-br from-neutral-50 to-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <h2 
            className="text-5xl md:text-6xl font-bold text-center mb-8 animate-fadeIn"
            style={{ color: hotelData.theme.primaryColor }}
          >
            Our Premium Services
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {hotelData.services.fixPrice.enabled && (
              <span className="px-6 py-3 bg-white rounded-full text-neutral-700 font-medium shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
                ✓ Fixed Price Airport Transfer
              </span>
            )}
            {hotelData.services.rental.enabled && (
              <span className="px-6 py-3 bg-white rounded-full text-neutral-700 font-medium shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
                ✓ Car Rental Service
              </span>
            )}
            {hotelData.services.nightReservation.enabled && (
              <span className="px-6 py-3 bg-white rounded-full text-neutral-700 font-medium shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
                ✓ 24/7 Availability
              </span>
            )}
          </div>
          
          {/* Booking Form */}
          <BookingForm hotelData={hotelData} />
        </div>
      </section>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes expandWidth {
          from { width: 0; }
          to { width: 6rem; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        
        @keyframes scroll {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce 3s ease-in-out infinite;
        }
        
        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
        
        .animate-expandWidth {
          animation: expandWidth 1s ease-out 0.5s backwards;
        }
      `}</style>
    </div>
  );
}
