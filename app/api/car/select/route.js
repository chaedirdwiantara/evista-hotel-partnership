/**
 * Car Selection API Route
 * Proxies car selection request to backend /api/car/submit
 * This sets the car type for an order, enabling price calculation
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
    const backendUrl = process.env.NEXT_PUBLIC_EVISTA_API_URL || 
                       process.env.NEXT_PUBLIC_EVISTA_BACKEND_URL || 
                       'https://bhisa-dev-v1.evista.id';
    
    console.log('[Car Select] Calling backend:', `${backendUrl}/api/car/submit`);
    console.log('[Car Select] Body:', JSON.stringify(body));
    
    const response = await fetch(
      `${backendUrl}/api/car/submit`,
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
    
    console.log('[Car Select] Response:', response.status, JSON.stringify(data));
    
    if (!response.ok) {
      return Response.json(
        { code: response.status, message: data.message || 'Backend request failed', data: data },
        { status: response.status }
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error('Car selection proxy error:', error);
    return Response.json(
      { code: 500, message: 'Failed to select car', error: error.message },
      { status: 500 }
    );
  }
}
