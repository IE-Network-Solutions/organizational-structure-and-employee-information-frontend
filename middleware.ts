import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCookie } from './helpers/storageHelper';

export function middleware(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const pathname = url.pathname;

    // TODO: Uncomment and restore token validation and redirects

    const token = getCookie('token', req);
    const calendarCookie = getCookie('activeCalendar', req);
    const loggedUserRole = getCookie('loggedUserRole', req);

    let hasEndedFiscalYear = false;

    if (calendarCookie) {
      const activeCalendar = JSON.parse(calendarCookie);
      if (
        activeCalendar?.isActive &&
        activeCalendar?.endDate &&
        new Date(activeCalendar?.endDate) < new Date()
      ) {
        hasEndedFiscalYear = true;
      }
    }

    const excludedPath = [
      '/authentication/login',
      '/authentication/forget-password',
      '/authentication/reset-password',
      '/authentication/2fa',
    ];
    const isExcludedPath = excludedPath.some((path) =>
      pathname.startsWith(path),
    );
    const isRootPath = pathname === '/';
    if (!isExcludedPath && !token) {
      return NextResponse.redirect(new URL('/authentication/login', req.url));
    }

    if (
      token &&
      hasEndedFiscalYear &&
      !pathname.startsWith('/organization/settings/fiscalYear/fiscalYearCard')
    ) {
      return NextResponse.redirect(
        new URL('/organization/settings/fiscalYear/fiscalYearCard', req.url),
      );
    }
    if (pathname === '/onboarding') return NextResponse.next();

    // TODO: Uncomment and restore the redirect for the root path

    if (!isExcludedPath && isRootPath) {
      if (token) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      } else {
        return NextResponse.redirect(new URL('/authentication/login', req.url));
      }
    }

    // Protect fiscal year settings routes
    if (
      pathname.startsWith('/organization/settings/fiscalYear/fiscalYearCard')
    ) {
      if (
        !loggedUserRole ||
        (loggedUserRole !== 'owner' && loggedUserRole !== 'admin')
      ) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|firebase-messaging-sw.js|login-background.png|icons/Logo.svg).*)',
  ],
};
