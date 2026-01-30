/**
 * User Authentication Service
 * Generates random user credentials and manages JWT tokens for booking flow
 */


import { API_CONFIG } from './config.js';

const API_BASE_URL = API_CONFIG.baseURL;
const ENV_SUFFIX = typeof btoa !== 'undefined' ? btoa(API_BASE_URL).substring(0, 8) : 'default';

const USER_TOKEN_KEY = `evista_user_token_${ENV_SUFFIX}`;
const USER_DATA_KEY = `evista_user_data_${ENV_SUFFIX}`;
const TOKEN_EXPIRY_KEY = `evista_user_token_expiry_${ENV_SUFFIX}`;
const TOKEN_LIFETIME = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// Request locking to prevent duplicate requests (e.g., React StrictMode double-mounting)
let pendingAuthRequest = null;

/**
 * Generate random string for user credentials
 */
function generateRandomId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate random user credentials
 */
function generateRandomUserData() {
  const randomId = generateRandomId();
  const timestamp = Date.now();
  
  return {
    email: `user.${randomId.toLowerCase()}.${timestamp}@evista.temp`,
    google_id: Math.floor(Math.random() * 9000000000) + 1000000000, // 10-digit random number
    fullname: `User-${randomId}`,
    profile_picture: "https://ui-avatars.com/api/?name=Guest&background=6366f1&color=fff&size=200",
    google_token: `temp_token_${randomId}_${timestamp}`,
    fcm_token: `fcm_${randomId}_${timestamp}`.padEnd(163, '0'), // FCM token min 163 chars
  };
}

/**
 * Create new user via Google Sign-in endpoint
 * Uses local API proxy to avoid CORS issues
 */
async function createRandomUser() {
  const userData = generateRandomUserData();
  
  try {
    // Fetch via local API route (proxies to backend, avoiding CORS)
    const response = await fetch('/api/auth/sign/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract token and user data
    const token = data.token?.jwt_token || data.token;
    const user = data.data || data.user;
    
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token received from server');
    }

    // Store token and user data
    const expiry = Date.now() + TOKEN_LIFETIME;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_TOKEN_KEY, token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
    }

    return { token, user };
  } catch (error) {
    console.error('Error creating random user:', error);
    throw error;
  }
}

/**
 * Get user token (create new user if needed)
 * @returns {Promise<string>} JWT token
 */
export async function getUserToken() {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return null;
  }

  // Check existing token
  const existingToken = localStorage.getItem(USER_TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

  // Validate existing token
  if (existingToken && expiry) {
    const expiryTime = parseInt(expiry, 10);
    const isValidString = typeof existingToken === 'string' && 
                          !existingToken.includes('[object Object]') &&
                          existingToken.length > 20;
    
    if (isValidString && Date.now() < expiryTime) {
      return existingToken;
    }
    
    // Clear invalid/expired token
    clearUserToken();
  }

  // If there's already a pending auth request, wait for it
  if (pendingAuthRequest) {
    console.log('[Auth] Waiting for pending auth request...');
    return pendingAuthRequest;
  }

  // Create new random user and store the promise
  pendingAuthRequest = createRandomUser()
    .then(({ token }) => {
      pendingAuthRequest = null; // Clear the lock
      return token;
    })
    .catch(error => {
      pendingAuthRequest = null; // Clear the lock even on error
      throw error;
    });

  return pendingAuthRequest;
}

/**
 * Get stored user data
 * @returns {Object|null} User data object
 */
export function getUserData() {
  if (typeof window === 'undefined') {
    return null;
  }

  const userData = localStorage.getItem(USER_DATA_KEY);
  if (!userData) {
    return null;
  }

  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Clear user token and data (logout)
 */
export function clearUserToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }
}

/**
 * Check if user token exists and is valid
 * @returns {boolean}
 */
export function hasValidUserToken() {
  if (typeof window === 'undefined') {
    return false;
  }

  const token = localStorage.getItem(USER_TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!token || !expiry) {
    return false;
  }

  const expiryTime = parseInt(expiry, 10);
  return Date.now() < expiryTime;
}
