import { NextRequest, NextResponse } from 'next/server';

const AZURE_APP_SERVICE_URL =
  process.env.NEXT_PUBLIC_AZURE_APP_SERVICE ||
  'https://selamnew-copilot-prod-fwbef9g7ehhacbg7.canadacentral-01.azurewebsites.net';

// Some Azure deployments mount the app under /api; use env to override path (default: /copilot)
const COPILOT_PATH =
  (process.env.NEXT_PUBLIC_AZURE_COPILOT_PATH || 'copilot').replace(/^\/+/, '');
const COPILOT_ENDPOINT = `${AZURE_APP_SERVICE_URL.replace(/\/+$/, '')}/${COPILOT_PATH}`;

/**
 * Proxies copilot requests from the browser to the Azure App Service.
 * This avoids CORS: the browser calls same-origin /api/copilot, and the server
 * forwards the request to Azure (server-to-server, no CORS).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const auth = request.headers.get('authorization');
    const tenantId = request.headers.get('tenantid');
    const userId = request.headers.get('userid');
    const sessionId = request.headers.get('sessionid');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(auth && { Authorization: auth }),
      ...(tenantId && { tenantId }),
      ...(userId && { userId }),
      ...(sessionId && { sessionId }),
    };

    const response = await fetch(COPILOT_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          answer: data?.detail || data?.message || `Server error (${response.status})`,
          error: data?.detail || data?.message,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to reach the copilot service.';
    return NextResponse.json(
      {
        success: false,
        answer: message,
        error: message,
      },
      { status: 503 }
    );
  }
}
