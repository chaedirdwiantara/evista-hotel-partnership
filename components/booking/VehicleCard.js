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
      className={`w-full text-left p-4 md:p-6 rounded-2xl border transition-all transform hover:scale-[1.01] flex flex-row items-center gap-4 relative group ${
        isSelected
          ? 'bg-amber-50/50 border-amber-500 shadow-md'
          : 'border-neutral-100 bg-white hover:border-amber-200 hover:shadow-sm'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {/* Image Section - Left Side */}
      <div className="flex-shrink-0 w-28 h-24 md:w-32 md:h-24 bg-neutral-50 rounded-xl overflow-hidden flex items-center justify-center border border-neutral-100 p-2">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain mix-blend-multiply"
          onError={(e) => { e.target.src = '/images/cars/default.jpg' }}
        />
      </div>

      {/* Content Section - Right Side */}
      <div className="flex-1 min-w-0 flex flex-col justify-center h-full py-1">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h4 className="font-bold text-base md:text-lg leading-tight" style={{ color: primaryColor }}>{name}</h4>
            <p className="text-xs text-neutral-500 capitalize font-medium mt-0.5">
              {category}
            </p>
          </div>
          
          {/* Mobile Checkmark */}
          {isSelected && (
            <div 
              className="md:hidden flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm ml-2" 
              style={{ backgroundColor: accentColor }}
            >
              ✓
            </div>
          )}
        </div>

        {/* Price & Details */}
        <div className="mt-auto">
          {typeof price === 'number' && price > 0 ? (
            <p className="text-sm md:text-lg font-bold" style={{ color: accentColor }}>
              {formatPrice(price)}
            </p>
          ) : typeof price === 'string' ? (
             <p className="text-sm md:text-lg font-bold" style={{ color: accentColor }}>
              {price}
            </p>
          ) : (
            <p className="text-xs text-neutral-400 italic">Select duration</p>
          )}
          
          <div className="flex items-center gap-3 mt-1.5 md:mt-2">
             <span className="inline-flex items-center gap-1 text-[10px] md:text-xs text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md font-medium">
               <span>👤</span> {passengers} <span className="hidden sm:inline">Passengers</span>
             </span>
             {priceLabel && <span className="text-[10px] md:text-xs text-neutral-400">{priceLabel}</span>}
          </div>
        </div>
      </div>

      {/* Desktop Checkmark (Right) */}
      {isSelected && (
        <div className="hidden md:flex flex-shrink-0 items-center justify-center pl-4 border-l border-neutral-100 ml-2">
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold shadow-sm" 
            style={{ backgroundColor: accentColor }}
          >
            ✓
          </div>
        </div>
      )}
    </button>
  );
}
