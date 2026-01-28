"use client";

import { useState, useEffect } from 'react';
import VehicleSelector from './VehicleSelector';
import { selectPickupLocation, selectDestination, setRoundTrip } from '@/lib/manual-destination-api';

// Custom Hooks
import { useDateTimeValidation } from '@/hooks/useDateTimeValidation';
import { useJourneySubmission } from '@/hooks/useJourneySubmission';
import { useVehicleSelection } from '@/hooks/useVehicleSelection';

// Utility Functions
import { 
  getCurrentPrice, 
  getRouteSelectionType, 
  shouldShowDateTime, 
  shouldShowVehicleSelection,
  createHotelPickupLocation 
} from '@/lib/journeyUtils';

// UI Components
import ServiceTypeTabs from './ServiceTypeTabs';
import DestinationSelection from './DestinationSelection';
import RentalFields from './RentalFields';
import DateTimeSection from './DateTimeSection';
import VehicleClassSelection from './VehicleClassSelection';
import TripTypeSelector from './TripTypeSelector';
import PriceSummary from './PriceSummary';

/**
 * Step 1: Unified Journey Builder Component
 * Refactored version - combines destination selection, date/time selection, and vehicle selection
 * 
 * @param {Object} props
 * @param {Object} props.formData - Current form data state
 * @param {Function} props.updateFormData - Form data update function
 * @param {Object} props.hotelData - Hotel configuration data
 */
