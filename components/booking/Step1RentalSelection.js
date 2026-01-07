"use client";

import { useState } from 'react';

/**
 * Step1RentalSelection Component
 * 
 * Rental-specific service selection with:
 * - With/Without Driver toggle
 * - Rental Duration selection
 * - Rental Date & Time
 * - Pickup Location (fixed: Classic Hotel)
 * - Return Location (dropdown: Classic Hotel or Halim Airport)
 */
export default function Step1RentalSelection({ formData, updateFormData, hotelData }) {
  const [errors, setErrors] = useState({});

  // Rental duration options
  const rentalDurations = [
    { value: "6_hours", label: "6 Jam", hours: 6 },
    { value: "12_hours", label: "12 Jam", hours: 12 },
    { value: "24_hours", label: "24 Jam (1 Hari)", hours: 24 },
    { value: "2_days", label: "2 Hari", hours: 48 },
    { value: "3_days", label: "3 Hari", hours: 72 },
    { value: "week", label: "1 Minggu", hours: 168 }
  ];

  // Time options (00:00 - 23:30, 30min intervals)
  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Return location options
  const returnLocations = [
    { value: "classic_hotel", label: "Classic Hotel (Same as Pickup)" },
    { value: "halim_airport", label: "Halim Perdanakusuma Airport (HLP)" }
  ];

  // Validate all fields
  const validateFields = () => {
    const newErrors = {};

    if (!formData.withDriver && formData.withDriver !== false) {
      newErrors.withDriver = "Please select driver option";
    }

    if (!formData.rentalDuration) {
      newErrors.rentalDuration = "Please select rental duration";
    }

    if (!formData.rentalDate) {
      newErrors.rentalDate = "Please select rental date";
    } else {
      const selectedDate = new Date(formData.rentalDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.rentalDate = "Rental date cannot be in the past";
      }
    }

    if (!formData.pickupTime) {
      newErrors.pickupTime = "Please select pickup time";
    } else if (formData.rentalDate) {
      // Check if pickup time is at least 60 minutes from now
      const selectedDate = new Date(formData.rentalDate);
      const today = new Date();
      
      if (selectedDate.toDateString() === today.toDateString()) {
        const [hours, minutes] = formData.pickupTime.split(':');
        const pickupDateTime = new Date();
        pickupDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const minTime = new Date();
        minTime.setMinutes(minTime.getMinutes() + 60);
        
        if (pickupDateTime < minTime) {
          newErrors.pickupTime = "Pickup time must be at least 60 minutes from now";
        }
      }
    }

    if (!formData.returnLocation) {
      newErrors.returnLocation = "Please select return location";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateFields()) {
      // Proceed to next step (vehicle selection)
      if (formData.onContinue) {
        formData.onContinue();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">Rental Details</h2>
      </div>

      {/* With Driver Toggle */}
      <div>
        <label className="block text-sm font-semibold mb-3 text-neutral-800">
          With Driver? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateFormData('withDriver', true)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              formData.withDriver === true
                ? 'border-purple-600 bg-purple-50 text-purple-700'
                : 'border-neutral-300 bg-white hover:border-neutral-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">With Driver</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => updateFormData('withDriver', false)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              formData.withDriver === false
                ? 'border-purple-600 bg-purple-50 text-purple-700'
                : 'border-neutral-300 bg-white hover:border-neutral-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Self Drive</span>
            </div>
          </button>
        </div>
        {errors.withDriver && (
          <p className="text-red-500 text-sm mt-1">{errors.withDriver}</p>
        )}
      </div>

      {/* Rental Duration */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-neutral-800">
          Rental Duration <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.rentalDuration || ''}
          onChange={(e) => updateFormData('rentalDuration', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.rentalDuration ? 'border-red-500' : 'border-neutral-300'
          }`}
        >
          <option value="">Select duration...</option>
          {rentalDurations.map(dur => (
            <option key={dur.value} value={dur.value}>{dur.label}</option>
          ))}
        </select>
        {errors.rentalDuration && (
          <p className="text-red-500 text-sm mt-1">{errors.rentalDuration}</p>
        )}
      </div>

      {/* Rental Date */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-neutral-800">
          Rental Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.rentalDate || ''}
          onChange={(e) => updateFormData('rentalDate', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.rentalDate ? 'border-red-500' : 'border-neutral-300'
          }`}
        />
        {errors.rentalDate && (
          <p className="text-red-500 text-sm mt-1">{errors.rentalDate}</p>
        )}
      </div>

      {/* Pickup Time */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-neutral-800">
          Pickup Time <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.pickupTime || ''}
          onChange={(e) => updateFormData('pickupTime', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.pickupTime ? 'border-red-500' : 'border-neutral-300'
          }`}
        >
          <option value="">Select time...</option>
          {timeOptions.map(time => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>
        {errors.pickupTime && (
          <p className="text-red-500 text-sm mt-1">{errors.pickupTime}</p>
        )}
      </div>

      {/* Pickup Location (Fixed) */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-neutral-800">
          Pickup Location
        </label>
        <div className="px-4 py-3 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-700">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">Classic Hotel Jakarta</span>
          </div>
          <p className="text-sm text-neutral-500 mt-1 ml-7">Jl. Sudirman No. 123, Jakarta</p>
        </div>
      </div>

      {/* Return Location */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-neutral-800">
          Return Location <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.returnLocation || ''}
          onChange={(e) => updateFormData('returnLocation', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.returnLocation ? 'border-red-500' : 'border-neutral-300'
          }`}
        >
          <option value="">Select return location...</option>
          {returnLocations.map(loc => (
            <option key={loc.value} value={loc.value}>{loc.label}</option>
          ))}
        </select>
        {errors.returnLocation && (
          <p className="text-red-500 text-sm mt-1">{errors.returnLocation}</p>
        )}
      </div>

      {/* Continue Button */}
      <div className="pt-4">
        <button
          onClick={handleContinue}
          className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          Continue to Vehicle Selection
        </button>
      </div>
    </div>
  );
}
