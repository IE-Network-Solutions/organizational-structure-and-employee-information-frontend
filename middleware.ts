import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCookie } from './helpers/storageHelper';

export function middleware(req: NextRequest) {
  const token = getCookie('token', req);
  const url = req.nextUrl;

  const excludePaths = ['/home', '/authentication/login', '/signup', '/about'];

  const isExcludedPath = excludePaths.some((path) =>
    url.pathname.startsWith(path),
  );

  if (!isExcludedPath && !token) {
    return NextResponse.redirect(new URL('/authentication/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
