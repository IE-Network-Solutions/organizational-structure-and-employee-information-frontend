'use client';

import { FC, ReactNode, useMemo } from 'react';
import { Tabs, Button, Breadcrumb } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { TabsProps } from 'antd';
import { FaPlus } from 'react-icons/fa';
import CustomBreadcrumb from '@/components/common/breadCramp';
import {
  buildSubscribedModuleCodes,
  getHomePageTitle,
  getHomeTabFromPathname,
  getHomeTabHref,
  getVisibleHomeTabs,
  HOME_BASE,
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

interface HomeLayoutProps {
  children: ReactNode;
}

const HomeLayout: FC<HomeLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useIsMobile();
  const { tenantId } = useAuthenticationStore();
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
  const showHomeBreadcrumb = activeKey !== 'overview';

  const handleTabChange = (key: string) => {
    router.push(getHomeTabHref(key));
  };

  const tabItems: TabsProps['items'] = visibleTabs.map((tab) => ({
    key: tab.key,
    label: (
      <div
        className={`text-base m-0 whitespace-nowrap ${activeKey === tab.key ? 'text-primary font-semibold' : 'text-gray-800'}`}
        data-cy={`home-${tab.key}-tab-label`}
        id={`home-${tab.key}-tab-label`}
      >
        {tab.label}
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
      className="min-h-screen bg-[#F0F2F5]"
    >
      <div
        className="min-h-screen bg-white"
        data-cy="home-layout-inner"
        id="home-layout-inner"
      >
        <div data-cy="home-header-container" id="home-header-container">
          <div data-cy="home-header-actions">
            <div data-cy="home-header-title-area">
              <CustomBreadcrumb
                title={
                  <span
                    className="text-2xl font-bold text-gray-900"
                    data-cy="home-page-title"
                    id="home-page-title"
                  >
                    {pageTitle}
                  </span>
                }
                subtitle={
                  showHomeBreadcrumb ? (
                    <Breadcrumb
                      className="mt-2 mb-0"
                      items={[
                        {
                          title: (
                            <Link
                              href={`${HOME_BASE}/overview`}
                              data-cy="home-breadcrumb-home-link"
                            >
                              Home
                            </Link>
                          ),
                        },
                        {
                          title: (
                            <span data-cy="home-breadcrumb-current">
                              {pageTitle}
                            </span>
                          ),
                        },
                      ]}
                      data-cy="home-breadcrumb"
                    />
                  ) : null
                }
              />
            </div>
            {activeKey === 'leave' && isMobile && (
              <AccessGuard permissions={[Permissions.SubmitLeaveRequest]}>
                <Button
                  type="primary"
                  size="large"
                  icon={<FaPlus />}
                  onClick={() => setIsShowLeaveRequestSidebar(true)}
                  className="shrink-0 h-10"
                  data-cy="home-new-leave-request-button"
                >
                  New Request
                </Button>
              </AccessGuard>
            )}
          </div>
        </div>

        <div
          className="bg-white mb-4"
          data-cy="home-tabs-container"
          id="home-tabs-container"
        >
          <div className="px-0" data-cy="home-tabs-wrapper">
            <Tabs
              activeKey={activeKey}
              onChange={handleTabChange}
              items={tabItems}
              tabBarStyle={{
                marginBottom: 0,
                marginLeft: 0,
                paddingLeft: 0,
                paddingRight: 0,
              }}
              className="[&_.ant-tabs-tab]:py-4 [&_.ant-tabs-tab-btn]:py-2 [&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-nav-wrap]:!px-0 [&_.ant-tabs-nav-list]:!px-0 [&_.ant-tabs-nav-wrap]:before:!left-0 [&_.ant-tabs-nav-wrap]:after:!right-0 [&_.ant-tabs-nav-wrap]:overflow-x-auto [&_.ant-tabs-nav-wrap]:scrollbar-none"
              data-cy="home-tabs"
              id="home-tabs"
            />
          </div>
        </div>

        <div
          className="px-0 pb-6"
          data-cy="home-content-wrapper"
          id="home-content-wrapper"
        >
          {children}
        </div>
      </div>

      {showTimesheetProviders && <HomeTimesheetProviders />}
    </div>
  );
};

export default HomeLayout;