export default function Step1JourneyBuilder({ formData, updateFormData, hotelData }) {
  // ==================
  // CUSTOM HOOKS
  // ==================
  const dateTimeValidation = useDateTimeValidation(formData);
  const journeySubmission = useJourneySubmission(formData, hotelData, dateTimeValidation);
  const vehicleSelection = useVehicleSelection();

  // ==================
  // COMPUTED VALUES
  // ==================
  const currentPrice = getCurrentPrice(formData, hotelData);
  const routeSelectionType = getRouteSelectionType(formData);
  const showDateTime = shouldShowDateTime(formData);
  const showVehicleSelection = shouldShowVehicleSelection(formData, journeySubmission.isSubmitting);

  // ==================
  // ERROR STATES
  // ==================
  const [destinationError, setDestinationError] = useState(null);

  // ==================
  // HANDLERS
  // ==================

  /**
   * Handle service type change
   */
  const handleServiceTypeChange = (serviceType, bookingType) => {
    updateFormData("serviceType", serviceType);
    updateFormData("bookingType", bookingType);
  };

  /**
   * Handle manual destination selection
   */
  const handleManualDestinationSelect = async (destination) => {
    console.log('[Journey Builder] handleManualDestinationSelect:', destination);
    
    if (!destination) {
      updateFormData('manualDestination', null);
      updateFormData('selectedVehicleClass', null);
      updateFormData('selectedVehicle', null);
      updateFormData('backendCarData', null);
      updateFormData('orderId', null);
      vehicleSelection.clearVehicles();
      setDestinationError(null);
      return;
    }
    
    try {
      setDestinationError(null);
      const hotelPickupLocation = createHotelPickupLocation(hotelData);
      
      await selectPickupLocation(hotelPickupLocation, 'later');
      await selectDestination(destination, 'later');
      const rtData = await setRoundTrip(formData.isRoundTrip);
      
      updateFormData('selectedRoute', null);
      updateFormData('selectedVehicleClass', null);
      updateFormData('selectedVehicle', null);
      updateFormData('manualDestination', destination);
      if (rtData && rtData.id) {
        updateFormData('routeId', rtData.id);
      }
      
    } catch (error) {
      console.error('[Manual Destination] Error:', error);
      setDestinationError(error.message || 'Failed to set destination.');
    }
  };

  /**
   * Handle fixed route selection
   */
  const handleFixedRouteSelect = async (routeId) => {
    updateFormData('manualDestination', null);
    updateFormData('backendCarData', null);
    updateFormData('selectedVehicleClass', null);
    updateFormData('selectedVehicle', null);
    updateFormData('orderId', null);
    vehicleSelection.clearVehicles();
    setDestinationError(null);
    updateFormData('selectedRoute', routeId);
    
    // Find the route details
    const route = hotelData.routes.find(r => r.id === routeId);
    if (!route) return;

    // Initialize Trip (Pickup & Destination)
    try {
      const hotelPickupLocation = createHotelPickupLocation(hotelData);
      
      // 1. Set Pickup (Hotel) - Initializes the session
      await selectPickupLocation(hotelPickupLocation, 'later');
      
      // selectDestination is NOT needed for fixed routes as the route ID handles the destination logic
      // and calling it with invalid params caused 400 errors.
      
      // 2. Sync round trip status
      const rtData = await setRoundTrip(formData.isRoundTrip);
      if (rtData && rtData.id) {
        updateFormData('routeId', rtData.id);
      }
    } catch (error) {
      console.error('[Fixed Route] Error initializing trip:', error);
    }
  };

  /**
   * Handle manual input focus
   */
  const handleManualInputFocus = () => {
    updateFormData('selectedRoute', null);
    updateFormData('selectedVehicleClass', null);
    updateFormData('selectedVehicle', null);
  };

  /**
   * Handle car selection for both fixed and manual destinations
   */
  const handleCarSelect = async (car) => {
    const orderType = formData.bookingType === 'rental' ? 'rental' : 'later';
    await vehicleSelection.handleCarSelect(car, orderType, updateFormData);
  };

  /**
   * Handle trip type change
   */
  const handleTripTypeChange = (isRoundTrip) => {
    updateFormData("isRoundTrip", isRoundTrip);
  };

  // ==================
  // EFFECTS
  // ==================

  /**
   * Effect: Update round trip and refresh cars for manual destinations
   * Ensures /api/trip/roundtrip is hit whenever toggle changes (if destination exists)
   */
  useEffect(() => {
    if (formData.manualDestination || formData.selectedRoute) {
      if (formData.orderId) {
        // If we have an active order/cars, we need to refresh the car list and prices
        const orderType = formData.bookingType === 'rental' ? 'rental' : 'later';
        vehicleSelection.updateRoundTripAndRefreshCars(
          formData.isRoundTrip,
          orderType,
          formData.selectedVehicleClass,
          updateFormData
        );
      } else {
        // If no active order yet, just sync the status to backend
        setRoundTrip(formData.isRoundTrip)
          .then(data => {
             if (data && data.id) {
               updateFormData('routeId', data.id);
             }
          })
          .catch(err => 
            console.error('[Journey Builder] Error syncing round trip status:', err)
          );
      }
    }
  }, [formData.isRoundTrip]);

  /**
   * Effect: clear orderId when rental fields change to trigger re-submission
   * This ensures that isReadyToSubmit() returns true and a new order is created/updated
   */
  useEffect(() => {
    if (formData.bookingType === 'rental' && formData.orderId) {
      updateFormData('orderId', null);
    }
  }, [
    formData.withDriver,
    formData.rentalDuration,
    formData.returnLocation,
    formData.rentalDate,
    formData.pickupTime
  ]);

  /**
   * Effect: Auto-submit journey when ready
   * Validation is now handled internally by journeySubmission.isReadyToSubmit()
   */
  useEffect(() => {
    const submitIfReady = async () => {
      const ready = journeySubmission.isReadyToSubmit();
      console.log('[Journey Builder] Checking Auto-Submit:', { 
        ready, 
        isSubmitting: journeySubmission.isSubmitting,
        bookingType: formData.bookingType,
        rentalDate: formData.rentalDate,
        pickupTime: formData.pickupTime,
        orderId: formData.orderId,
        validation: {
           timeInvalid: dateTimeValidation.timeIsInvalid,
           returnInvalid: dateTimeValidation.returnDateTimeIsInvalid
        }
      });
      
      if (ready && !journeySubmission.isSubmitting) {
        const result = await journeySubmission.submitJourney();
        
        if (result.success && result.orderId) {
          updateFormData('orderId', result.orderId);
          
          // Load cars for both manual and fixed routes
          const orderType = formData.bookingType === 'rental' ? 'rental' : 'later';
          await vehicleSelection.loadAvailableCars(orderType);
        } else if (!result.success) {
          updateFormData('orderId', null);
        }
      }
    };
    
    submitIfReady();
  }, [
    dateTimeValidation.currentDate, 
    formData.pickupTime, 
    formData.returnDate,         // Added: Watch return date changes
    formData.returnTime,         // Added: Watch return time changes
    formData.selectedRoute, 
    formData.manualDestination,
    formData.routeId,            // Added: Watch routeId to prevent submitting without it
    formData.withDriver,
    formData.rentalDuration,     // Fixed: Duplicate withDriver removed
    formData.returnLocation,
    formData.rentalDate,         // Added: Watch rental date changes
    formData.isRoundTrip,        // Added: Watch trip type changes
    dateTimeValidation.timeIsInvalid,           // Added: Watch validation state
    dateTimeValidation.returnDateTimeIsInvalid  // Added: Watch return validation state
  ]);

  // ==================
  // RENDER
  // ==================

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-6" style={{ color: hotelData.theme.primaryColor }}>
        Plan Your Journey
      </h2>
      
      {/* SERVICE TYPE TABS */}
      <ServiceTypeTabs
        serviceType={formData.serviceType}
        onServiceTypeChange={handleServiceTypeChange}
        hotelData={hotelData}
      />

      {/* DESTINATION SELECTION (Reservation) */}
      {formData.serviceType === "fixPrice" && (
        <DestinationSelection
          formData={formData}
          hotelData={hotelData}
          onFixedRouteSelect={handleFixedRouteSelect}
          onManualDestinationSelect={handleManualDestinationSelect}
          onManualInputFocus={handleManualInputFocus}
          destinationError={destinationError}
        />
      )}

      {/* RENTAL FIELDS */}
      {formData.serviceType === "rental" && (
        <RentalFields
          formData={formData}
          updateFormData={updateFormData}
          hotelData={hotelData}
        />
      )}

      {/* TRIP TYPE SELECTOR - Positioned before DateTime for better flow */}
      {showDateTime && (
        <TripTypeSelector
          isRoundTrip={formData.isRoundTrip}
          onTripTypeChange={handleTripTypeChange}
          hotelData={hotelData}
        />
      )}

      {/* DATE/TIME SECTION */}
      {showDateTime && (
        <DateTimeSection
          formData={formData}
          updateFormData={updateFormData}
          hotelData={hotelData}
          validation={dateTimeValidation}
          isSubmitting={journeySubmission.isSubmitting}
          journeyError={journeySubmission.error}
        />
      )}

      {/* VEHICLE SELECTION SECTION */}
      {showVehicleSelection && routeSelectionType && formData.serviceType === "fixPrice" && (
        <div className="space-y-8 animate-slideDown">
          
          {/* Vehicle Class Selection */}
          <VehicleClassSelection
            formData={formData}
            hotelData={hotelData}
            routeSelectionType={routeSelectionType}
            availableCars={vehicleSelection.availableCars}
            isLoadingCars={vehicleSelection.isLoadingCars}
            onCarSelect={handleCarSelect}
          />

          {/* Optional Vehicle Selection - Fixed Routes Only */}
          {routeSelectionType === 'fixed' && formData.selectedVehicleClass && hotelData.fleet && (
            <VehicleSelector
              selectedVehicleClass={formData.selectedVehicleClass}
              selectedVehicle={formData.selectedVehicle}
              onSelectVehicle={(vehicleId) => updateFormData("selectedVehicle", vehicleId)}
              vehicles={hotelData.fleet.filter(v => v.vehicleClass === formData.selectedVehicleClass && v.available)}
              hotelData={hotelData}
            />
          )}

          {/* Price Summary */}
          <PriceSummary
            formData={formData}
            hotelData={hotelData}
            routeSelectionType={routeSelectionType}
            currentPrice={currentPrice}
          />
        </div>
      )}
    </div>
  );
}
