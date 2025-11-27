import { NextRequest, NextResponse } from 'next/server';

const AI_REC_BASE_URL =
  process.env.NEXT_PUBLIC_AI_REC_BASE_URL || 
  'https://selamnew-ai-matching-a8drhxandkdwctea.canadacentral-01.azurewebsites.net';

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

  const res = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  });

  const responseHeaders = new Headers();
  res.headers.forEach((value, key) => {
    if (key.toLowerCase().startsWith('x-') || key === 'content-type') {
      responseHeaders.set(key, value);
    }
  });

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json().catch(() => null);
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


