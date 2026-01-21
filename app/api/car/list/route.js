/**
 * Car List API Route
 * Proxies car list request to Evista backend with pricing
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

    const { searchParams } = new URL(request.url);
    const orderType = searchParams.get('order_type') || 'later';
    
    const response = await fetch(
      `${API_CONFIG.baseURL}/api/car/list?order_type=${orderType}`,
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
      return Response.json(
        { error: 'Backend request failed', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Car list proxy error:', error);
    return Response.json(
      { error: 'Failed to fetch car list' },
      { status: 500 }
    );
  }
}
