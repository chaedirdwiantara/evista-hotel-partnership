import { useState, useEffect } from 'react';
import { MapPin, Search, ArrowLeft, ArrowRight } from 'lucide-react';
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
 * @param {string|null} props.destinationError - Error message
 */
export default function DestinationSelection({ 
  formData, 
  hotelData, 
  onFixedRouteSelect, 
  onManualDestinationSelect,
  onManualInputFocus,
  destinationError 
}) {
  // viewMode: 'popular' | 'manual'
  const [viewMode, setViewMode] = useState('popular');
  
  // Sync viewMode with external data state
  // If we have a manual destination, we MUST be in manual mode.
  // If we have a selected route, we usually want to be in popular mode.
  useEffect(() => {
    if (formData.manualDestination) {
      setViewMode('manual');
    } else if (formData.selectedRoute) {
      setViewMode('popular');
    }
  }, [formData.manualDestination, formData.selectedRoute]);

  const handleModeChange = (mode) => {
    setViewMode(mode);
    
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
      
      {/* CONTENT AREA */}
      <div className="min-h-[120px] transition-all duration-300 ease-in-out">
        {viewMode === 'popular' ? (
          <div className="animate-slideUp fade-in space-y-4">
             <div>
              <h3 className="font-semibold text-neutral-700">Select Route</h3>
              <p className="text-xs text-neutral-500 mt-1">Choose from our recommended destinations</p>
            </div>
            
            <RouteSelector
              routes={hotelData.routes}
              selectedRouteId={formData.selectedRoute}
              onRouteSelect={onFixedRouteSelect}
              hotelData={hotelData}
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
                  Can't find your destination? <span className="font-medium underline decoration-dotted underline-offset-4">Search manually</span>
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-slideUp fade-in space-y-4">
            {/* HEADER ACTION: Go back to Popular */}
             <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-neutral-700">Search Destination</h3>
                  <p className="text-xs text-neutral-500 mt-1">Enter your specific destination manually</p>
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
