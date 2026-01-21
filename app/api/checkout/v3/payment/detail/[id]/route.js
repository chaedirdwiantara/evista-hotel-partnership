import { API_CONFIG } from '@/lib/config';

export async function GET(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return Response.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const { id } = params;

    console.log('[Payment Detail] Request:', { backendUrl: API_CONFIG.baseURL, orderId: id });

    const response = await fetch(`${API_CONFIG.baseURL}/apiv3/checkout/paymentdetail/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Payment Detail] Backend error:', errorText);
      return Response.json(
        { 
          code: response.status,
          message: 'Failed to fetch payment details',
          error: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Payment Detail] Success:', data);
    return Response.json(data);
    
  } catch (error) {
    console.error('[Payment Detail] Server error:', error);
    return Response.json(
      { 
        code: 500,
        message: 'Internal server error',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
