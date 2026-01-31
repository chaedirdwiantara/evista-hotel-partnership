"use client";

import { formatPrice } from '@/lib/rental-pricing';

/**
 * VehicleCard Component
 * 
 * Unified card component for displaying vehicle options.
 * Used in both RentalVehicleGrid and VehicleClassSelection.
 * 
 * @param {Object} props
 * @param {string} props.image - URL of the vehicle image
 * @param {string} props.name - Main name of the vehicle (e.g., "Hyundai Premium")
 * @param {string} props.category - Vehicle category (e.g., "Premium", "Sedan")
 * @param {number|string} props.price - Price to display (number will be formatted, string used as-is)
 * @param {number} props.passengers - Passenger capacity
 * @param {Array<string>} props.features - Optional list of features to display
 * @param {boolean} props.isSelected - Whether this card is selected
 * @param {Function} props.onSelect - Callback when clicked
 * @param {boolean} props.disabled - Whether selection is disabled
 * @param {string} props.accentColor - Theme accent color (for borders/checks)
 * @param {string} props.primaryColor - Theme primary color (for text)
 * @param {string} props.priceLabel - Optional label below/near price if needed
 */
export default function VehicleCard({
  image,
  name,
  category,
  price,
  passengers,
  features = [],
  isSelected,
  onSelect,
  disabled = false,
  accentColor = '#BE9E44', // Default gold
  primaryColor = '#1a1a1a', 
  priceLabel
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`w-full text-left p-6 rounded-2xl border-2 transition-all transform hover:scale-[1.02] flex flex-col md:flex-row gap-4 relative ${
        isSelected
          ? 'bg-amber-50 shadow-lg'
          : 'border-neutral-200 bg-white hover:border-amber-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ 
        borderColor: isSelected ? accentColor : undefined 
      }}
    >
      {/* Image Section */}
      <div className="flex-shrink-0">
        <img
          src={image}
          alt={name}
          className="w-24 h-20 object-cover rounded-lg bg-neutral-100"
          onError={(e) => { e.target.src = '/images/cars/default.jpg' }}
        />
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-lg" style={{ color: primaryColor }}>{name}</h4>
            <p className="text-sm text-neutral-600 mb-1 capitalize">
              {category}
            </p>
          </div>
          
          {/* Mobile-friendly checkmark for selected state (top right) */}
          {isSelected && (
            <div 
              className="md:hidden w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" 
              style={{ backgroundColor: accentColor }}
            >
              ✓
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mt-1">
          {typeof price === 'number' && price > 0 ? (
            <p className="text-xl font-bold" style={{ color: accentColor }}>
              {formatPrice(price)}
            </p>
          ) : typeof price === 'string' ? (
             <p className="text-xl font-bold" style={{ color: accentColor }}>
              {price}
            </p>
          ) : (
            <p className="text-sm text-neutral-400">Select duration first</p>
          )}
          {priceLabel && <p className="text-xs text-neutral-500">{priceLabel}</p>}
        </div>

        {/* Features / Passengers */}
        <div className="mt-3 flex flex-wrap gap-2">
           <span className="px-3 py-1 bg-neutral-100 rounded-full text-xs text-neutral-700 flex items-center gap-1">
             <span>👤</span> {passengers} Passengers
           </span>
           {features && features.slice(0, 2).map((feature, idx) => (
              <span key={idx} className="px-3 py-1 bg-neutral-100 rounded-full text-xs text-neutral-700">
                {feature}
              </span>
           ))}
        </div>
      </div>

      {/* Desktop Checkmark (Right side) */}
      {isSelected && (
        <div className="hidden md:flex flex-shrink-0 items-center justify-center pl-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" 
            style={{ backgroundColor: accentColor }}
          >
            ✓
          </div>
        </div>
      )}
    </button>
  );
}
