import { useState } from 'react';
import { ArrowLeft, ArrowRightLeft, Hotel, MapPin, Search } from 'lucide-react';
import { JOURNEY_DIRECTIONS, getRouteExternalLocationName, isHotelDestination } from '@/lib/journeyUtils';
import RouteSelector from './RouteSelector';
import ManualDestinationInput from '../ManualDestinationInput';

/**
 * DestinationSelection Component
 * 
 * Destination selection UI combining fixed routes and manual search using a "Seamless Swap" interface.
 * Shows one mode at a time with a clear toggle action.
 * 
 * @param {Object} props
 * @param {Object} props.formData - Current form state
 * @param {Object} props.hotelData - Hotel configuration
 * @param {Function} props.onFixedRouteSelect - Fixed route selection handler
 * @param {Function} props.onManualDestinationSelect - Manual destination selection handler
 * @param {Function} props.onManualInputFocus - Manual input focus handler
 * @param {Function} props.onRouteDirectionChange - Direction selection handler
 * @param {string|null} props.destinationError - Error message
 */
export default function DestinationSelection({ 
  formData, 
  hotelData, 
  onFixedRouteSelect, 
  onManualDestinationSelect,
  onManualInputFocus,
  onRouteDirectionChange,
  destinationError 
}) {
  // preferredViewMode: 'popular' | 'manual'
  const [preferredViewMode, setPreferredViewMode] = useState('popular');
  const hotelIsDestination = isHotelDestination(formData);
  const viewMode = formData.manualDestination
    ? 'manual'
    : formData.selectedRoute
      ? 'popular'
      : preferredViewMode;
  const routeDirection = formData.routeDirection || JOURNEY_DIRECTIONS.FROM_HOTEL;
  const selectionTitle = hotelIsDestination ? 'Select Pickup' : 'Select Route';
  const selectionSubtitle = hotelIsDestination
    ? `Choose where we should pick you up before heading to ${hotelData.name}`
    : 'Choose from our recommended destinations';
  const manualTitle = hotelIsDestination ? 'Search Pickup' : 'Search Destination';
  const manualSubtitle = hotelIsDestination
    ? 'Enter your specific pickup point manually'
    : 'Enter your specific destination manually';
  const routePlaceholder = hotelIsDestination
    ? 'Select your pickup point...'
    : 'Select your destination...';
  const manualPlaceholder = hotelIsDestination
    ? 'Search pickup point (e.g., Soekarno-Hatta)'
    : 'Search destination (e.g., Stasiun Kereta Cepat)';
  const manualSelectedLabel = hotelIsDestination ? 'Selected Pickup:' : 'Selected Destination:';
  const getRouteLabel = (route) => hotelIsDestination
    ? getRouteExternalLocationName(route)
    : route.name;
  
  const handleModeChange = (mode) => {
    setPreferredViewMode(mode);
    
    // Mutual Exclusivity: Clear the data of the mode we are leaving
    if (mode === 'popular') {
      // Switching BACK to Popular -> Clear Manual
      onManualDestinationSelect(null);
    } else {
      // Switching TO Manual -> Clear Fixed
      onFixedRouteSelect(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* DIRECTION CONTROL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-neutral-700">Route Direction</h3>
            <p className="text-xs text-neutral-500 mt-1">
              {hotelIsDestination ? `${hotelData.name} as destination` : `${hotelData.name} as pickup point`}
            </p>
          </div>
          <ArrowRightLeft className="hidden sm:block w-5 h-5 text-neutral-300" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg bg-neutral-100 p-1">
          {[
            {
              value: JOURNEY_DIRECTIONS.FROM_HOTEL,
              label: `From ${hotelData.name}`,
              description: 'Hotel pickup',
              icon: Hotel,
            },
            {
              value: JOURNEY_DIRECTIONS.TO_HOTEL,
              label: `To ${hotelData.name}`,
              description: 'Hotel destination',
              icon: MapPin,
            },
          ].map((option) => {
            const Icon = option.icon;
            const isActive = routeDirection === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onRouteDirectionChange(option.value)}
                className={`min-h-16 rounded-lg border px-4 py-3 text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-white shadow-sm'
                    : 'border-transparent text-neutral-500 hover:bg-white/70 hover:text-neutral-700'
                }`}
                style={{
                  borderColor: isActive ? hotelData.theme.accentColor : undefined,
                  color: isActive ? hotelData.theme.primaryColor : undefined,
                }}
                aria-pressed={isActive}
              >
                <span className="flex items-start gap-3">
                  <Icon
                    className="mt-0.5 h-4 w-4 flex-shrink-0"
                    style={{ color: isActive ? hotelData.theme.accentColor : undefined }}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-tight">{option.label}</span>
                    <span className="mt-1 block text-xs text-neutral-500">{option.description}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* CONTENT AREA */}
      <div className="min-h-[120px] transition-all duration-300 ease-in-out">
        {viewMode === 'popular' ? (
          <div className="animate-slideUp fade-in space-y-4">
             <div>
              <h3 className="font-semibold text-neutral-700">{selectionTitle}</h3>
              <p className="text-xs text-neutral-500 mt-1">{selectionSubtitle}</p>
            </div>
            
            <RouteSelector
              routes={hotelData.routes}
              selectedRouteId={formData.selectedRoute}
              onRouteSelect={onFixedRouteSelect}
              hotelData={hotelData}
              placeholder={routePlaceholder}
              getRouteLabel={getRouteLabel}
            />

            {/* SEAMLESS SWAP TOGGLE: Go to Manual */}
            <div className="flex justify-center pt-4">
               <button
                type="button"
                onClick={() => handleModeChange('manual')}
                className="group flex items-center gap-2.5 text-sm text-neutral-500 hover:text-neutral-800 transition-all duration-200"
              >
                <Search className="hidden md:block w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                <span className="font-normal">
                  {hotelIsDestination ? "Can't find your pickup point?" : "Can't find your destination?"} <span className="font-medium underline decoration-dotted underline-offset-4">Search manually</span>
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-slideUp fade-in space-y-4">
            {/* HEADER ACTION: Go back to Popular */}
             <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-neutral-700">{manualTitle}</h3>
                  <p className="text-xs text-neutral-500 mt-1">{manualSubtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleModeChange('popular')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Routes
                </button>
             </div>

             <ManualDestinationInput
              selectedDestination={formData.manualDestination} // Controlled Prop
              onDestinationSelect={onManualDestinationSelect}
              onInputFocus={onManualInputFocus}
              primaryColor={hotelData.theme.primaryColor}
              accentColor={hotelData.theme.accentColor}
              placeholder={manualPlaceholder}
              selectedLabel={manualSelectedLabel}
            />
          </div>
        )}
      </div>
        
      {destinationError && (
        <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-xl animate-shake">
          <p className="text-red-600 text-sm flex items-center gap-2">
            <span>⚠️</span> {destinationError}
          </p>
        </div>
      )}
    </div>
  );
}
