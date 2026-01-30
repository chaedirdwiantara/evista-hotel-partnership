/**
 * Google Sign-in API Route (Proxy)
 * Forwards Google sign-in requests to backend to avoid CORS errors
 * This is a server-side proxy - browser requests go to localhost, 
 * then Next.js forwards to the actual backend server
 */

import { API_CONFIG } from '@/lib/config';

export async function POST(request) {
  try {
    // Get request body from client
    const body = await request.json();
    
    // Forward to backend (server-to-server, no CORS issues)
    const response = await fetch(`${API_CONFIG.baseURL}/api/auth/sign/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend auth error:', response.status, errorText);
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Return response to client
    return Response.json(data);
  } catch (error) {
    console.error('Google auth proxy error:', error);
    return Response.json(
      { error: 'Failed to authenticate with Google', details: error.message },
      { status: 500 }
    );
  }
}
