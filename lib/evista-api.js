/**
 * Evista API Service
 * Handles all API calls to Evista backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_EVISTA_API_URL || "https://bhisa-dev-v1.evista.id";

// Generate a unique key suffix based on the API URL to prevent cross-environment token issues
const ENV_SUFFIX = btoa(API_BASE_URL).substring(0, 8);

/**
 * Guest Token Management
 * Guest tokens are stored in localStorage and refreshed as needed
 */
class GuestTokenManager {
  static TOKEN_KEY = `evista_guest_token_${ENV_SUFFIX}`;
  static TOKEN_EXPIRY_KEY = `evista_guest_token_expiry_${ENV_SUFFIX}`;

  static async getToken() {
    // Check if we have a valid token
    const token = typeof window !== "undefined" ? localStorage.getItem(this.TOKEN_KEY) : null;
    const expiry = typeof window !== "undefined" ? localStorage.getItem(this.TOKEN_EXPIRY_KEY) : null;

    if (token && expiry && Date.now() < parseInt(expiry)) {
      return token;
    }

    // Token expired or doesn't exist, get new one
    return await this.refreshToken();
  }

  static async refreshToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/sign/guest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to get guest token");
      }

      const data = await response.json();
      
      // Store token with 24-hour expiry
      const token = data.data?.token || data.token?.jwt_token || data.token;
      const expiry = Date.now() + (24 * 60 * 60 * 1000);
      
      if (typeof window !== "undefined") {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());
      }

      return token;
    } catch (error) {
      console.error("Error getting guest token:", error);
      throw error;
    }
  }

  static clearToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    }
  }
}

/**
 * API Request Helper
 */
async function apiRequest(endpoint, options = {}, retryCount = 0) {
  const token = await GuestTokenManager.getToken();
  
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
    GuestTokenManager.clearToken();
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
  const token = await GuestTokenManager.getToken();
  
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
    getGuestToken: () => GuestTokenManager.getToken(),
    clearGuestToken: () => GuestTokenManager.clearToken(),
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
  },

  /**
   * Car/Vehicle Management
   */
  cars: {
    /**
     * Select car type for an order
     * Required before payment to set ref_cars_types_id for price calculation
     */
    selectCar: async (carTypeId, orderType) => {
      return localApiRequest("/api/car/select", {
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
   * Payment & Checkout
   */
  checkout: {
    /**
     * Get available payment options (QRIS, VA, etc.)
     */
    getPaymentOptions: async () => {
      return apiRequest("/api/checkout/v3/paymentoption");
    },

    /**
     * Submit checkout and create payment
     */
    submitCheckout: async (checkoutData) => {
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
