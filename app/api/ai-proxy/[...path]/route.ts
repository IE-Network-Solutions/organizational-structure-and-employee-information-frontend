import { NextRequest, NextResponse } from 'next/server';

const AI_REC_BASE_URL =
  process.env.NEXT_PUBLIC_AI_REC_BASE_URL ||
  'https://selamnew-endpoint-execfuc7fmgjf5hz.westus2-01.azurewebsites.net';

const buildTargetUrl = (req: NextRequest, pathSegments: string[]) => {
  const endpointPath = '/' + pathSegments.join('/');
  const search = req.nextUrl.search || '';
  // Azure Functions endpoints are under /api (no /v1)
  return `${AI_REC_BASE_URL}/api${endpointPath}${search}`;
};

const proxyRequest = async (
  req: NextRequest,
  context: { params: { path: string[] } },
) => {
  const { path } = context.params;
  const targetUrl = buildTargetUrl(req, path);

  const headers = new Headers();

  // Forward important headers only
  const allowedHeaderNames = [
    'authorization',
    'tenantid',
    'tenantId',
    'content-type',
  ];

  req.headers.forEach((value, key) => {
    if (allowedHeaderNames.includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  // If no tenantId header, add demo-tenant for testing
  if (!headers.has('tenantId') && !headers.has('tenantid')) {
    headers.set('tenantId', 'demo-tenant');
    if (process.env.NODE_ENV === 'development') {
      console.log('[AI Proxy] No tenantId header found, using demo-tenant');
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      const tid = headers.get('tenantId') || headers.get('tenantid');
      console.log('[AI Proxy] Using tenantId:', tid);
    }
  }

  const hasBody =
    req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS';

  let body: BodyInit | null = null;
  if (hasBody) {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const json = await req.json().catch(() => null);
      if (json !== null) {
        body = JSON.stringify(json);
        headers.set('content-type', 'application/json');
      }
    } else {
      const text = await req.text();
      body = text;
      if (contentType) {
        headers.set('content-type', contentType);
      }
    }
  }

  // Log for debugging
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`[AI Proxy] ${req.method} ${targetUrl}`);
    // Log ALL headers being sent to Azure
    const headersObj: Record<string, string> = {};
    headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    // eslint-disable-next-line no-console
    console.log(`[AI Proxy] Headers being sent to Azure:`, headersObj);
  }

  let res: Response;
  try {
    res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error(
      `[AI Proxy] Network error calling ${targetUrl}:`,
      error?.message,
    );
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to connect to Azure Functions',
        details: error?.message,
      }),
      { status: 503, headers: { 'content-type': 'application/json' } },
    );
  }

  // Log response for debugging
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`[AI Proxy] Response status: ${res.status} for ${targetUrl}`);
  }

  const responseHeaders = new Headers();
  res.headers.forEach((value, key) => {
    // Forward CORS headers and content-type
    if (
      key.toLowerCase().startsWith('x-') ||
      key.toLowerCase() === 'content-type' ||
      key.toLowerCase() === 'access-control-allow-origin' ||
      key.toLowerCase() === 'access-control-allow-methods'
    ) {
      responseHeaders.set(key, value);
    }
  });

  // Always set CORS headers for frontend
  if (!responseHeaders.has('access-control-allow-origin')) {
    responseHeaders.set('access-control-allow-origin', '*');
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json().catch(() => null);

    // Log response data in development with more details
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(
        `[AI Proxy] Response data:`,
        typeof data,
        Array.isArray(data) ? `Array(${data.length})` : data,
      );
      if (Array.isArray(data) && data.length > 0) {
        // eslint-disable-next-line no-console
        console.log(`[AI Proxy] First item:`, data[0]);
      }
    }

    const payload =
      data !== null ? JSON.stringify(data) : await res.text().catch(() => '');
    return new NextResponse(payload, {
      status: res.status,
      headers: responseHeaders,
    });
  }

  const text = await res.text().catch(() => '');
  return new NextResponse(text, {
    status: res.status,
    headers: responseHeaders,
  });
};

export const GET = (
  req: NextRequest,
  context: { params: { path: string[] } },
) => proxyRequest(req, context);

export const POST = (
  req: NextRequest,
  context: { params: { path: string[] } },
) => proxyRequest(req, context);

export const PUT = (
  req: NextRequest,
  context: { params: { path: string[] } },
) => proxyRequest(req, context);

export const PATCH = (
  req: NextRequest,
  context: { params: { path: string[] } },
) => proxyRequest(req, context);

export const DELETE = (
  req: NextRequest,
  context: { params: { path: string[] } },
) => proxyRequest(req, context);
