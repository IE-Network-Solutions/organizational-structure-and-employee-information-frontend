'use client';
import { usePathname, useRouter } from 'next/navigation';
import Nav from '@/components/navBar';
import WorkspaceNav from '@/components/workspace/WorkspaceNav';
import { CollaborationProvider } from '@/components/collaboration/collaboration-context';
import React, { useEffect, useMemo, useState } from 'react';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import type { Subscription } from '@/types/tenant-management';

import { GlobalStateStore } from '@/store/uistate/features/global';
import { ROLE_COOKIE, usesWorkspaceUi } from '@/utils/navigation/workspaceUi';

/**
 * ConditionalNav component that conditionally renders the Nav component
 * based on the current pathname.
 *
 * @param children The child components to be rendered
 * @returns The Nav component with children inside, or just the children if the pathname is excluded
 */
const ConditionalNav: React.FC<{
  children: React.ReactNode;
  /** Role slug from the `loggedUserRole` cookie, read by the server. */
  initialRoleSlug?: string;
}> = ({ children, initialRoleSlug = '' }) => {
  const pathname = usePathname();
  const router = useRouter();

  // The `user` role gets the workspace UI; everyone else the classic console.
  // The server only sees the role cookie, so the first client render uses it
  // too (matching the server HTML); after mount the signed-in profile decides,
  // which also covers a login or role change within this page load.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  const profileRoleSlug = useAuthenticationStore((s) => s.userData?.role?.slug);
  const Shell = usesWorkspaceUi(
    isMounted ? (profileRoleSlug ?? initialRoleSlug) : initialRoleSlug,
  )
    ? WorkspaceNav
    : Nav;

  // The middleware routes on the role cookie, which can go missing or stale
  // while the session lives on. Keep it in step with the signed-in profile,
  // and send the `user` role from the dashboard to its Home hub.
  useEffect(() => {
    if (!isMounted || !profileRoleSlug) return;
    const cookieRole =
      document.cookie.match(
        new RegExp(`(?:^|;\\s*)${ROLE_COOKIE}=([^;]*)`),
      )?.[1] ?? '';
    if (cookieRole !== profileRoleSlug) {
      useAuthenticationStore.getState().setLoggedUserRole(profileRoleSlug);
    }
    if (usesWorkspaceUi(profileRoleSlug) && pathname === '/dashboard') {
      router.replace('/home/overview');
    }
  }, [isMounted, profileRoleSlug, pathname, router]);

  const { isRouteLoading } = GlobalStateStore();
  const excludeNavPaths = [
    '/authentication/login',
    '/authentication/forget-password',
    '/authentication/reset-password',
    '/authentication/2fa',
    '/authentication/new-password',
    '/verify-email-change',
    '/onboarding',
    '/signup',
    '/not-found',
    '/surveys/[id]',
    '/job/[tenantID]/[jobId]',
  ];
  const isPublicSurveyRoute = /^\/surveys\/[^/]+\/?$/.test(pathname);
  const isExcludedPath =
    isPublicSurveyRoute || excludeNavPaths.includes(pathname);
  const isAdminPath = !!pathname && pathname.startsWith('/admin');

  const tenantId = useAuthenticationStore((s) => s.tenantId);
  const {
    data: subscriptionsData,
    // isLoading: subscriptionsLoading,
    // isFetching: subscriptionsFetching,
    // isFetched: subscriptionsFetched,
  } = useGetSubscriptions(
    tenantId ? { filter: { tenantId: [tenantId] } } : {},
    true,
    !isExcludedPath && !!tenantId,
  );

  // const shouldGate =
  //   !!pathname && !isExcludedPath && !isAdminPath && !!tenantId;
  // const isCheckingSubscription =
  //   shouldGate &&
  //   !subscriptionsFetched &&
  //   (subscriptionsLoading || subscriptionsFetching);

  const isExpired = useMemo(() => {
    if (isExcludedPath || isAdminPath) return false;
    const items = (subscriptionsData as any)?.items as
      | Subscription[]
      | undefined;
    if (!Array.isArray(items) || items.length === 0) return false;

    const now = Date.now();
    // Use the most recent subscription to decide overall tenant state.
    const sorted = [...items].sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    );
    const latest = sorted[0];
    if (!latest) return false;
    if (latest.isActive) return false;
    const endAtMs = latest.endAt ? new Date(latest.endAt).getTime() : NaN;
    return Number.isFinite(endAtMs) && endAtMs < now;
  }, [subscriptionsData, isExcludedPath, isAdminPath]);

  useEffect(() => {
    if (!pathname) return;
    if (isExcludedPath) return;
    if (isAdminPath) return;
    // if (isCheckingSubscription) return;
    if (!isExpired) return;
    router.replace('/admin/subscription-expired');
  }, [
    pathname,
    isExcludedPath,
    isAdminPath,
    // isCheckingSubscription,
    isExpired,
    router,
  ]);

  // Avoid flashing protected pages: wait for subscription check.
  // if (isRouteLoading) {
  //   return (
  //     <div
  //         data-cy="work-pep-frontend-providers-conditionalnav-tsx-route-loading-overlay"
  //         className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30"
  //       >
  //         <Spin size="large" />
  //       </div>
  //   );
  // }

  // While redirecting, avoid flashing protected content.
  if (!isExcludedPath && !isAdminPath && isExpired) {
    return null;
  }

  return (
    <>
      {isExcludedPath ? (
        children
      ) : (
        // Wraps the shell, not the app: the panel is a signed-in surface, and the
        // auth screens have no place to dock it.
        <CollaborationProvider>
          <Shell>{children}</Shell>
        </CollaborationProvider>
      )}
      {isRouteLoading && (
        <>
          <style
            data-cy="work-pep-frontend-providers-conditionalnav-tsx-route-loading-keyframes"
            jsx
            global
          >{`
            @keyframes routeDotMove {
              0%,
              80%,
              100% {
                transform: translateY(0);
                opacity: 0.45;
              }
              40% {
                transform: translateY(-7px);
                opacity: 1;
              }
            }
          `}</style>

          <div
            data-cy="work-pep-frontend-providers-conditionalnav-tsx-route-loading-overlay"
            className="fixed inset-0  flex items-center justify-center overflow-hidden h-screen w-screen"
            style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(1px) saturate(1.6)',
              WebkitBackdropFilter: 'blur(1px) saturate(1.6)',
              animation: 'routeOverlayFadeIn 0.35s ease-out both',
            }}
          >
            {/* Centre card */}
            <div
              data-cy="work-pep-frontend-providers-conditionalnav-tsx-route-loading-center-card"
              className="flex flex-col items-center gap-6"
              style={{
                animation: 'routeOverlayFadeIn 0.5s ease-out 0.1s both',
              }}
            >
              {/* Animated dots */}
              <div
                data-cy="work-pep-frontend-providers-conditionalnav-tsx-route-loading-dots-wrapper"
                className="flex items-center gap-1.5"
              >
                {[0, 1, 2].map((i) => (
                  <div
                    data-cy={`work-pep-frontend-providers-conditionalnav-tsx-route-loading-dot-${i}`}
                    key={i}
                    className="rounded-full"
                    style={{
                      width: 10,
                      height: 10,
                      backgroundColor: '#1E40AF',
                      animation: `routeDotMove 0.9s ease-in-out ${i * 0.18}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ConditionalNav;
