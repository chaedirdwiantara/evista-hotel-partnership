/**
 * Hotel Routes API Route (Proxy)
 * Forwards hotel routes requests to backend to avoid CORS errors
 */

import { API_CONFIG } from '@/lib/config';

export async function GET(request, { params }) {
  const { slug } = await params;
  
  // Get authorization header from client request
  const authHeader = request.headers.get('Authorization');
  
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/api/hotel/${slug}/routes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend hotel routes fetch error:', response.status, errorText);
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Hotel routes proxy error:', error);
    return Response.json(
      { error: 'Failed to fetch hotel routes', details: error.message },
      { status: 500 }
    );
  }
}
