'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Skeleton } from 'antd';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { fetchCurrentUserAndUpdateStore } from '@/store/server/features/employees/authentication/queries';
import { checkPathnamePermissions } from '@/utils/routePermissions';

const ALWAYS_ALLOWED = new Set(['/unauthorized', '/offline']);

type RoutePermissionGuardProps = {
  children: React.ReactNode;
  /**
   * Optional override. When omitted, uses the shared menu/route permission map.
   */
  canAccess?: (pathname: string) => boolean;
};

/**
 * Blocks page content until auth has hydrated and the current pathname is
 * allowed. Unauthorized deep-links (typed URLs) are redirected to /unauthorized.
 *
 * Does not change page/API data fetching — only gates rendering after a
 * permission check (and optionally refreshes the current user when
 * permissions are missing from the hydrated store).
 */
export default function RoutePermissionGuard({
  children,
  canAccess = checkPathnamePermissions,
}: RoutePermissionGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const hasHydrated = useAuthenticationStore((s) => s.hasHydrated);
  const [allowed, setAllowed] = useState(false);
  const checkedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) {
      setAllowed(false);
      checkedPathRef.current = null;
      return;
    }

    let cancelled = false;

    const run = async () => {
      // Avoid flipping back to skeleton on unrelated store updates for the
      // same path (e.g. userData refresh after the check already passed).
      if (checkedPathRef.current === pathname) {
        return;
      }

      setAllowed(false);

      if (!pathname || ALWAYS_ALLOWED.has(pathname)) {
        if (!cancelled) {
          checkedPathRef.current = pathname;
          setAllowed(true);
        }
        return;
      }

      const state = useAuthenticationStore.getState();
      const isOwner = state.userData?.role?.slug?.toLowerCase() === 'owner';
      const hasNoPermissions =
        !state.userData?.userPermissions ||
        (Array.isArray(state.userData.userPermissions) &&
          state.userData.userPermissions.length === 0);

      if (state.token && state.localId && !isOwner && hasNoPermissions) {
        await fetchCurrentUserAndUpdateStore();
        if (cancelled) return;
      }

      if (cancelled) return;

      if (!canAccess(pathname)) {
        checkedPathRef.current = null;
        router.replace('/unauthorized');
        return;
      }

      checkedPathRef.current = pathname;
      setAllowed(true);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, canAccess, hasHydrated]);

  if (!hasHydrated || !allowed) {
    return (
      <div
        data-cy="route-permission-guard-loading"
        className="flex min-h-0 flex-1 items-center justify-center"
      >
        <Skeleton active />
      </div>
    );
  }

  return <>{children}</>;
}
