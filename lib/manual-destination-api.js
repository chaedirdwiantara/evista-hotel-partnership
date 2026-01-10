/**
 * Manual Destination API Service
 * Client-side service for manual destination features
 */

import { getGuestToken } from './guest-auth';

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
    const token = await getGuestToken();
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
 * Select a destination
 * @param {Object} location - Location object with lat, long, label
 * @param {string} orderType - Order type ('direct' or 'rental')
 * @returns {Promise<Object>} Selected location data
 */
export async function selectDestination(location, orderType = 'direct') {
  try {
    const token = await getGuestToken();
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
        long: location.long,
        label: location.name || location.label,
        order_type: orderType,
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
