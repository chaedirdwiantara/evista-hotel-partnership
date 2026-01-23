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
  
  // Calculate minimum date and time (current time + 60 minutes)
  const now = new Date();
  const minDateTime = new Date(now.getTime() + 60 * 60 * 1000);
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

  // Calculate derived states
  const minTime = getMinTime();
  const timeIsInvalid = !isTimeValid();
  const returnDateTimeIsInvalid = !isReturnDateTimeValid();

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
    
    // Functions
    getMinTime,
    isNightTime,
    isTimeValid,
    isReturnDateTimeValid,
  };
}
