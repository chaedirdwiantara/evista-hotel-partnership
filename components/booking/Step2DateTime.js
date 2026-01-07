"use client";

import { isPickupUrgentNight, isReturnUrgentNight, isUrgentNightBooking } from '@/lib/whatsapp-utils';

/**
 * Step 2: Date & Time Selection Component
 * Handles pickup/return date and time with validation
 */
export default function Step2DateTime({ formData, updateFormData, hotelData }) {
  // Calculate minimum date and time (current time + 60 minutes)
  const now = new Date();
  const minDateTime = new Date(now.getTime() + 60 * 60 * 1000); // +60 minutes
  const minDate = minDateTime.toISOString().split("T")[0];
  
  // Calculate minimum time based on selected date
  const getMinTime = () => {
    if (!formData.pickupDate) return "";
    
    const selectedDate = new Date(formData.pickupDate + "T00:00:00");
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
    if (!formData.pickupTime || !formData.pickupDate) return true;
    
    const minTime = getMinTime();
    if (!minTime) return true; // No restriction for future dates
    
    // Compare selected time with minimum time
    const [selectedHour, selectedMin] = formData.pickupTime.split(':').map(Number);
    const [minHour, minMin] = minTime.split(':').map(Number);
    
    const selectedTotalMin = selectedHour * 60 + selectedMin;
    const minTotalMin = minHour * 60 + minMin;
    
    return selectedTotalMin >= minTotalMin;
  };

  // Handle time change with validation
  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    updateFormData("pickupTime", selectedTime);
  };

  // Check if return datetime is valid (must be after pickup datetime)
  const isReturnDateTimeValid = () => {
    if (!formData.isRoundTrip || !formData.pickupDate || !formData.pickupTime || !formData.returnDate || !formData.returnTime) {
      return true; // No validation if any field is missing
    }

    const pickupDateTime = new Date(formData.pickupDate + 'T' + formData.pickupTime);
    const returnDateTime = new Date(formData.returnDate + 'T' + formData.returnTime);

    return returnDateTime > pickupDateTime;
  };

  const minTime = getMinTime();
  const timeIsInvalid = !isTimeValid();
  const returnDateTimeIsInvalid = !isReturnDateTimeValid();

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-6" style={{ color: hotelData.theme.primaryColor }}>Choose Date & Time</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">Pickup Date</label>
          <input 
            type="date" 
            min={minDate} 
            value={formData.pickupDate} 
            onChange={(e) => updateFormData("pickupDate", e.target.value)} 
            className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 focus:border-amber-500 focus:outline-none transition-all text-lg" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">Pickup Time</label>
          <input 
            type="time" 
            min={minTime}
            value={formData.pickupTime} 
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

      {/* Urgent Night Service Warning - Smart Combined */}
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

      {/* Return Date & Time - Shown when Round Trip is selected */}
      {formData.isRoundTrip && (
        <div 
          className="animate-slideDown"
          style={{
            animation: 'slideDown 0.3s ease-out'
          }}
        >
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
                  value={formData.returnDate} 
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
                  value={formData.returnTime} 
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

      {/* Pickup Time Constraint Info - Only show when fields are empty, not when invalid */}
      {(!formData.pickupDate || !formData.pickupTime) && !timeIsInvalid && (
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
    </div>
  );
}
