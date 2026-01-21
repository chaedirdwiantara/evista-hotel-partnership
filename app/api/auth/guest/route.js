/**
 * Guest Authentication API Route
 * Proxies guest sign-in request to Evista backend
 */

import { API_CONFIG } from '@/lib/config';

export async function POST(request) {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/api/auth/sign/guest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Backend returns token object with jwt_token inside
    const jwtToken = data.data?.jwt_token || data.token?.jwt_token || data.jwt_token;
    
    return Response.json({
      token: jwtToken, // Return just the JWT string, not the object
      user: data.data?.user || data.user,
    });
  } catch (error) {
    console.error('Guest auth error:', error);
    return Response.json(
      { error: 'Failed to create guest session' },
      { status: 500 }
    );
  }
}
