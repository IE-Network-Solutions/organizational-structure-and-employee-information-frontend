import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// import { getCookie } from './helpers/storageHelper';

export function middleware(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const pathname = url.pathname;
    
    // Commented out token validation and redirects
    /*
    const token = getCookie('token', req);
    const excludedPath = [
      '/authentication/login',
      '/authentication/forget-password',
      '/authentication/reset-password',
    ];
    const isExcludedPath = excludedPath.some((path) =>
      pathname.startsWith(path),
    );
    const isRootPath = pathname === '/';
    if (!isExcludedPath && !token) {
      return NextResponse.redirect(new URL('/authentication/login', req.url));
    }
    */

    if (pathname === '/onboarding') return NextResponse.next();
    
    // Commented out the redirect for the root path
    /*
    if (!isExcludedPath && isRootPath) {
      if (token) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      } else {
        return NextResponse.redirect(new URL('/authentication/login', req.url));
      }
    }
    */
    
    return NextResponse.next();
  } catch (error) {
    return NextResponse.next(); // Proceed to next response in case of error
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|firebase-messaging-sw.js|login-background.png|icons/Logo.svg).*)',
  ],
};
