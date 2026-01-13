export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return Response.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_EVISTA_API_URL || 
                      process.env.NEXT_PUBLIC_EVISTA_BACKEND_URL || 
                      'https://bhisa-dev-v1.evista.id';

    console.log('[Checkout Pay] Request:', { backendUrl, body });

    const response = await fetch(`${backendUrl}/apiv3/checkout/pay`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Checkout Pay] Backend error:', errorText);
      return Response.json(
        { 
          code: response.status,
          message: 'Payment creation failed',
          error: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Checkout Pay] Success:', data);
    return Response.json(data);
    
  } catch (error) {
    console.error('[Checkout Pay] Server error:', error);
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
