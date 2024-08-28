import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { useAuthenticationStore } from './store/uistate/features/authentication';

export function middleware(req: NextRequest) {

  try {
    const { token } = useAuthenticationStore.getState(); // Access the Zustand store state directly
    const url = req.nextUrl;
    const excludePath = '/authentication/login';
    const isExcludedPath = url.pathname.startsWith(excludePath);
    if (!isExcludedPath && token === '') {
      return NextResponse.redirect(new URL('/authentication/login', req.url));
    }
    return NextResponse.next();
  } catch (error) {
    return NextResponse.next(); // Proceed to next response in case of error
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
