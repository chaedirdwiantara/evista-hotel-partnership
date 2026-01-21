/**
 * Profile Update API Route
 * Proxies profile update request to backend /api/sauth/myprofile
 * Used to update guest user with passenger data before payment
 */

import { API_CONFIG } from '@/lib/config';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return Response.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    console.log('[Profile Update] Calling backend:', `${API_CONFIG.baseURL}/api/sauth/myprofile`);
    console.log('[Profile Update] Body:', JSON.stringify(body));
    
    const response = await fetch(
      `${API_CONFIG.baseURL}/api/sauth/myprofile`,
      {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    
    console.log('[Profile Update] Response:', response.status, JSON.stringify(data));
    
    if (!response.ok) {
      return Response.json(
        { code: response.status, message: data.message || 'Profile update failed', data: data },
        { status: response.status }
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error('Profile update proxy error:', error);
    return Response.json(
      { code: 500, message: 'Failed to update profile', error: error.message },
      { status: 500 }
    );
  }
}
