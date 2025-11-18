import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * ZKT Authentication Proxy Route
 *
 * This route acts as a proxy to avoid CORS issues when authenticating
 * with external ZKT servers. The client makes a request to this Next.js
 * API route (same origin, no CORS), which then forwards the request to
 * the ZKT server (server-to-server, no CORS restrictions).
 *
 * POST /api/zkt/auth
 * Body: { url: string, username: string, password: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, username, password } = body;

    // Validate required fields
    if (!url || !username || !password) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: url, username, and password are required',
        },
        { status: 400 },
      );
    }

    // Sanitize URL (remove trailing slash)
    const sanitizedUrl = url.replace(/\/$/, '');
    const endpoint = `${sanitizedUrl}/jwt-api-token-auth/`;

    // Forward the request to the ZKT server
    const response = await axios.post(
      endpoint,
      {
        username,
        password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    // Return the response from ZKT server
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    // Handle errors and return appropriate response
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Unable to authenticate with ZKT server.';

    const statusCode = error?.response?.status || 500;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
