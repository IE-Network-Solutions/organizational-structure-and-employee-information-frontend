import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCookie } from './helpers/storageHelper';

export function middleware(req: NextRequest) {
  try {
    const token = getCookie('token', req);
    const url = req.nextUrl;
    const pathname = url.pathname;
    const excludePath = '/authentication/login';
    const isExcludedPath = pathname.startsWith(excludePath);
    const isRootPath = pathname === '/';
    if (!isExcludedPath && !token) {
      return NextResponse.redirect(new URL('/authentication/login', req.url));
    }

    if (pathname === '/onboarding') return NextResponse.next();
    if (!isExcludedPath && isRootPath) {
      if (token) {
        return NextResponse.redirect(
          new URL('/dashboard', req.url),
        );
      } else {
        return NextResponse.redirect(new URL('/authentication/login', req.url));
      }
    }
    return NextResponse.next();
  } catch (error) {
    return NextResponse.next(); // Proceed to next response in case of error
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|firebase-messaging-sw.js|login-background.png).*)',
  ],
};
