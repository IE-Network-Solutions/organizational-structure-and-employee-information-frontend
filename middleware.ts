import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCookie } from './helpers/storageHelper';

/**
 * Core owns the single login page at the origin root (outside this app's
 * /workspace basePath). Send unauthenticated users there with a `redirect` back
 * to where they were headed. The shared `token` cookie means a user already
 * signed in on Core never reaches this redirect.
 */
function coreLoginUrl(req: NextRequest): URL {
  const here = `${req.nextUrl.basePath}${req.nextUrl.pathname}${req.nextUrl.search}`;
  const url = new URL('/login', req.url);
  url.searchParams.set('redirect', here);
  return url;
}

/**
 * A redirect to one of this app's own routes, preserving the /workspace
 * basePath. `new URL('/dashboard', req.url)` would drop the prefix and land on
 * the origin root (Core); cloning req.nextUrl keeps the basePath.
 */
function workspaceUrl(req: NextRequest, pathname: string): URL {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';
  return url;
}

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
    const isPublicSurveyRoute = /^\/surveys\/[^/]+\/?$/.test(pathname);
    const isExcludedPath =
      isPublicSurveyRoute ||
      excludedPath.some((path) => pathname.startsWith(path));
    const isRootPath = pathname === '/';
    if (!isExcludedPath && !token) {
      return NextResponse.redirect(coreLoginUrl(req));
    }

    if (
      token &&
      hasEndedFiscalYear &&
      !pathname.startsWith('/organization/settings/fiscalYear/fiscalYearCard')
    ) {
      return NextResponse.redirect(
        workspaceUrl(req, '/organization/settings/fiscalYear/fiscalYearCard'),
      );
    }
    if (pathname === '/onboarding') return NextResponse.next();

    // TODO: Uncomment and restore the redirect for the root path

    if (!isExcludedPath && isRootPath) {
      if (token) {
        return NextResponse.redirect(workspaceUrl(req, '/dashboard'));
      } else {
        return NextResponse.redirect(coreLoginUrl(req));
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
        return NextResponse.redirect(workspaceUrl(req, '/dashboard'));
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
