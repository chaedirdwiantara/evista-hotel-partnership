/**
 * Custom Hook: useDateTimeValidation
 * 
 * Handles all date/time validation logic for booking forms.
 * Extracted from Step1JourneyBuilder.js (lines 50-118)
 * 
 * @param {Object} formData - The form data object
 * @returns {Object} Validation functions and states
 */
export function useDateTimeValidation(formData) {
  // Determine which date field to use based on booking type
  const isRental = formData.bookingType === 'rental';
  const dateField = isRental ? 'rentalDate' : 'pickupDate';
  const currentDate = formData[dateField];
  
  // Calculate minimum date and time
  const now = new Date();
  // Rental: 6 hours buffer, Reservation: 1 hour buffer
  const bufferHours = isRental ? 6 : 1;
  const minDateTime = new Date(now.getTime() + bufferHours * 60 * 60 * 1000);
  const minDate = minDateTime.toISOString().split("T")[0];
  
  /**
   * Calculate minimum time based on selected date
   * @returns {string} Minimum time in HH:MM format or empty string
   */
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

  /**
   * Check if the selected time is during night hours (00:00-06:00)
   * @returns {boolean}
   */
  const isNightTime = () => {
    if (!formData.pickupTime) return false;
    const hour = parseInt(formData.pickupTime.split(":")[0]);
    return hour >= 0 && hour < 6;
  };

  /**
   * Validate if selected time is valid (after minimum time)
   * @returns {boolean}
   */
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

  /**
   * Check if return datetime is valid (after pickup datetime)
   * @returns {boolean}
   */
  const isReturnDateTimeValid = () => {
    if (!formData.isRoundTrip || !currentDate || !formData.pickupTime || !formData.returnDate || !formData.returnTime) {
      return true;
    }
    const pickupDateTime = new Date(currentDate + 'T' + formData.pickupTime);
    const returnDateTime = new Date(formData.returnDate + 'T' + formData.returnTime);
    return returnDateTime > pickupDateTime;
  };

  /**
   * Check if booking is restricted due to Urgent Night Service rules.
   * Definition of "Urgent Night Service": Booking for 00:00 - 06:00 AND Booking time is < 24 hours from now.
   * Blocking Condition: Cannot make Urgent Night Service booking if outside Office Hours (21:00 - 06:00).
   * @returns {boolean}
   */
  const isNightServiceRestricted = () => {
    if (!formData.pickupTime || !currentDate) return false;

    const now = new Date();
    
    // 1. Check Definition of "Night Service" (00-06)
    const [h, m] = formData.pickupTime.split(':').map(Number);
    const isNightHours = h >= 0 && h < 6;

    if (!isNightHours) return false;

    // 2. Check Definition of "< 24 Hours"
    const tripDateTime = new Date(`${currentDate}T${formData.pickupTime}:00`);
    const diffHours = (tripDateTime - now) / (1000 * 60 * 60);
    const isWithin24Hours = diffHours < 24;

    // "Urgent Night Service" = Night Hours + Within 24 Hours
    const isUrgentNightService = isNightHours && isWithin24Hours;

    if (!isUrgentNightService) return false;

    // 3. Blocking Condition: Outside Admin Office Hours (06:00 - 21:00)
    // Office Open: 06 <= hour < 21. Outside: hour < 6 OR hour >= 21
    const currentHour = now.getHours();
    const isOutsideOfficeHours = currentHour < 6 || currentHour >= 21;

    // Block if it is Urgent Night Service AND we are outside office hours
    return isOutsideOfficeHours;
  };

  // Calculate derived states
  const minTime = getMinTime();
  const timeIsInvalid = !isTimeValid();
  const returnDateTimeIsInvalid = !isReturnDateTimeValid();
  const nightServiceRestricted = isNightServiceRestricted();

  return {
    // Values
    minDate,
    minTime,
    currentDate,
    dateField,
    isRental,
    
    // Validation states
    timeIsInvalid,
    returnDateTimeIsInvalid,
    nightServiceRestricted, 
    
    // Functions
    getMinTime,
    isNightTime,
    isTimeValid,
    isReturnDateTimeValid,
  };
}
