/**
 * Select Destination API Route
 * Proxies destination selection requests to Evista backend
 */


import { API_CONFIG } from '@/lib/config';

export async function POST(request) {
  try {
    const token = request.headers.get('authorization');
    const body = await request.json();

    if (!token) {
      return Response.json(
        { error: 'Authorization token is required' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!body.lat || !body.long || !body.label) {
      return Response.json(
        { error: 'Missing required fields: lat, long, label' },
        { status: 400 }
      );
    }
    
    const response = await fetch(
      `${API_CONFIG.baseURL}/api/destination/selectlocation`,
      {
        method: 'POST',
        headers: {
          'Authorization': token, // Token already includes 'Bearer' prefix
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'manual',
          order_type: body.order_type || 'direct',
          lat: body.lat,
          long: body.long,
          label: body.label,
          note: body.note || '-',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Select destination error:', error);
    return Response.json(
      { error: 'Failed to select destination' },
      { status: 500 }
    );
  }
}
