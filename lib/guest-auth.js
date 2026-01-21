/**
 * Guest Authentication Service
 * Manages guest token for unauthenticated users to access Evista API
 */


// IMPORTANT: These keys MUST match evista-api.js GuestTokenManager to ensure same token is used
import { API_CONFIG } from './config.js';

const API_BASE_URL = API_CONFIG.baseURL;
const ENV_SUFFIX = typeof btoa !== 'undefined' ? btoa(API_BASE_URL).substring(0, 8) : 'default';

const GUEST_TOKEN_KEY = `evista_guest_token_${ENV_SUFFIX}`;
const TOKEN_EXPIRY_KEY = `evista_guest_token_expiry_${ENV_SUFFIX}`;
const TOKEN_LIFETIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get guest token from localStorage or create new one
 * @returns {Promise<string>} Guest authentication token
 */
export async function getGuestToken() {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return null;
  }

  // Check existing token
  const existingToken = localStorage.getItem(GUEST_TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

  // Validate existing token - must be a string, not "[object Object]" and not expired
  if (existingToken && expiry) {
    const expiryTime = parseInt(expiry, 10);
    const isValidString = typeof existingToken === 'string' && 
                          !existingToken.includes('[object Object]') &&
                          existingToken.length > 20; // JWT tokens are longer than 20 chars
    
    if (isValidString && Date.now() < expiryTime) {
      return existingToken;
    }
    
    // Clear invalid token
    localStorage.removeItem(GUEST_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }

  // Create new guest token - call backend directly like evista-api.js
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/sign/guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create guest token');
    }

    const data = await response.json();
    
    // Extract token using same logic as evista-api.js GuestTokenManager
    const token = data.data?.token || data.token?.jwt_token || data.token;
    
    if (token && typeof token === 'string' && token.length > 20) {
      localStorage.setItem(GUEST_TOKEN_KEY, token);
      localStorage.setItem(TOKEN_EXPIRY_KEY, (Date.now() + TOKEN_LIFETIME).toString());
      return token;
    }

    console.error('Invalid token format received:', data);
    throw new Error('Invalid token format received from server');
  } catch (error) {
    console.error('Error getting guest token:', error);
    throw error;
  }
}

/**
 * Clear guest token (logout)
 */
export function clearGuestToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GUEST_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }
}

/**
 * Check if guest token exists and is valid
 * @returns {boolean}
 */
export function hasValidGuestToken() {
  if (typeof window === 'undefined') {
    return false;
  }

  const token = localStorage.getItem(GUEST_TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!token || !expiry) {
    return false;
  }

  const expiryTime = parseInt(expiry, 10);
  return Date.now() < expiryTime;
}
