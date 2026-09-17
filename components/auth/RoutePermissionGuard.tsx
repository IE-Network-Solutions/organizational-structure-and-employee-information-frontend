'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Skeleton } from 'antd';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { fetchCurrentUserAndUpdateStore } from '@/store/server/features/employees/authentication/queries';
import { checkPathnamePermissions } from '@/utils/routePermissions';

const PUBLIC_OR_ALWAYS_ALLOWED = new Set(['/unauthorized', '/offline']);

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
 */
export default function RoutePermissionGuard({
  children,
  canAccess = checkPathnamePermissions,
}: RoutePermissionGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const hasHydrated = useAuthenticationStore((s) => s.hasHydrated);
  const userData = useAuthenticationStore((s) => s.userData);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!hasHydrated) {
      setAllowed(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setAllowed(false);

      if (!pathname || PUBLIC_OR_ALWAYS_ALLOWED.has(pathname)) {
        if (!cancelled) setAllowed(true);
        return;
      }

      const state = useAuthenticationStore.getState();
      const isOwner = state.userData?.role?.slug?.toLowerCase() === 'owner';
      const hasNoPermissions =
        !state.userData?.userPermissions ||
        (Array.isArray(state.userData.userPermissions) &&
          state.userData.userPermissions.length === 0);

      if (state.token && state.localId && !isOwner && hasNoPermissions) {
        const success = await fetchCurrentUserAndUpdateStore();
        if (cancelled) return;
          if (!success) {
            const refreshed = useAuthenticationStore.getState();
            const refreshedOwner =
              refreshed.userData?.role?.slug?.toLowerCase() === 'owner';
            const stillNoPerms =
              !refreshed.userData?.userPermissions ||
              (Array.isArray(refreshed.userData.userPermissions) &&
                refreshed.userData.userPermissions.length === 0);
            if (stillNoPerms && !refreshedOwner) {
              router.replace('/unauthorized');
              return;
            }
          }
      }

      if (cancelled) return;

      if (!canAccess(pathname)) {
        router.replace('/unauthorized');
        return;
      }

      setAllowed(true);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, canAccess, hasHydrated, userData]);

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
