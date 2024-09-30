import { NextResponse, NextRequest } from 'next/server';
import { getCookie } from './helpers/storageHelper';
import { validateToken } from './utils/validation';

export async function middleware(req: NextRequest) {
  const token = getCookie('token', req);
  const tenantId = getCookie('tenantId', req);
  const pathname = req.nextUrl.pathname;
  const isLoginPath = pathname === '/authentication/login';

  if (token && tenantId && validateToken(token)) {
    if (isLoginPath) {
      return NextResponse.redirect(
        new URL('/employees/manage-employees', req.url),
      );
    }
  } else if (!isLoginPath) {
    return NextResponse.redirect(new URL('/authentication/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
