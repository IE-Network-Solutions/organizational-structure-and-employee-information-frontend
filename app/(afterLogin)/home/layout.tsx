'use client';

import { FC, ReactNode, useMemo } from 'react';
import { Tabs, Button, Badge } from 'antd';
import { MOCK_APPROVAL_TOTAL_PENDING } from '@/config/homeApprovalsMock';
import { usePathname, useRouter } from 'next/navigation';
import type { TabsProps } from 'antd';
import { FaPlus } from 'react-icons/fa';
import {
  buildSubscribedModuleCodes,
  getHomePageTitle,
  getHomeTabFromPathname,
  getHomeTabHref,
  getVisibleHomeTabs,
} from '@/config/homeTabs';
import { useGetModules } from '@/store/server/features/tenant-management/modules/queries';
import { useGetSubscriptionByTenant } from '@/store/server/features/tenant-management/manage-subscriptions/queries';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Subscription } from '@/types/tenant-management';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import HomeTimesheetProviders from './_components/HomeTimesheetProviders';
import BasicInfo from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/[id]/_components/basicInfo';

interface HomeLayoutProps {
  children: ReactNode;
}

const HomeLayout: FC<HomeLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useIsMobile();
  const { tenantId, userId } = useAuthenticationStore();
  const { setIsShowLeaveRequestSidebar } = useMyTimesheetStore();

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
  const pageTitle = getHomePageTitle(activeKey);

  const handleTabChange = (key: string) => {
    router.push(getHomeTabHref(key));
  };

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
          className="mr-3 h-10 shrink-0"
          data-cy="home-new-leave-request-button"
        >
          New Request
        </Button>
      </AccessGuard>
    ) : undefined;

  const tabItems: TabsProps['items'] = visibleTabs.map((tab) => ({
    key: tab.key,
    label: (
      <div
        className="m-0 whitespace-nowrap text-base font-semibold text-inherit"
        data-cy={`home-${tab.key}-tab-label`}
        id={`home-${tab.key}-tab-label`}
      >
        {tab.key === 'approvals' ? (
          <Badge
            count={MOCK_APPROVAL_TOTAL_PENDING}
            size="small"
            offset={[8, 0]}
          >
            <span data-cy="home-approvals-tab-label-text">{tab.label}</span>
          </Badge>
        ) : (
          tab.label
        )}
      </div>
    ),
  }));

  const showTimesheetProviders = visibleTabs.some((tab) =>
    ['schedule', 'leave', 'attendance', 'approvals', 'overview'].includes(
      tab.key,
    ),
  );

  return (
    <div
      id="home-layout"
      data-cy="home-layout"
      className="-mx-2 min-h-screen bg-[#F6F7FF] min-[769px]:-mx-6"
    >
      <div
        className="min-h-screen"
        data-cy="home-layout-inner"
        id="home-layout-inner"
      >
        <div
          className="overflow-hidden rounded-lg border border-[#DFE3FF] bg-white shadow-[0_18px_42px_rgba(54,54,240,0.1)]"
          data-cy="home-personal-shell"
          id="home-personal-shell"
        >
          {userId ? (
            <BasicInfo
              id={userId}
              variant="personalHero"
              data-cy="home-personal-hero"
            />
          ) : (
            <section
              className="relative overflow-hidden bg-primary px-5 py-8 sm:px-8 lg:px-10"
              data-cy="home-personal-hero-fallback"
              id="home-personal-hero-fallback"
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-[#5C5CFF] via-[#3636F0] to-[#2727B8]"
                data-cy="home-personal-hero-fallback-gradient"
              />
              <h1
                className="relative m-0 text-[34px] font-semibold leading-tight text-white sm:text-[42px]"
                data-cy="home-page-title-fallback"
                id="home-page-title-fallback"
              >
                {pageTitle}
              </h1>
            </section>
          )}

          <div
            className={
              userId
                ? 'grid min-h-[540px] lg:grid-cols-[300px_minmax(0,1fr)]'
                : 'min-h-[540px]'
            }
            data-cy="home-personal-grid"
          >
            {userId ? (
              <BasicInfo
                id={userId}
                variant="personalSidebar"
                data-cy="home-personal-sidebar"
              />
            ) : null}
            <div
              className="min-w-0 bg-white"
              data-cy="home-personal-content"
              id="home-personal-content"
            >
              <div
                className="bg-white"
                data-cy="home-tabs-container"
                id="home-tabs-container"
              >
                <div className="px-0" data-cy="home-tabs-wrapper">
                  <Tabs
                    activeKey={activeKey}
                    onChange={handleTabChange}
                    items={tabItems}
                    tabBarGutter={0}
                    tabBarExtraContent={leaveRequestAction}
                    tabBarStyle={{
                      marginBottom: 0,
                      marginLeft: 0,
                      paddingLeft: 0,
                      paddingRight: 0,
                    }}
                    className="home-primary-tabs"
                    data-cy="home-tabs"
                    id="home-tabs"
                  />
                </div>
              </div>

              <div
                className="px-4 pb-8 pt-6 sm:px-6 lg:px-8"
                data-cy="home-content-wrapper"
                id="home-content-wrapper"
              >
                <h1
                  className="sr-only"
                  data-cy="home-page-title"
                  id="home-page-title"
                >
                  {pageTitle}
                </h1>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTimesheetProviders && <HomeTimesheetProviders />}
    </div>
  );
};

export default HomeLayout;
