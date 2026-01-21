/**
 * Checkout Overview API Route (V3)
 * Proxies checkout overview request to Evista backend
 * Returns order summary, pricing breakdown, and promo information
 */

import { API_CONFIG } from '@/lib/config';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return Response.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    console.log('[Checkout Overview] Calling backend:', `${API_CONFIG.baseURL}/api/checkout/v3/overview`);

    const response = await fetch(
      `${API_CONFIG.baseURL}/api/checkout/v3/overview`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Checkout Overview] Backend error:', errorData);
      return Response.json(
        { error: 'Backend request failed', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Checkout Overview] Success:', data);
    return Response.json(data);
    
  } catch (error) {
    console.error('[Checkout Overview] Server error:', error);
    return Response.json(
      { error: 'Failed to fetch checkout overview' },
      { status: 500 }
    );
  }
}
