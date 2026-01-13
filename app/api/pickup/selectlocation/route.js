/**
 * Pickup Location API Route
 * Proxies pickup location selection request to Evista backend
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
    
    console.log('[DEBUG] Select pickup - Calling backend:', `${backendUrl}/api/pickup/selectpickup`);
    
    const response = await fetch(
      `${backendUrl}/api/pickup/selectpickup`,
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
    console.error('Select pickup proxy error:', error);
    return Response.json(
      { error: 'Select pickup request failed' },
      { status: 500 }
    );
  }
}
