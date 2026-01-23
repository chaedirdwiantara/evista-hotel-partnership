"use client";

import { Car, CalendarCheck } from 'lucide-react';

/**
 * ServiceTypeTabs Component
 * 
 * Service type selection tabs (Reservation vs Car Rental).
 * Extracted from Step1JourneyBuilder.js (lines 346-388)
 * 
 * @param {Object} props
 * @param {string} props.serviceType - Current service type ('fixPrice' or 'rental')
 * @param {Function} props.onServiceTypeChange - Handler for service type change
 * @param {Object} props.hotelData - Hotel configuration for theme
 */
export default function ServiceTypeTabs({ serviceType, onServiceTypeChange, hotelData }) {
  return (
    <div className="flex gap-4">
      <button 
        onClick={() => onServiceTypeChange("fixPrice", "airport")} 
        className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
          serviceType === "fixPrice" 
            ? "shadow-md scale-[1.02]" 
            : "bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-500"
        }`} 
        style={{ 
          backgroundColor: serviceType === "fixPrice" ? hotelData.theme.accentColor : undefined, 
          color: serviceType === "fixPrice" ? hotelData.theme.primaryColor : undefined,
          borderColor: serviceType === "fixPrice" ? 'transparent' : undefined
        }}
      >
        <CalendarCheck className={`w-5 h-5 ${serviceType === "fixPrice" ? "" : "text-neutral-400"}`} />
        <span>Reservation</span>
      </button>
      
      {hotelData.services.rental.enabled && (
        <button 
          onClick={() => onServiceTypeChange("rental", "rental")} 
          className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
            serviceType === "rental" 
              ? "shadow-md scale-[1.02]" 
              : "bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-500"
          }`} 
          style={{ 
            backgroundColor: serviceType === "rental" ? hotelData.theme.accentColor : undefined, 
            color: serviceType === "rental" ? hotelData.theme.primaryColor : undefined,
            borderColor: serviceType === "rental" ? 'transparent' : undefined
          }}
        >
          <Car className={`w-5 h-5 ${serviceType === "rental" ? "" : "text-neutral-400"}`} />
          <span>Car Rental</span>
        </button>
      )}
    </div>
  );
}
