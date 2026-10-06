'use client';

import { ReactNode, useMemo } from 'react';
import { Button } from 'antd';
import { usePathname } from 'next/navigation';
import { FaPlus } from 'react-icons/fa';
import { LuPencil } from 'react-icons/lu';
import {
  buildSubscribedModuleCodes,
  getHomePageTitle,
  getHomeTabFromPathname,
  getVisibleHomeTabs,
  type HomeSubTabDef,
  type HomeTabDef,
} from '@/config/homeTabs';
import { OPEN_HOME_DASHBOARD_EDIT_EVENT } from '@/config/homeDashboardEvents';
import { useGetModules } from '@/store/server/features/tenant-management/modules/queries';
import { useGetSubscriptionByTenant } from '@/store/server/features/tenant-management/manage-subscriptions/queries';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { Subscription } from '@/types/tenant-management';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';

/** The Home tabs this tenant subscribes to and this user may open. */
export const useVisibleHomeTabs = () => {
  const pathname = usePathname();
  const { tenantId } = useAuthenticationStore();

  const { data: modulesData } = useGetModules({ filter: { isActive: true } });
  const { data: subscriptionData } = useGetSubscriptionByTenant(
    tenantId,
    !!tenantId,
  );
  const { data: subscriptionsData } = useGetSubscriptions({
    filter: tenantId ? { tenantId: [tenantId] } : {},
  });

  const subscribedModuleCodes = useMemo(() => {
    const activeSubscriptionFromTenant =
      subscriptionData?.items?.find((s) => s?.isActive) ||
      subscriptionData?.item;
    const subscriptionsList = (subscriptionsData?.items ??
      []) as Subscription[];
    const activeSubscriptionFromList = subscriptionsList.find(
      (s) => s?.isActive,
    );
    const latestSubscriptionFromList = subscriptionsList.length
      ? [...subscriptionsList].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        )[0]
      : undefined;
    const activeSubscription =
      activeSubscriptionFromTenant ||
      activeSubscriptionFromList ||
      latestSubscriptionFromList;
    const subscribedModuleIds = new Set(
      (activeSubscription?.plan?.modules || [])
        .map((m: { moduleId?: string; module?: { id?: string } }) =>
          m.moduleId || m?.module?.id ? String(m.moduleId || m.module?.id) : '',
        )
        .filter(Boolean),
    );
    return buildSubscribedModuleCodes(
      modulesData?.items ?? [],
      subscribedModuleIds,
    );
  }, [modulesData, subscriptionData, subscriptionsData]);

  const visibleTabs = useMemo(
    () => getVisibleHomeTabs(subscribedModuleCodes),
    [subscribedModuleCodes],
  );

  const activeKey = getHomeTabFromPathname(pathname);

  return {
    visibleTabs,
    activeKey,
    pageTitle: getHomePageTitle(activeKey),
  };
};

/** A Home page's name as a banner tab. */
export const homeTabLabel = (key: string, label: string): ReactNode => (
  <span data-cy={`home-${key}-tab-label`} id={`home-${key}-tab-label`}>
    {label}
  </span>
);

/** A view of a Home page (an Approvals inbox, a profile section) as a banner tab. */
export const homeSubTabLabel = (
  tabKey: string,
  subTab: HomeSubTabDef,
): ReactNode => {
  const dataCy = `home-${tabKey}-${subTab.key}-tab-label`;
  return (
    <span data-cy={dataCy} id={dataCy}>
      {subTab.label}
    </span>
  );
};

/**
 * Home's pages this user can open (the workspace sidebar files them under
 * their modules) and the action beside the current page's banner tabs.
 */
export const useHomeBanner = (): {
  visibleTabs: HomeTabDef[];
  extra?: ReactNode;
} => {
  const { visibleTabs, activeKey } = useVisibleHomeTabs();
  const { isMobile } = useIsMobile();
  const { userId } = useAuthenticationStore();
  const { setIsShowLeaveRequestSidebar } = useMyTimesheetStore();

  const leaveRequestAction =
    activeKey === 'leave' && isMobile ? (
      <AccessGuard
        permissions={[Permissions.SubmitLeaveRequest]}
        id="home-new-leave-request-guard"
        data-cy="home-new-leave-request-guard"
      >
        <Button
          type="primary"
          size="large"
          icon={<FaPlus />}
          onClick={() => setIsShowLeaveRequestSidebar(true)}
          className="mr-3 h-10 shrink-0 !border-white !bg-white !text-brand !shadow-none hover:!bg-white/90"
          data-cy="home-new-leave-request-button"
        >
          New Request
        </Button>
      </AccessGuard>
    ) : undefined;
  const overviewEditAction =
    activeKey === 'overview' && userId ? (
      <Button
        type="text"
        icon={<LuPencil size={17} />}
        onClick={() =>
          window.dispatchEvent(new Event(OPEN_HOME_DASHBOARD_EDIT_EVENT))
        }
        className="mr-3 h-9 shrink-0 !text-white hover:!bg-white/15 hover:!text-white"
        data-cy="home-overview-edit-profile-button"
        id="home-overview-edit-profile-button"
      >
        Edit
      </Button>
    ) : undefined;

  return {
    visibleTabs,
    extra: overviewEditAction || leaveRequestAction,
  };
};
