"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';

/**
 * Premium Custom Dropdown for Route Selection
 * Features:
 * - Clean, elegant design with smooth animations
 * - Shows route details (distance, duration) in dropdown
 * - Professional overlay design
 * - Keyboard accessible
 */
export default function RouteSelector({ 
  routes, 
  selectedRouteId, 
  onRouteSelect, 
  hotelData 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Find selected route
  const selectedRoute = routes.find(r => r.id === selectedRouteId);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);
  
  // Handle route selection
  const handleSelect = (routeId) => {
    onRouteSelect(routeId);
    setIsOpen(false);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-5 py-4 rounded-xl text-left transition-all duration-300 border-2 flex items-center justify-between ${
          isOpen 
            ? 'border-2 shadow-lg' 
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
        style={{ 
          borderColor: isOpen ? hotelData.theme.accentColor : undefined,
          backgroundColor: isOpen ? '#fffef9' : '#ffffff'
        }}
      >
        <div className="flex items-center gap-3 flex-1">
          <MapPin 
            className="w-5 h-5 flex-shrink-0" 
            style={{ color: hotelData.theme.accentColor }} 
          />
          <div className="flex-1 min-w-0">
            {selectedRoute ? (
              <>
                <h4 className="font-bold text-lg truncate" style={{ color: hotelData.theme.primaryColor }}>
                  {selectedRoute.name}
                </h4>
                <p className="text-sm text-neutral-500">
                  {selectedRoute.distance} km • {selectedRoute.estimatedDuration} min
                </p>
              </>
            ) : (
              <p className="text-neutral-400 font-medium">Select your destination...</p>
            )}
          </div>
        </div>
        
        <ChevronDown 
          className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          style={{ color: hotelData.theme.accentColor }}
        />
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-2 bg-white border-2 rounded-xl shadow-2xl overflow-hidden animate-slideDown"
          style={{ borderColor: hotelData.theme.accentColor }}
        >
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {routes.map((route, index) => (
              <button
                key={route.id}
                type="button"
                onClick={() => handleSelect(route.id)}
                className={`w-full px-5 py-4 text-left transition-all duration-200 border-b border-neutral-100 last:border-b-0 ${
                  selectedRouteId === route.id
                    ? 'bg-gradient-to-r from-amber-50 to-white'
                    : 'hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-bold text-base mb-1" style={{ color: hotelData.theme.primaryColor }}>
                      {route.name}
                    </h5>
                    <p className="text-sm text-neutral-500">
                      {route.distance} km • {route.estimatedDuration} min
                    </p>
                  </div>
                  
                  {selectedRouteId === route.id && (
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 ml-3"
                      style={{ backgroundColor: hotelData.theme.accentColor }}
                    >
                      ✓
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
