/**
 * Guest Authentication Service
 * Manages guest token for unauthenticated users to access Evista API
 */

const GUEST_TOKEN_KEY = 'evista_guest_token';
const TOKEN_EXPIRY_KEY = 'evista_token_expiry';
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

  // Create new guest token
  try {
    const response = await fetch('/api/auth/guest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create guest token');
    }

    const data = await response.json();
    
    // Validate and store token - ensure it's a valid string
    const token = data.token;
    
    if (token && typeof token === 'string' && token.length > 20) {
      localStorage.setItem(GUEST_TOKEN_KEY, token);
      localStorage.setItem(TOKEN_EXPIRY_KEY, (Date.now() + TOKEN_LIFETIME).toString());
      return token;
    }
    
    // If token is an object, try to extract jwt_token
    if (token && typeof token === 'object' && token.jwt_token) {
      const jwtToken = token.jwt_token;
      localStorage.setItem(GUEST_TOKEN_KEY, jwtToken);
      localStorage.setItem(TOKEN_EXPIRY_KEY, (Date.now() + TOKEN_LIFETIME).toString());
      return jwtToken;
    }

    console.error('Invalid token format received:', token);
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
