'use client';
import { usePathname, useRouter } from 'next/navigation';
import Nav from '@/components/navBar';
import React, { useEffect, useMemo } from 'react';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import type { Subscription } from '@/types/tenant-management';
import { Spin } from 'antd';

/**
 * ConditionalNav component that conditionally renders the Nav component
 * based on the current pathname.
 *
 * @param children The child components to be rendered
 * @returns The Nav component with children inside, or just the children if the pathname is excluded
 */
const ConditionalNav: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const excludeNavPaths = [
    '/authentication/login',
    '/authentication/forget-password',
    '/authentication/reset-password',
    '/authentication/2fa',
    '/authentication/new-password',
    '/onboarding',
    '/signup',
    '/not-found',
    '/surveys/[id]',
    '/job/[tenantID]/[jobId]',
  ];

  const isExcludedPath = !!pathname && excludeNavPaths.includes(pathname);
  const isAdminPath = !!pathname && pathname.startsWith('/admin');

  const tenantId = useAuthenticationStore((s) => s.tenantId);
  const {
    data: subscriptionsData,
    isLoading: subscriptionsLoading,
    isFetching: subscriptionsFetching,
    isFetched: subscriptionsFetched,
  } = useGetSubscriptions(
    tenantId ? { filter: { tenantId: [tenantId] } } : {},
    true,
    !isExcludedPath && !!tenantId,
  );

  const shouldGate =
    !!pathname && !isExcludedPath && !isAdminPath && !!tenantId;
  const isCheckingSubscription =
    shouldGate &&
    !subscriptionsFetched &&
    (subscriptionsLoading || subscriptionsFetching);

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
    if (isCheckingSubscription) return;
    if (!isExpired) return;
    router.replace('/admin/subscription-expired');
  }, [
    pathname,
    isExcludedPath,
    isAdminPath,
    isCheckingSubscription,
    isExpired,
    router,
  ]);

  // Avoid flashing protected pages: wait for subscription check.
  if (isCheckingSubscription) {
    return (
      <div
        data-cy="work-pep-frontend-providers-conditionalnav-tsx-conditionalnav-div-97"
        className="min-h-screen flex items-center justify-center"
      >
        <Spin size="large" />
      </div>
    );
  }

  // While redirecting, avoid flashing protected content.
  if (!isExcludedPath && !isAdminPath && isExpired) {
    return null;
  }

  return <>{isExcludedPath ? children : <Nav>{children}</Nav>}</>;
};

export default ConditionalNav;
