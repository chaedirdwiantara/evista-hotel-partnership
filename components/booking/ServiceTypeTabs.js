"use client";

import { Car, CalendarCheck } from 'lucide-react';

/**
 * ServiceTypeTabs Component
 * 
 * Service type selection tabs (Reservation vs Car Rental).
 * Redesigned as a modern Segmented Control (Pill-shaped).
 */
export default function ServiceTypeTabs({ serviceType, onServiceTypeChange, hotelData }) {
  const tabs = [
    { id: "fixPrice", label: "Reservation", icon: CalendarCheck, type: "reservation" },
    ...(hotelData.services.rental.enabled ? [{ id: "rental", label: "Car Rental", icon: Car, type: "rental" }] : [])
  ];

  return (
    <div className="bg-neutral-100 p-1.5 rounded-2xl flex relative w-full gap-1">
      {tabs.map((tab) => {
        const isActive = serviceType === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onServiceTypeChange(tab.id, tab.type)}
            className={`
              flex-1 relative flex items-center justify-center gap-2.5 py-3.5 px-4 text-sm font-semibold rounded-xl
              transition-all duration-300 ease-out
              ${isActive 
                ? 'shadow-md' 
                : 'text-neutral-500 hover:text-neutral-700'
              }
            `}
            style={{
              backgroundColor: isActive ? hotelData.theme.accentColor : undefined,
              color: isActive ? hotelData.theme.primaryColor : undefined
            }}
          >
            <Icon 
              className={`w-5 h-5 transition-colors duration-300 ${
                isActive ? '' : 'text-neutral-400'
              }`}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
