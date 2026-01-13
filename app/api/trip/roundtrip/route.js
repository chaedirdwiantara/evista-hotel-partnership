/**
 * Round Trip API Route
 * Proxies round trip toggle request to Evista backend
 */

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
    const backendUrl = process.env.NEXT_PUBLIC_EVISTA_API_URL || process.env.NEXT_PUBLIC_EVISTA_BACKEND_URL || 'https://bhisa-dev-v1.evista.id';
    
    console.log('[DEBUG] Round trip - Calling backend:', `${backendUrl}/api/trip/roundtrip/set`);
    
    const response = await fetch(
      `${backendUrl}/api/trip/roundtrip/set`,
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
    console.error('Round trip proxy error:', error);
    return Response.json(
      { error: 'Round trip request failed' },
      { status: 500 }
    );
  }
}
