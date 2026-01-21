/**
 * Centralized API Configuration
 * Single source of truth for all API-related configuration
 */

/**
 * Get default API URL based on environment
 * @returns {string} Default API base URL
 */
const getDefaultAPIURL = () => {
  // In production build, use production URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://evista.id';
  }
  // In development, use dev URL
  return 'https://bhisa-dev-v1.evista.id';
};

/**
 * API Configuration Object
 * Use this throughout the application for all backend API calls
 */
export const API_CONFIG = {
  /**
   * Base URL for Evista backend API
   * Priority: NEXT_PUBLIC_EVISTA_API_URL > environment-based default
   */
  baseURL: process.env.NEXT_PUBLIC_EVISTA_API_URL || getDefaultAPIURL(),
  
  /**
   * Default headers for API requests
   */
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  /**
   * Request timeout in milliseconds
   */
  timeout: 30000,
};

/**
 * Helper to get authorization header
 * @param {string} token - JWT token
 * @returns {object} Authorization header object
 */
export const getAuthHeader = (token) => ({
  'Authorization': `Bearer ${token}`,
});
