/**
 * Location Search API Route
 * Proxies location search requests to Evista backend
 */

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get('q');
    const token = request.headers.get('authorization');

    if (!query) {
      return Response.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    if (!token) {
      return Response.json(
        { error: 'Authorization token is required' },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_EVISTA_BACKEND_URL || 'https://bhisa-dev-v1.evista.id';
    
    // Debug: Log what we're sending to backend
    console.log('[DEBUG] Searchplace - Token received:', token?.substring(0, 50) + '...');
    console.log('[DEBUG] Searchplace - Backend URL:', backendUrl);
    
    const response = await fetch(
      `${backendUrl}/api/location/searchplace?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': token, // Token already includes 'Bearer' prefix from client
          'Accept': 'application/json',
        },
      }
    );
    
    // Debug: Log response status
    console.log('[ DEBUG] Searchplace - Backend response status:', response.status);

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Location search error:', error);
    return Response.json(
      { error: 'Failed to search locations' },
      { status: 500 }
    );
  }
}
