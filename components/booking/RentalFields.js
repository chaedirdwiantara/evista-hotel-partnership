"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { getRentalDurations } from '@/lib/rental-pricing';

/**
 * RentalFields Component
 * 
 * Rental-specific fields (driver toggle, pickup location, duration, return location).
 * Consolidated from Step1RentalSelection.js for unified booking flow.
 * 
 * @param {Object} props
 * @param {Object} props.formData - Current form state
 * @param {Function} props.updateFormData - Form data update handler
 * @param {Object} props.hotelData - Hotel configuration for theme
 */
export default function RentalFields({ formData, updateFormData, hotelData }) {
  // Force 12 hours duration on mount
  useEffect(() => {
    updateFormData('rentalDuration', '12_hours');
  }, []);

  const [openLocation, setOpenLocation] = useState(false);
  const locationRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setOpenLocation(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get rental durations from the pricing module
  const durationOptions = getRentalDurations();

  // Return location options with coordinates (for API calls)
  const locationOptions = [
    { 
      value: 'classic_hotel', 
      label: 'Classic Hotel (Same as Pickup)',
    },
    { 
      value: 'halim_airport', 
      label: 'Halim Perdanakusuma Airport (HLP)',
      lat: -6.2657,
      long: 106.8913
    },
  ];

  const getDurationLabel = (value) => {
    const option = durationOptions.find(opt => opt.value === value);
    return option ? option.label : 'Select Duration';
  };

  const getLocationLabel = (value) => {
    const option = locationOptions.find(opt => opt.value === value);
    return option ? option.label : 'Select return location...';
  };

  const accentColor = hotelData.theme.accentColor;

  return (
    <div className="space-y-6 animate-slideDown">
      {/* Driver Service Toggle */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-3">
          Driver Service <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => updateFormData('withDriver', !formData.withDriver)}
            className="relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: formData.withDriver ? accentColor : '#9CA3AF',
            }}
            aria-label={`Switch to ${formData.withDriver ? 'Self Drive' : 'With Driver'}`}
          >
            <span 
              className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out"
              style={{
                transform: formData.withDriver ? 'translateX(28px)' : 'translateX(0)'
              }}
            />
          </button>

          <span 
            className="font-semibold text-neutral-900 transition-all duration-300 min-w-[100px]"
            role="status"
          >
            {formData.withDriver ? 'With Driver' : 'Self Drive'}
          </span>
        </div>
      </div>

      {/* Pickup Location & Rental Duration (Compact Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pickup Location */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">
            Pickup Location <span className="text-red-500">*</span>
          </label>
          <div className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 bg-neutral-50 text-neutral-600 text-lg flex items-center gap-3">
            <MapPin className="w-5 h-5 text-red-500" />
            <span className="truncate">{hotelData.name}</span>
          </div>
        </div>

        {/* Rental Duration (Fixed) */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">
            Rental Duration <span className="text-red-500">*</span>
          </label>
          <div className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 bg-neutral-50 text-neutral-600 text-lg flex items-center gap-3">
            <span className="text-neutral-900 font-medium">1 Hari (12 Jam)</span>
          </div>
        </div>
      </div>

      {/* Return Location Dropdown */}
      <div ref={locationRef} className="relative">
        <label className="block text-sm font-semibold text-neutral-700 mb-3">
          Return Location <span className="text-red-500">*</span>
        </label>
        
        <button
          type="button"
          onClick={() => setOpenLocation(!openLocation)}
          className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 text-left flex justify-between items-center transition-all text-lg hover:border-neutral-300"
          style={{ 
            borderColor: openLocation ? accentColor : undefined,
            backgroundColor: openLocation ? '#fffef9' : '#ffffff'
          }}
        >
          <span className={`block truncate ${formData.returnLocation ? "text-neutral-900" : "text-neutral-500"}`}>
            {getLocationLabel(formData.returnLocation)}
          </span>
          <ChevronDown 
            className={`w-5 h-5 text-neutral-500 transition-transform ${openLocation ? 'rotate-180' : ''} flex-shrink-0 ml-2`}
            style={{ color: openLocation ? accentColor : undefined }}
          />
        </button>

        {openLocation && (
          <div 
            className="absolute z-50 w-full mt-2 bg-white border-2 rounded-xl shadow-2xl overflow-hidden"
            style={{ borderColor: accentColor }}
          >
            <div className="max-h-60 overflow-y-auto">
              {locationOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full px-6 py-4 text-left transition-all text-lg border-b border-neutral-100 last:border-b-0 ${
                    formData.returnLocation === option.value
                      ? 'bg-gradient-to-r from-amber-50 to-white font-semibold'
                      : 'hover:bg-neutral-50'
                  }`}
                  onClick={() => {
                    updateFormData('returnLocation', option.value);
                    setOpenLocation(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Export location options for use in useRentalSubmission hook
export const RETURN_LOCATIONS = [
  { 
    value: 'classic_hotel', 
    label: 'Classic Hotel (Same as Pickup)',
  },
  { 
    value: 'halim_airport', 
    label: 'Halim Perdanakusuma Airport (HLP)',
    lat: -6.2657,
    long: 106.8913
  },
];
