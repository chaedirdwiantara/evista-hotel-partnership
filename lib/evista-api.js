/**
 * Evista API Service
 * Handles all API calls to Evista backend
 */

import { getUserToken, clearUserToken } from './user-auth.js';
import { API_CONFIG } from './config.js';

const API_BASE_URL = API_CONFIG.baseURL;

/**
 * API Request Helper
 */
async function apiRequest(endpoint, options = {}, retryCount = 0) {
  const token = await getUserToken();
  
  const defaultHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  // Handle 401 Unauthorized - could be an invalid cached token
  if (response.status === 401 && retryCount < 1) {
    console.warn("Unauthorized API call. Clearing token and retrying...");
    clearUserToken();
    return apiRequest(endpoint, options, retryCount + 1);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "API request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Local API Request Helper
 * For Next.js API routes (proxies) - uses relative URL without backend base
 */
async function localApiRequest(endpoint, options = {}) {
  const token = await getUserToken();
  
  const defaultHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // Use relative URL for local Next.js API routes
  let response = await fetch(endpoint, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "API request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Evista API Service
 */
export const EvistaAPI = {
  /**
   * Authentication
   */
  auth: {
    getUserToken: () => getUserToken(),
    clearUserToken: () => clearUserToken(),
  },

  /**
   * Profile Management
   */
  profile: {
    /**
     * Update user profile (for guest users before payment)
     * @param {Object} profileData - Profile data {fullname, phone, gender, profile_picture_media_id}
     */
    updateProfile: async (profileData) => {
      return localApiRequest("/api/profile/update", {
        method: "POST",
        body: JSON.stringify({
          fullname: profileData.fullname || "Guest User",
          phone: profileData.phone || "",
          gender: profileData.gender || "male", // Default gender
          profile_picture_media_id: profileData.profile_picture_media_id || 1, // Default avatar
        }),
      });
    },
  },

  /**
   * Car/Fleet Management
   */
  cars: {
    /**
     * Get available cars by order type
     * @param {string} orderType - "rental" or "direct" (airport transfer)
     */
    getAvailableCars: async (orderType = "direct") => {
      return apiRequest(`/api/car/list?order_type=${orderType}`);
    },
  },

  /**
   * Trip/Booking Management
   */
  trips: {
    /**
     * Submit trip details
     */
    submit: async (tripData) => {
      return apiRequest("/api/trip/submit", {
        method: "POST",
        body: JSON.stringify(tripData),
      });
    },

    /**
     * Set round trip
     */
    setRoundTrip: async (isRoundTrip) => {
      return apiRequest("/api/trip/roundtrip/set", {
        method: "POST",
        body: JSON.stringify({ is_round_trip: isRoundTrip }),
      });
    },

    /**
     * Get pickup points list
     */
    getPickupPoints: async (lat, long) => {
      let query = "";
      if (lat && long) {
        query = `?lat=${lat}&long=${long}`;
      }
      return apiRequest(`/api/trip/pickup-point/list${query}`);
    },

    /**
     * Set pickup point
     */
    setPickupPoint: async (pickupPointId, tripType = 'later') => {
      return apiRequest("/api/trip/pickup-point/set", {
        method: "POST",
        body: JSON.stringify({
          ref_pickup_points_id: pickupPointId,
          trip_type: tripType,
        }),
      });
    },
  },

  /**
   * Car/Vehicle Management
   */
  cars: {
    /**
     * Submit car selection for an order
     * Calls /api/car/submit directly (same as evista-customer)
     * Returns order object with pricing: basic_price, platform_fee, discount_amount
     */
    selectCar: async (carTypeId, orderType) => {
      return apiRequest("/api/car/submit", {
        method: "POST",
        body: JSON.stringify({
          type_id: carTypeId,
          order_type: orderType,
        }),
      });
    },

    /**
     * Submit selected car (User specific requirement)
     * Calls /api/car/submit directly
     */
    submitCarSelection: async (carTypeId, orderType) => {
      return apiRequest("/api/car/submit", {
        method: "POST",
        body: JSON.stringify({
          type_id: carTypeId,
          order_type: orderType,
        }),
      });
    },
  },

  /**
   * Location Management
   */
  location: {
    /**
     * Select pickup/destination location
     */
    selectLocation: async (locationData) => {
      return apiRequest("/api/destination/selectlocation", {
        method: "POST",
        body: JSON.stringify(locationData),
      });
    },
  },

  /**
   * Checkout & Payment
   */
  checkout: {
    /**
     * Get checkout overview (v3)
     * Returns order summary, pricing breakdown, promos, and grand total
     */
    getOverview: async () => {
      return localApiRequest("/api/checkout/v3/overview", {
        method: "GET",
      });
    },

    /**
     * Get available payment options (QRIS, VA, etc.)
     */
    getPaymentOptions: async () => {
      return apiRequest("/api/checkout/v3/paymentoption");
    },

    /**
     * Submit payment
     */
    submit: async (checkoutData) => {
      return apiRequest("/api/checkout/v3/pay", {
        method: "POST",
        body: JSON.stringify(checkoutData),
      });
    },

    /**
     * Get payment detail/status
     */
    getPaymentDetail: async (orderId) => {
      return apiRequest(`/api/checkout/v3/payment/detail/${orderId}`);
    },

    /**
     * Apply promo code
     */
    applyPromo: async (promoCode) => {
      return apiRequest("/api/checkout/v2/promo/add", {
        method: "POST",
        body: JSON.stringify({ promo_code: promoCode }),
      });
    },

    /**
     * Remove promo code
     */
    removePromo: async () => {
      return apiRequest("/api/checkout/v2/promo/remove", {
        method: "POST",
      });
    },
  },

  /**
   * Promo/Voucher Management
   */
  promo: {
    /**
     * Get available promos
     */
    getAvailablePromos: async () => {
      return apiRequest("/api/home/promo/list?is_available_only=1");
    },
  },
};

/**
 * Booking Flow Helper
 * Simplified wrapper for complete booking flow
 */
export const BookingFlow = {
  /**
   * Create a complete booking
   * @param {Object} bookingData - Complete booking information
   */
  async createBooking(bookingData) {
    try {
      // Step 1: Submit trip details
      const tripResult = await EvistaAPI.trips.submit({
        pickup_location: bookingData.pickupLocation,
        destination: bookingData.destination,
        pickup_datetime: bookingData.pickupDateTime,
        order_type: bookingData.orderType, // "direct" or "rental"
        duration: bookingData.duration, // For rental
      });

      // Step 2: Set round trip if needed
      if (bookingData.isRoundTrip) {
        await EvistaAPI.trips.setRoundTrip(true);
      }

      // Step 3: Get payment options
      const paymentOptions = await EvistaAPI.checkout.getPaymentOptions();

      // Step 4: Submit checkout with selected payment method
      const checkoutResult = await EvistaAPI.checkout.submitCheckout({
        passenger_name: bookingData.passengerName,
        passenger_phone: bookingData.passengerPhone,
        passenger_email: bookingData.passengerEmail,
        payment_method: bookingData.paymentMethod,
        room_number: bookingData.roomNumber,
        // ... other checkout data
      });

      return {
        success: true,
        orderId: checkoutResult.data.order_id,
        paymentUrl: checkoutResult.data.payment_url,
        paymentData: checkoutResult.data,
      };
    } catch (error) {
      console.error("Booking flow error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export default EvistaAPI;
