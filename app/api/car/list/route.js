/**
 * Car List API Route
 * Proxies car list request to Evista backend with pricing
 */

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
    
    const backendUrl = process.env.NEXT_PUBLIC_EVISTA_API_URL || process.env.NEXT_PUBLIC_EVISTA_BACKEND_URL || 'https://bhisa-dev-v1.evista.id';
    
    const response = await fetch(
      `${backendUrl}/api/car/list?order_type=${orderType}`,
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
