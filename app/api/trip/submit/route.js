/**
 * Trip Submit API Route
 * Proxies trip submission request to Evista backend
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
    
    const response = await fetch(
      `${API_CONFIG.baseURL}/api/trip/submit`,
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
    console.error('Trip submit proxy error:', error);
    return Response.json(
      { error: 'Trip submission failed' },
      { status: 500 }
    );
  }
}
