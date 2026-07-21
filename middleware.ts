import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCookie } from './helpers/storageHelper';

const isCore =
  (process.env.IS_CORE ?? process.env.NEXT_PUBLIC_IS_CORE ?? '')
    .trim()
    .toLowerCase() === 'true';

function isLoginPath(pathname: string): boolean {
  return (
    pathname === '/login' ||
    pathname.startsWith('/authentication/login') ||
    pathname.startsWith('/authentication/forget-password') ||
    pathname.startsWith('/authentication/reset-password') ||
    pathname.startsWith('/authentication/2fa')
  );
}

/**
 * Core owns the single login page at the origin root (outside this app's
 * /workspace basePath). Standalone / redesign uses this app's own login route.
 * Never nest a login URL as the `redirect` target — that causes an infinite
 * `/login?redirect=/login?redirect=...` loop.
 */
function loginRedirectUrl(req: NextRequest): URL {
  const pathname = req.nextUrl.pathname;
  const search = req.nextUrl.search;
  const here = `${req.nextUrl.basePath}${pathname}${search}`;

  if (isCore) {
    const url = new URL('/login', req.url);
    if (!isLoginPath(pathname)) {
      url.searchParams.set('redirect', here);
    }
    return url;
  }

  // In-app login uses sessionStorage for post-login return, not a query param.
  return workspaceUrl(req, '/authentication/login');
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
    const canManageFiscalYear =
      getCookie('canManageFiscalYear', req) === 'true';

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
      '/login',
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

    // Standalone redesign has no Core `/login` page — send one clean hop to
    // the in-app login instead of letting `/login` 404 or loop.
    if (!isCore && pathname === '/login') {
      return NextResponse.redirect(workspaceUrl(req, '/authentication/login'));
    }

    if (!isExcludedPath && !token) {
      return NextResponse.redirect(loginRedirectUrl(req));
    }

    if (
      token &&
      hasEndedFiscalYear &&
      canManageFiscalYear &&
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
        return NextResponse.redirect(loginRedirectUrl(req));
      }
    }

    // Protect fiscal year settings routes
    if (
      pathname.startsWith('/organization/settings/fiscalYear/fiscalYearCard')
    ) {
      if (!canManageFiscalYear) {
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
