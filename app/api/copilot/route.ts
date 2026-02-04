import { NextRequest, NextResponse } from 'next/server';

function getCopilotEndpoint(): string {
  const base =
    process.env.NEXT_PUBLIC_AZURE_APP_SERVICE ||
    // 'https://selamnew-copilot-dev-dbdcc9ahe7eqgbez.eastus-01.azurewebsites.net';
    'https://selamnew-copilot-prod-fwbef9g7ehhacbg7.canadacentral-01.azurewebsites.net';
  const path = (process.env.NEXT_PUBLIC_AZURE_COPILOT_PATH || 'copilot').replace(
    /^\/+/,
    ''
  );
  return `${base.replace(/\/+$/, '')}/${path}`;
}

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

    let endpoint = getCopilotEndpoint();
    if (process.env.NODE_ENV === 'development') {
      console.log('[Copilot proxy] POST', endpoint);
    }

    let response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });

    // If 404, try the other common path (Azure sometimes mounts app at /api)
    const altPath = endpoint.endsWith('/api/copilot') ? 'copilot' : 'api/copilot';
    if (response.status === 404 && altPath) {
      const base = endpoint.replace(/\/(api\/)?copilot\/?$/, '');
      const altEndpoint = `${base}/${altPath}`;
      if (process.env.NODE_ENV === 'development') {
        console.log('[Copilot proxy] 404, retrying POST', altEndpoint);
      }
      response = await fetch(altEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(60000),
      });
      if (response.ok) endpoint = altEndpoint;
    }

    const data = await response.json().catch(() => ({}));

    if (process.env.NODE_ENV === 'development') {
      console.log('[Copilot proxy]', response.status, endpoint);
    }

    if (!response.ok) {
      const serverMessage = data?.detail ?? data?.message ?? null;
      const is404 = response.status === 404;
      const hint = is404
        ? ` (proxy called ${endpoint}; check NEXT_PUBLIC_AZURE_APP_SERVICE and NEXT_PUBLIC_AZURE_COPILOT_PATH, then restart dev server)`
        : '';
      const answer =
        (serverMessage && String(serverMessage).trim()) ||
        `Server error (${response.status})${hint}`;

      return NextResponse.json(
        {
          success: false,
          answer,
          error: serverMessage ?? answer,
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
