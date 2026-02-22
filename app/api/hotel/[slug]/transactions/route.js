/**
 * Hotel Transactions API Proxy
 * Forwards GET /api/hotel/[slug]/transactions (with query params) to the
 * backend to avoid CORS issues.
 */

import { API_CONFIG } from '@/lib/config';

export async function GET(request, { params }) {
  const { slug } = await params;
  const authHeader = request.headers.get('Authorization');
  const { searchParams } = new URL(request.url);

  // Forward all supported query params
  const query = new URLSearchParams();
  ['month', 'page', 'per_page'].forEach((key) => {
    const val = searchParams.get(key);
    if (val) query.set(key, val);
  });

  const qs = query.toString() ? `?${query.toString()}` : '';

  try {
    const response = await fetch(
      `${API_CONFIG.baseURL}/api/v4/hotel/${slug}/transactions${qs}`,
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
      console.error('Backend transactions fetch error:', response.status, errorText);
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Transactions proxy error:', error);
    return Response.json(
      { error: 'Failed to fetch transactions', details: error.message },
      { status: 500 }
    );
  }
}
