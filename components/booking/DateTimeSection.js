"use client";

import { isPickupUrgentNight, isReturnUrgentNight } from '@/lib/whatsapp-utils';

/**
 * DateTimeSection Component
 * 
 * Date/time selection with validation UI.
 * Extracted from Step1JourneyBuilder.js (lines 526-703)
 * 
 * @param {Object} props
 * @param {Object} props.formData - Current form state
 * @param {Function} props.updateFormData - Form data update handler
 * @param {Object} props.hotelData - Hotel configuration for theme
 * @param {Object} props.validation - Validation states from useDateTimeValidation hook
 * @param {boolean} props.isSubmitting - Journey submission loading state
 * @param {string|null} props.journeyError - Journey submission error
 */
export default function DateTimeSection({ 
  formData, 
  updateFormData, 
  hotelData, 
  validation,
  isSubmitting,
  journeyError
}) {
  const { minDate, minTime, currentDate, dateField, isRental, timeIsInvalid, returnDateTimeIsInvalid } = validation;

  const handleTimeChange = (e) => {
    updateFormData("pickupTime", e.target.value);
  };

  return (
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

      {/* Urgent Night Service RESTRICTION (Blocking) */}
      {validation.nightServiceRestricted && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-pulse">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⛔</div>
            <div>
              <h3 className="font-bold text-red-800 mb-1">Booking Not Allowed</h3>
              <p className="text-red-700 text-sm">
                 Night service (00:00 - 06:00) bookings cannot be made within 24 hours outside of office hours (06:00 - 21:00). Please contact admin or choose a different time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Urgent Night Service Warning (Non-blocking, if not restricted) */}
      {!validation.nightServiceRestricted && (isPickupUrgentNight(formData) || isReturnUrgentNight(formData)) && (
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
        <div key="return-journey" className="animate-slideDown">
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
      {isSubmitting && (
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
  );
}
