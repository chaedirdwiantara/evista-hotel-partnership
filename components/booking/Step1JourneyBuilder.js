"use client";

import { useState, useEffect } from 'react';
import { Car, CalendarCheck } from 'lucide-react';
import VehicleSelector from './VehicleSelector';
import RouteSelector from './RouteSelector';
import ManualDestinationInput from '../ManualDestinationInput';
import { selectPickupLocation, selectDestination, setRoundTrip, getCarList } from '@/lib/manual-destination-api';
import { EvistaAPI } from '@/lib/evista-api';
import { isPickupUrgentNight, isReturnUrgentNight } from '@/lib/whatsapp-utils';

/**
 * Step 1: Unified Journey Builder Component
 * Combines destination selection, date/time selection, and vehicle selection
 * Eliminates double trip/submit API call issue
 */
export default function Step1JourneyBuilder({ formData, updateFormData, hotelData }) {
  // ==================
  // STATES
  // ==================
  const [availableCars, setAvailableCars] = useState([]);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [isSubmittingJourney, setIsSubmittingJourney] = useState(false);
  const [destinationError, setDestinationError] = useState(null);
  const [journeyError, setJourneyError] = useState(null);

  // ==================
  // HELPER FUNCTIONS
  // ==================
  
  // Get current price based on selections (for fixed routes)
  const getCurrentPrice = () => {
    if (!formData.selectedRoute || !formData.selectedVehicleClass) return null;
    const route = hotelData.routes.find(r => r.id === formData.selectedRoute);
    if (!route) return null;
    const pricing = route.pricing[formData.selectedVehicleClass];
    if (!pricing) return null;
    return formData.isRoundTrip ? pricing.roundTrip : pricing.oneWay;
  };

  const currentPrice = getCurrentPrice();
  
  // Track which route selection type is active
  const routeSelectionType = formData.selectedRoute ? 'fixed' : (formData.manualDestination ? 'manual' : null);

  // ==================
  // DATE/TIME VALIDATION FUNCTIONS (from Step2DateTime.js)
  // ==================
  
  // Determine which date field to use based on booking type
  const isRental = formData.bookingType === 'rental';
  const dateField = isRental ? 'rentalDate' : 'pickupDate';
  const currentDate = formData[dateField];
  
  // Calculate minimum date and time (current time + 60 minutes)
  const now = new Date();
  const minDateTime = new Date(now.getTime() + 60 * 60 * 1000);
  const minDate = minDateTime.toISOString().split("T")[0];
  
  // Calculate minimum time based on selected date
  const getMinTime = () => {
    if (!currentDate) return "";
    
    const selectedDate = new Date(currentDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If selected date is today, enforce minimum time (now + 60 min)
    if (selectedDate.getTime() === today.getTime()) {
      const minHours = String(minDateTime.getHours()).padStart(2, '0');
      const minMinutes = String(minDateTime.getMinutes()).padStart(2, '0');
      return `${minHours}:${minMinutes}`;
    }
    
    // For future dates, no time restriction
    return "";
  };

  const isNightTime = () => {
    if (!formData.pickupTime) return false;
    const hour = parseInt(formData.pickupTime.split(":")[0]);
    return hour >= 0 && hour < 6;
  };

  // Validate if selected time is valid
  const isTimeValid = () => {
    if (!formData.pickupTime || !currentDate) return true;
    
    const minTime = getMinTime();
    if (!minTime) return true;
    
    const [selectedHour, selectedMin] = formData.pickupTime.split(':').map(Number);
    const [minHour, minMin] = minTime.split(':').map(Number);
    
    const selectedTotalMin = selectedHour * 60 + selectedMin;
    const minTotalMin = minHour * 60 + minMin;
    
    return selectedTotalMin >= minTotalMin;
  };

  // Check if return datetime is valid
  const isReturnDateTimeValid = () => {
    if (!formData.isRoundTrip || !currentDate || !formData.pickupTime || !formData.returnDate || !formData.returnTime) {
      return true;
    }
    const pickupDateTime = new Date(currentDate + 'T' + formData.pickupTime);
    const returnDateTime = new Date(formData.returnDate + 'T' + formData.returnTime);
    return returnDateTime > pickupDateTime;
  };

  const minTime = getMinTime();
  const timeIsInvalid = !isTimeValid();
  const returnDateTimeIsInvalid = !isReturnDateTimeValid();

  const handleTimeChange = (e) => {
    updateFormData("pickupTime", e.target.value);
  };

  // ==================
  // JOURNEY SUBMISSION CHECK
  // ==================
  
  const isReadyToSubmitJourney = () => {
    const hasDestination = formData.selectedRoute || formData.manualDestination;
    if (!hasDestination) return false;
    
    const hasDateTime = currentDate && formData.pickupTime;
    if (!hasDateTime) return false;
    
    if (!isTimeValid()) return false;
    
    if (formData.bookingType === 'rental') {
      const hasRentalFields = formData.withDriver !== null && formData.rentalDuration && formData.returnLocation;
      if (!hasRentalFields) return false;
    }
    
    if (formData.orderId) return false;
    
    return true;
  };

  // ==================
  // HANDLERS
  // ==================

  const handleManualDestinationSelect = async (destination) => {
    console.log('[Journey Builder] handleManualDestinationSelect:', destination);
    
    if (!destination) {
      updateFormData('manualDestination', null);
      updateFormData('selectedVehicleClass', null);
      updateFormData('selectedVehicle', null);
      updateFormData('backendCarData', null);
      updateFormData('orderId', null);
      setAvailableCars([]);
      setDestinationError(null);
      return;
    }
    
    try {
      setDestinationError(null);
      
      const hotelPickupLocation = {
        lat: -6.1696,
        lng: 106.8349,
        label: hotelData.name || 'Classic Hotel',
        name: hotelData.name || 'Classic Hotel',
        address: 'Jl. K.H. Samanhudi No. 43-45, Pasar Baru, Jakarta Pusat',
      };
      
      await selectPickupLocation(hotelPickupLocation, 'later');
      await selectDestination(destination, 'later');
      await setRoundTrip(formData.isRoundTrip);
      
      updateFormData('selectedRoute', null);
      updateFormData('selectedVehicleClass', null);
      updateFormData('selectedVehicle', null);
      updateFormData('manualDestination', destination);
      
    } catch (error) {
      console.error('[Manual Destination] Error:', error);
      setDestinationError(error.message || 'Failed to set destination.');
    }
  };

  const handleFixedRouteSelect = (routeId) => {
    updateFormData('manualDestination', null);
    updateFormData('backendCarData', null);
    updateFormData('selectedVehicleClass', null);
    updateFormData('selectedVehicle', null);
    updateFormData('orderId', null);
    setAvailableCars([]);
    setDestinationError(null);
    updateFormData('selectedRoute', routeId);
  };

  const handleCarSelect = async (car) => {
    try {
      updateFormData('selectedVehicleClass', car.id);
      updateFormData('backendCarData', car);
      
      const orderType = formData.bookingType === 'rental' ? 'rental' : 'later';
      const response = await EvistaAPI.cars.selectCar(car.id, orderType);
      
      if (response.code === 200 && response.order?.id) {
        updateFormData('orderId', response.order.id);
      }
    } catch (error) {
      console.error('[Car Selection] Error:', error);
    }
  };

  const handleJourneySubmit = async () => {
    try {
      setIsSubmittingJourney(true);
      setJourneyError(null);
      
      const orderType = formData.bookingType === 'rental' ? 'rental' : 'later';
      
      let tripData = {
        order_type: orderType,
        pickup_at: `${currentDate} ${formData.pickupTime}:00`,
      };

      if (formData.selectedRoute) {
        const pickupLocation = {
          lat: hotelData.coordinates?.lat || -6.1680722,
          lng: hotelData.coordinates?.lng || 106.8349,
          label: hotelData.name || 'Classic Hotel',
          address: hotelData.address || 'Jl. K.H. Samanhudi No. 43-45, Pasar Baru, Jakarta Pusat',
        };
        await selectPickupLocation(pickupLocation, orderType);

        const selectedRoute = hotelData.routes?.find(r => r.id === formData.selectedRoute);
        const destinationLocation = {
          lat: selectedRoute.destination?.lat || -6.2382699,
          lng: selectedRoute.destination?.lng || 106.8553428,
          label: selectedRoute.name || 'Destination',
          address: selectedRoute.description || '',
        };
        await selectDestination(destinationLocation, orderType);
      }

      if (formData.bookingType === 'rental') {
        tripData.return_at = `${formData.returnDate} ${formData.returnTime}:00`;
        tripData.is_with_driver = formData.withDriver ? 1 : 0;
        tripData.is_same_return_location = formData.returnLocation === formData.pickupLocation ? 1 : 0;
      }

      const tripResponse = await EvistaAPI.trips.submit(tripData);
      if (tripResponse.code !== 200) {
        throw new Error(tripResponse.message || 'Failed to create booking order');
      }

      const orderId = tripResponse.data?.id;
      if (!orderId) throw new Error('No order ID returned');

      updateFormData('orderId', orderId);

      if (formData.manualDestination) {
        setIsLoadingCars(true);
        const rawCars = await getCarList('later');
        // Filter cars: Allow Premium (2), Economy+ (9), Elite (10)
        // Explicitly excluding Economy (1) as per request
        const allowedCarIds = [2, 9];
        const cars = rawCars.filter(car => allowedCarIds.includes(car.id));
        setAvailableCars(cars);
        setIsLoadingCars(false);
      }

      if (formData.selectedRoute && formData.selectedVehicleClass) {
        await EvistaAPI.cars.selectCar(formData.selectedVehicleClass, orderType);
      }

    } catch (error) {
      console.error('[Journey Builder] Error:', error);
      setJourneyError(error.message || 'Failed to process journey.');
      updateFormData('orderId', null);
    } finally {
      setIsSubmittingJourney(false);
    }
  };

  // ==================
  // EFFECTS
  // ==================

  useEffect(() => {
    if (formData.manualDestination && availableCars.length > 0 && formData.orderId) {
      const updateRoundTrip = async () => {
        try {
          setIsLoadingCars(true);
          await setRoundTrip(formData.isRoundTrip);
          const rawCars = await getCarList('later');
          
          // Filter cars: Allow Premium (2), Economy+ (9), Elite (10)
          const allowedCarIds = [2, 9];
          const cars = rawCars.filter(car => allowedCarIds.includes(car.id));
          
          setAvailableCars(cars);
          
          if (formData.selectedVehicleClass) {
            const updatedCar = cars.find(c => c.id === formData.selectedVehicleClass);
            if (updatedCar) {
              updateFormData('backendCarData', updatedCar);
            }
          }
        } catch (error) {
          console.error('[Journey Builder] updateRoundTrip error:', error);
        } finally {
          setIsLoadingCars(false);
        }
      };
      updateRoundTrip();
    }
  }, [formData.isRoundTrip]);

  useEffect(() => {
    if (isReadyToSubmitJourney() && !isSubmittingJourney) {
      handleJourneySubmit();
    }
  }, [currentDate, formData.pickupTime, formData.selectedRoute, formData.manualDestination]);

  // ==================
  // RENDER HELPERS
  // ==================

  const shouldShowDateTime = () => {
    return (formData.selectedRoute || formData.manualDestination) || formData.bookingType === 'rental';
  };

  const shouldShowVehicleSelection = () => {
    return formData.orderId && !isSubmittingJourney;
  };

  // ==================
  // RENDER
  // ==================

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-6" style={{ color: hotelData.theme.primaryColor }}>
        Plan Your Journey
      </h2>
      
      {/* SERVICE TYPE TABS */}
      <div className="flex gap-4">
        <button 
          onClick={() => {
            updateFormData("serviceType", "fixPrice");
            updateFormData("bookingType", "airport");
          }} 
          className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
            formData.serviceType === "fixPrice" 
              ? "shadow-md scale-[1.02]" 
              : "bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-500"
          }`} 
          style={{ 
            backgroundColor: formData.serviceType === "fixPrice" ? hotelData.theme.accentColor : undefined, 
            color: formData.serviceType === "fixPrice" ? hotelData.theme.primaryColor : undefined,
            borderColor: formData.serviceType === "fixPrice" ? 'transparent' : undefined
          }}
        >
          <CalendarCheck className={`w-5 h-5 ${formData.serviceType === "fixPrice" ? "" : "text-neutral-400"}`} />
          <span>Reservation</span>
        </button>
        {hotelData.services.rental.enabled && (
          <button 
            onClick={() => {
              updateFormData("serviceType", "rental");
              updateFormData("bookingType", "rental");
            }} 
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
              formData.serviceType === "rental" 
                ? "shadow-md scale-[1.02]" 
                : "bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-500"
            }`} 
            style={{ 
              backgroundColor: formData.serviceType === "rental" ? hotelData.theme.accentColor : undefined, 
              color: formData.serviceType === "rental" ? hotelData.theme.primaryColor : undefined,
              borderColor: formData.serviceType === "rental" ? 'transparent' : undefined
            }}
          >
            <Car className={`w-5 h-5 ${formData.serviceType === "rental" ? "" : "text-neutral-400"}`} />
            <span>Car Rental</span>
          </button>
        )}
      </div>

      {/* DESTINATION SELECTION (Reservation) */}
      {formData.serviceType === "fixPrice" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-neutral-700">Select Route</h3>
            <RouteSelector
              routes={hotelData.routes}
              selectedRouteId={formData.selectedRoute}
              onRouteSelect={handleFixedRouteSelect}
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
              onDestinationSelect={handleManualDestinationSelect}
              onInputFocus={() => {
                updateFormData('selectedRoute', null);
                updateFormData('selectedVehicleClass', null);
                updateFormData('selectedVehicle', null);
              }}
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
      )}

      {/* RENTAL FIELDS */}
      {formData.serviceType === "rental" && (
        <div className="space-y-6 animate-slideDown">
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
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-neutral-300 bg-white hover:border-neutral-400'
                }`}
                style={{
                  borderColor: formData.withDriver === true ? hotelData.theme.accentColor : undefined,
                  backgroundColor: formData.withDriver === true ? `${hotelData.theme.accentColor}10` : undefined
                }}
              >
                <div className="flex items-center justify-center gap-2">
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
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-neutral-300 bg-white hover:border-neutral-400'
                }`}
                style={{
                  borderColor: formData.withDriver === false ? hotelData.theme.accentColor : undefined,
                  backgroundColor: formData.withDriver === false ? `${hotelData.theme.accentColor}10` : undefined
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Self Drive</span>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-neutral-800">
              Rental Duration <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.rentalDuration || ''}
              onChange={(e) => updateFormData('rentalDuration', e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select duration...</option>
              <option value="6_hours">6 Jam</option>
              <option value="12_hours">12 Jam</option>
              <option value="24_hours">24 Jam (1 Hari)</option>
              <option value="2_days">2 Hari</option>
              <option value="3_days">3 Hari</option>
              <option value="week">1 Minggu</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-neutral-800">
              Return Location <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.returnLocation || ''}
              onChange={(e) => updateFormData('returnLocation', e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select return location...</option>
              <option value="classic_hotel">Classic Hotel (Same as Pickup)</option>
              <option value="halim_airport">Halim Perdanakusuma Airport (HLP)</option>
            </select>
          </div>
        </div>
      )}

      {/* DATE/TIME SECTION */}
      {shouldShowDateTime() && (
        <div className="space-y-6 animate-slideDown bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg" style={{ backgroundColor: hotelData.theme.accentColor }}>
              📅
            </div>
            <h3 className="text-xl font-bold" style={{ color: hotelData.theme.primaryColor }}>When?</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-3">
                {isRental ? 'Rental Date' : 'Pickup Date'}
              </label>
              <input 
                type="date" 
                min={minDate} 
                value={currentDate || ''} 
                onChange={(e) => updateFormData(dateField, e.target.value)} 
                className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 focus:border-amber-500 focus:outline-none transition-all text-lg" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-3">Pickup Time</label>
              <input 
                type="time" 
                min={minTime}
                value={formData.pickupTime || ''} 
                onChange={handleTimeChange} 
                className={`w-full px-6 py-4 rounded-xl border-2 focus:outline-none transition-all text-lg ${
                  timeIsInvalid 
                    ? 'border-red-500 focus:border-red-600 bg-red-50' 
                    : 'border-neutral-200 focus:border-amber-500'
                }`}
              />
              {minTime && (
                <p className={`text-xs mt-2 ${timeIsInvalid ? 'text-red-600 font-semibold' : 'text-neutral-500'}`}>
                  {timeIsInvalid ? '⚠️ ' : ''}Earliest available: {minTime}
                </p>
              )}
            </div>
          </div>

          {/* Time Invalid Warning */}
          {timeIsInvalid && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <h3 className="font-bold text-red-800 mb-1">Invalid Pickup Time</h3>
                  <p className="text-red-700 text-sm">
                    Please select a time at least 60 minutes from now. Earliest available time is {minTime}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Urgent Night Service Warning */}
          {(isPickupUrgentNight(formData) || isReturnUrgentNight(formData)) && (
            <div className="p-5 bg-amber-50 border-2 border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🌙</div>
                <div className="flex-1">
                  <h3 className="font-bold text-amber-800 mb-1">Urgent Night Service Booking</h3>
                  <div className="text-amber-700 text-sm space-y-1">
                    {!formData.isRoundTrip && (
                      <p>Anda memesan untuk jam malam dengan waktu kurang dari 24 jam. Setelah pembayaran, mohon konfirmasi ketersediaan sopir via WhatsApp.</p>
                    )}
                    {formData.isRoundTrip && (
                      <>
                        {isPickupUrgentNight(formData) && <p>• <strong>Penjemputan:</strong> Jam malam, kurang dari 24 jam</p>}
                        {isReturnUrgentNight(formData) && <p>• <strong>Kepulangan:</strong> Jam malam, kurang dari 24 jam</p>}
                        <p className="mt-2">Setelah pembayaran, mohon konfirmasi ketersediaan sopir via WhatsApp.</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Return Date & Time (Round Trip Only) */}
          {formData.isRoundTrip && (
            <div className="animate-slideDown">
              <div className="p-6 bg-white rounded-2xl border-2 border-neutral-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg" style={{ backgroundColor: hotelData.theme.accentColor }}>
                    ↩
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: hotelData.theme.primaryColor }}>Return Journey</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-3">Return Date</label>
                    <input 
                      type="date" 
                      min={formData.pickupDate}
                      value={formData.returnDate || ''} 
                      onChange={(e) => updateFormData("returnDate", e.target.value)} 
                      className={`w-full px-6 py-4 rounded-xl border-2 focus:outline-none transition-all text-lg ${
                        formData.returnDate && formData.pickupDate && new Date(formData.returnDate) < new Date(formData.pickupDate)
                          ? 'border-red-500 bg-red-50'
                          : 'border-neutral-200 focus:border-amber-500'
                      }`}
                    />
                    {formData.returnDate && formData.pickupDate && new Date(formData.returnDate) < new Date(formData.pickupDate) && (
                      <p className="text-xs text-red-600 font-semibold mt-2">
                        ⚠️ Return date cannot be before pickup date
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-3">Return Time</label>
                    <input 
                      type="time" 
                      value={formData.returnTime || ''} 
                      onChange={(e) => updateFormData("returnTime", e.target.value)} 
                      className={`w-full px-6 py-4 rounded-xl border-2 focus:outline-none transition-all text-lg ${
                        returnDateTimeIsInvalid
                          ? 'border-red-500 bg-red-50'
                          : 'border-neutral-200 focus:border-amber-500'
                      }`}
                    />
                    {returnDateTimeIsInvalid && (
                      <p className="text-xs text-red-600 font-semibold mt-2">
                        ⚠️ Return time must be after pickup time
                      </p>
                    )}
                    <p className="text-xs text-neutral-500 mt-2">
                      💡 Tip: Consider flight arrival + baggage claim time
                    </p>
                  </div>
                </div>
                
                {formData.pickupDate && (!formData.returnDate || !formData.returnTime) && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                      ⚠️ Please complete both return date and time
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pickup Time Info */}
          {(!currentDate || !formData.pickupTime) && !timeIsInvalid && (
            <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="text-3xl">⏰</div>
                <div>
                  <h3 className="font-bold text-blue-800 mb-2">Pickup Time Constraint</h3>
                  <p className="text-blue-700 text-sm">Pickup time must be at least 1 hour from now.</p>
                </div>
              </div>
            </div>
          )}

          {/* Journey Submitting State */}
          {isSubmittingJourney && (
            <div className="p-6 bg-neutral-50 rounded-xl text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: hotelData.theme.accentColor }}></div>
              <p className="mt-4 text-neutral-600 font-medium">Creating your booking...</p>
            </div>
          )}

          {/* Journey Error */}
          {journeyError && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-700 font-medium">{journeyError}</p>
            </div>
          )}
        </div>
      )}


      {/* VEHICLE SELECTION SECTION */}
      {shouldShowVehicleSelection() && routeSelectionType && formData.serviceType === "fixPrice" && (
        <div className="space-y-8 animate-slideDown">
          
          {/* Vehicle Class Selection - Fixed Route */}
          {routeSelectionType === 'fixed' && hotelData.vehicleClasses && (
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-700">Select Vehicle Class</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hotelData.vehicleClasses.map((vehicleClass) => {
                  const route = hotelData.routes.find(r => r.id === formData.selectedRoute);
                  const pricing = route?.pricing[vehicleClass.id];
                  const isSelected = formData.selectedVehicleClass === vehicleClass.id;
                  
                  return (
                    <button
                      key={vehicleClass.id}
                      onClick={() => updateFormData("selectedVehicleClass", vehicleClass.id)}
                      className={`p-5 rounded-xl text-left transition-all duration-300 border-2 ${
                        isSelected 
                          ? "shadow-lg scale-[1.02] bg-gradient-to-br from-amber-50 to-white" 
                          : "border-neutral-200 hover:border-neutral-300 bg-white"
                      }`}
                      style={{ borderColor: isSelected ? hotelData.theme.accentColor : undefined }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold" style={{ color: hotelData.theme.primaryColor }}>
                          {vehicleClass.name}
                        </h4>
                        {isSelected && (
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: hotelData.theme.accentColor }}
                          >
                            ✓
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 mb-3">{vehicleClass.vehicles.join(", ")}</p>
                      {pricing && (
                        <p className="text-lg font-bold" style={{ color: hotelData.theme.accentColor }}>
                          Rp {(formData.isRoundTrip ? pricing.roundTrip : pricing.oneWay).toLocaleString("id-ID")}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vehicle Class Selection - Manual Destination */}
          {routeSelectionType === 'manual' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-700">Select Vehicle Class</h3>
              
              {isLoadingCars && (
                <div className="p-8 bg-neutral-50 rounded-xl text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: hotelData.theme.accentColor }}></div>
                  <p className="mt-4 text-neutral-600">Loading available vehicles...</p>
                </div>
              )}
              
              {!isLoadingCars && availableCars.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availableCars.map((car) => (
                    <button
                      key={car.id}
                      type="button"
                      onClick={() => handleCarSelect(car)}
                      className={`p-5 rounded-xl text-left transition-all duration-300 border-2 ${
                        formData.selectedVehicleClass === car.id
                          ? 'shadow-lg scale-[1.02] bg-gradient-to-br from-amber-50 to-white'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                      style={{ borderColor: formData.selectedVehicleClass === car.id ? hotelData.theme.accentColor : undefined }}
                    >
                      <div className="flex items-start gap-4">
                        {car.media?.url && (
                          <img 
                            src={car.media.url} 
                            alt={car.typename} 
                            className="w-16 h-16 object-contain"
                          />
                        )}
                        <div className="flex-1">
                          <h5 className="font-bold text-neutral-900 mb-1">{car.typename}</h5>
                          <p className="text-xs text-neutral-600 mb-2">{car.brand}</p>
                          <p className="text-sm font-semibold mb-1" style={{ color: hotelData.theme.accentColor }}>
                            Rp {(car.start_from_price || 0).toLocaleString('id-ID')}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {car.distance?.toFixed(1)} km
                          </p>
                        </div>
                        {formData.selectedVehicleClass === car.id && (
                          <div 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                            style={{ backgroundColor: hotelData.theme.accentColor }}
                          >
                            ✓
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {!isLoadingCars && availableCars.length === 0 && (
                <div className="p-6 bg-neutral-50 rounded-xl text-center">
                  <p className="text-neutral-600">No vehicles available. Please try again.</p>
                </div>
              )}
            </div>
          )}

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

          {/* Trip Type Selection */}
          {formData.selectedVehicleClass && (
            <div className="space-y-3">
              <h3 className="font-semibold text-neutral-700">Trip Type</h3>
              <div className="bg-neutral-100 p-1.5 rounded-xl flex gap-2">
                <button
                  type="button"
                  onClick={() => updateFormData("isRoundTrip", false)}
                  className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all duration-300 relative ${
                    !formData.isRoundTrip 
                      ? "bg-white shadow-md text-neutral-900" 
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      !formData.isRoundTrip ? "border-transparent" : "border-neutral-400"
                    }`}
                    style={{ 
                      backgroundColor: !formData.isRoundTrip ? hotelData.theme.accentColor : "transparent",
                      borderColor: !formData.isRoundTrip ? hotelData.theme.accentColor : undefined
                    }}
                    >
                      {!formData.isRoundTrip && (
                        <div className="w-2 h-2 rounded-full bg-white animate-scaleIn"></div>
                      )}
                    </div>
                    <span>One Way</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => updateFormData("isRoundTrip", true)}
                  className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all duration-300 relative ${
                    formData.isRoundTrip 
                      ? "bg-white shadow-md text-neutral-900" 
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      formData.isRoundTrip ? "border-transparent" : "border-neutral-400"
                    }`}
                    style={{ 
                      backgroundColor: formData.isRoundTrip ? hotelData.theme.accentColor : "transparent",
                      borderColor: formData.isRoundTrip ? hotelData.theme.accentColor : undefined
                    }}
                    >
                      {formData.isRoundTrip && (
                        <div className="w-2 h-2 rounded-full bg-white animate-scaleIn"></div>
                      )}
                    </div>
                    <span>Round Trip</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Price Summary - Fixed Route */}
          {currentPrice && routeSelectionType === 'fixed' && (
            <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-neutral-400 mb-1">
                    {formData.isRoundTrip ? "Round Trip" : "One Way"} • {hotelData.vehicleClasses.find(v => v.id === formData.selectedVehicleClass)?.name}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {hotelData.routes.find(r => r.id === formData.selectedRoute)?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold" style={{ color: hotelData.theme.accentColor }}>
                    Rp {currentPrice.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Price Summary - Manual Destination */}
          {formData.backendCarData && routeSelectionType === 'manual' && (
            <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-neutral-400 mb-1">
                    {formData.isRoundTrip ? "Round Trip" : "One Way"} • {formData.backendCarData.typename}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {formData.manualDestination?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold" style={{ color: hotelData.theme.accentColor }}>
                    Rp {(formData.backendCarData.start_from_price || 0).toLocaleString("id-ID")}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {formData.backendCarData.distance?.toFixed(1)} km
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
