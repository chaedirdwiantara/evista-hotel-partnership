"use client";

import RouteSelector from './RouteSelector';
import ManualDestinationInput from '../ManualDestinationInput';

/**
 * DestinationSelection Component
 * 
 * Destination selection UI combining fixed routes and manual search.
 * Extracted from Step1JourneyBuilder.js (lines 390-437)
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
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="font-semibold text-neutral-700">Select Route</h3>
        <RouteSelector
          routes={hotelData.routes}
          selectedRouteId={formData.selectedRoute}
          onRouteSelect={onFixedRouteSelect}
          hotelData={hotelData}
        />
      </div>
      
      <div className="mt-8 mb-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-neutral-200"></div>
        <span className="text-neutral-400 font-medium text-sm">OR</span>
        <div className="flex-1 h-px bg-neutral-200"></div>
      </div>

      <div className="bg-gradient-to-br from-neutral-50 to-white rounded-xl shadow-md border-2 border-neutral-200 p-6">
        <div className="mb-4">
          <h4 className="text-lg font-bold mb-1" style={{ color: hotelData.theme.primaryColor }}>
            📍 Search Other Destinations
          </h4>
          <p className="text-sm text-neutral-600">
            Can't find your route? Search manually
          </p>
        </div>
        
        <ManualDestinationInput
          onDestinationSelect={onManualDestinationSelect}
          onInputFocus={onManualInputFocus}
          primaryColor={hotelData.theme.primaryColor}
          accentColor={hotelData.theme.accentColor}
        />
        
        {destinationError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{destinationError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
