/**
 * Manual Destination API Service
 * Client-side service for manual destination features
 * Uses unified authentication via getUserToken (Google Sign-in)
 */

import { getUserToken } from './user-auth';

/**
 * Search for places/locations
 * @param {string} query - Search query (minimum 3 characters)
 * @returns {Promise<Array>} Array of location results
 */
export async function searchPlace(query) {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    const token = await getUserToken();
    if (!token) {
      throw new Error('Failed to get authentication token');
    }

    const response = await fetch(`/api/location/searchplace?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Search place error:', error);
    throw error;
  }
}

/**
 * Select a pickup location (hotel)
 * @param {Object} location - Location object with lat, lng/long, label, address
 * @param {string} orderType - Order type ('later' for scheduled trips)
 * @returns {Promise<Object>} Selected pickup location data
 */
export async function selectPickupLocation(location, orderType = 'later') {
  try {
    const token = await getUserToken();
    if (!token) {
      throw new Error('Failed to get authentication token');
    }

    console.log('[API] Selecting pickup location:', location);

    const response = await fetch('/api/pickup/selectlocation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'manual',
        order_type: orderType,
        lat: location.lat,
        long: location.lng || location.long,
        label: location.label || location.name,
        note: location.address || '',
      }),
    });

    if (!response.ok) {
      throw new Error(`Select pickup failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Select pickup location error:', error);
    throw error;
  }
}

/**
 * Select a destination
 * @param {Object} location - Location object with lat, long, label
 * @param {string} orderType - Order type ('later' for scheduled trips)
 * @returns {Promise<Object>} Selected location data
 */
export async function selectDestination(location, orderType = 'later') {
  try {
    const token = await getUserToken();
    if (!token) {
      throw new Error('Failed to get authentication token');
    }

    const response = await fetch('/api/destination/selectlocation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat: location.lat,
        lat: location.lat,
        long: location.long || location.lng,
        label: location.name || location.label,
        order_type: orderType,
        from: 'manual',
        note: '-',
      }),
    });

    if (!response.ok) {
      throw new Error(`Select destination failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Select destination error:', error);
    throw error;
  }
}

/**
 * Set round trip status
 * @param {boolean} isRoundTrip - True for round trip, false for one way
 * @returns {Promise<Object>} Updated order data
 */
export async function setRoundTrip(isRoundTrip) {
  try {
    const token = await getUserToken();
    if (!token) {
      throw new Error('Failed to get authentication token');
    }

    const response = await fetch('/api/trip/roundtrip', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        is_round_trip: isRoundTrip ? 1 : 0,
      }),
    });

    if (!response.ok) {
      throw new Error(`Set round trip failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Set round trip error:', error);
    throw error;
  }
}

/**
 * Submit trip details (pickup time, etc.)
 * @param {Object} params - Trip parameters
 * @param {string} params.orderType - Order type ('later')
 * @param {string} params.pickupAt - Pickup datetime (format: 'YYYY-MM-DD HH:mm:ss')
 * @returns {Promise<Object>} Trip submission result
 */
export async function submitTrip(params) {
  try {
    const token = await getUserToken();
    if (!token) {
      throw new Error('Failed to get authentication token');
    }

    const response = await fetch('/api/trip/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_type: params.orderType || 'later',
        pickup_at: params.pickupAt,
      }),
    });

    if (!response.ok) {
      throw new Error(`Submit trip failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Submit trip error:', error);
    throw error;
  }
}

/**
 * Get available car list with pricing
 * @param {string} orderType - Order type ('later')
 * @returns {Promise<Array>} Array of available cars with pricing
 */
export async function getCarList(orderType = 'later') {
  try {
    const token = await getUserToken();
    if (!token) {
      throw new Error('Failed to get authentication token');
    }

    const response = await fetch(`/api/car/list?order_type=${orderType}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Get car list failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Get car list error:', error);
    throw error;
  }
}
