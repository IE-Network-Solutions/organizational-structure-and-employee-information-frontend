import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCookie } from './helpers/storageHelper';
import { useAuthenticationStore } from './store/uistate/features/authentication';

export function middleware(req: NextRequest) {
  try {
    const token = getCookie('token', req);
    const url = req.nextUrl;
    const pathname = url.pathname;
    const excludePath = '/authentication/login';
    const isExcludedPath = pathname.startsWith(excludePath);

    if (!isExcludedPath && !token) {
      return NextResponse.redirect(new URL('/authentication/login', req.url));
    }
    if (isExcludedPath && token) {
      return NextResponse.redirect(
        new URL('/employees/manage-employees', req.url),
      );
    }
    return NextResponse.next();
  } catch (error) {
    return NextResponse.next(); // Proceed to next response in case of error
  }
}
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

