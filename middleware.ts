import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCookie } from './helpers/storageHelper';

export function middleware(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const pathname = url.pathname;
    const isPublicStaticAsset =
      pathname.startsWith('/image/') || pathname.startsWith('/icons/');
    if (isPublicStaticAsset) {
      return NextResponse.next();
    }

    // TODO: Uncomment and restore token validation and redirects

    const token = getCookie('token', req);
    const calendarCookie = getCookie('activeCalendar', req);
    const loggedUserRole = getCookie('loggedUserRole', req);

    let hasEndedFiscalYear = false;

    if (calendarCookie) {
      // The activeCalendar cookie is stored as a plain end-date string, but
      // older data may hold a JSON object ({ isActive, endDate }). Parse it
      // defensively so a non-JSON value never throws and silently disables the
      // redirects below (which would leave logged-in users stranded on "/").
      let endDate: string | number | Date | null = null;

      try {
        const parsed = JSON.parse(calendarCookie);
        endDate =
          parsed && typeof parsed === 'object'
            ? parsed.isActive
              ? parsed.endDate
              : null
            : parsed;
      } catch {
        endDate = calendarCookie;
      }

      if (endDate) {
        const parsedEndDate = new Date(endDate);
        if (!isNaN(parsedEndDate.getTime()) && parsedEndDate < new Date()) {
          hasEndedFiscalYear = true;
        }
      }
    }

    const excludedPath = [
      '/authentication/login',
      '/authentication/forget-password',
      '/authentication/reset-password',
      '/authentication/2fa',
      '/verify-email-change',
    ];
    const isPublicSurveyRoute = /^\/surveys\/[^/]+\/?$/.test(pathname);
    const isExcludedPath =
      isPublicSurveyRoute ||
      excludedPath.some((path) => pathname.startsWith(path));
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
    '/((?!_next/static|_next/image|favicon.ico|firebase-messaging-sw.js|login-background.png|icons/Logo.svg|manifest.json|manifest.webmanifest|sw.js|sw-push.js|workbox|icons/192.png|icons/512.png).*)',
  ],
};
