'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { fetchCurrentUserAndUpdateStore } from '@/store/server/features/employees/authentication/queries';

const EXCLUDE_REFRESH_PATHS = [
  '/authentication/login',
  '/authentication/forget-password',
  '/authentication/reset-password',
  '/authentication/2fa',
  '/authentication/new-password',
  '/onboarding',
  '/signup',
  '/not-found',
];

function isExcludedPath(pathname: string): boolean {
  if (EXCLUDE_REFRESH_PATHS.includes(pathname)) return true;
  if (pathname.startsWith('/authentication/')) return true;
  if (pathname.startsWith('/onboarding')) return true;
  if (pathname.startsWith('/signup')) return true;
  if (pathname.startsWith('/not-found')) return true;
  if (pathname.startsWith('/surveys/')) return true;
  if (/^\/job\/[^/]+\/[^/]+/.test(pathname)) return true;
  return false;
}

/**
 * Refreshes current user (including permissions) from backend on every route change
 * and when the tab gains focus, so permissions come from Redis/backend instead of localStorage.
 * Renders nothing.
 */
export default function UserSessionRefresher() {
  const pathname = usePathname();
  const token = useAuthenticationStore((s) => s.token);
  const localId = useAuthenticationStore((s) => s.localId);
  const prevPathname = useRef<string | null>(null);

  // Refresh on pathname change or initial mount when on an auth route
  useEffect(() => {
    if (isExcludedPath(pathname) || !token || !localId) return;

    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      fetchCurrentUserAndUpdateStore();
    }
  }, [pathname, token, localId]);

  // Refresh when tab/window gains focus (e.g. admin changed permissions while user had tab open)
  useEffect(() => {
    if (isExcludedPath(pathname) || !token || !localId) return;

    const handleFocus = () => {
      fetchCurrentUserAndUpdateStore();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible')
        fetchCurrentUserAndUpdateStore();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [pathname, token, localId]);

  return null;
}
