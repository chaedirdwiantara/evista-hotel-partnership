/**
 * Hotel Payouts API Proxy
 * Forwards GET /api/hotel/[slug]/payouts to the backend to avoid CORS issues.
 */

import { API_CONFIG } from '@/lib/config';

export async function GET(request, { params }) {
  const { slug } = await params;
  const authHeader = request.headers.get('Authorization');

  try {
    const response = await fetch(
      `${API_CONFIG.baseURL}/api/v4/hotel/${slug}/payouts`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(authHeader && { Authorization: authHeader }),
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend payouts fetch error:', response.status, errorText);
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Payouts proxy error:', error);
    return Response.json(
      { error: 'Failed to fetch payouts', details: error.message },
      { status: 500 }
    );
  }
}
