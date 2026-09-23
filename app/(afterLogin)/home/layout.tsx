'use client';

import { FC, ReactNode, useMemo } from 'react';
import { Button, Badge } from 'antd';
import { MOCK_APPROVAL_TOTAL_PENDING } from '@/config/homeApprovalsMock';
import { usePathname, useRouter } from 'next/navigation';
import { FaPlus } from 'react-icons/fa';
import { LuPencil } from 'react-icons/lu';
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
import { HomeThemeProvider } from './_components/homeTheme';
import BasicInfo from '@/app/(afterLogin)/(employeeInformation)/employees/manage-employees/[id]/_components/basicInfo';
import { OPEN_HOME_DASHBOARD_EDIT_EVENT } from '@/config/homeDashboardEvents';
import './home-theme.css';

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
  // Overview keeps its current dashboard look; every other tab gets the Home
  // design language (brand theme + `.home-surface` styles).
  const homeDesignEnabled = activeKey !== 'overview';

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
          className="mr-3 h-10 shrink-0 !border-white !bg-white !text-primary !shadow-none hover:!bg-white/90"
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
  const tabExtraAction = overviewEditAction || leaveRequestAction;

  const showTimesheetProviders = visibleTabs.some((tab) =>
    ['schedule', 'leave', 'attendance', 'approvals', 'overview'].includes(
      tab.key,
    ),
  );

  return (
    <div
      id="home-layout"
      data-cy="home-layout"
      className="-mx-2 min-h-screen bg-white min-[769px]:-mx-6 lg:flex lg:h-[calc(100dvh-74px)] lg:min-h-0 lg:flex-col lg:overflow-hidden"
    >
      {/* Desktop: the shell fills the viewport under the 74px top header so the
          hero, tabs and sidebar stay put and only the tab content scrolls. */}
      <div
        className="min-h-screen lg:flex lg:min-h-0 lg:flex-1 lg:flex-col"
        data-cy="home-layout-inner"
        id="home-layout-inner"
      >
        <div
          className="bg-white lg:flex lg:min-h-0 lg:flex-1 lg:flex-col"
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
              className="relative bg-primary px-5 py-8 sm:px-8 lg:min-h-[180px] lg:px-10"
              data-cy="home-personal-hero-fallback"
              id="home-personal-hero-fallback"
            >
              <h1
                className="m-0 text-[30px] font-semibold leading-tight text-white sm:text-[34px]"
                data-cy="home-page-title-fallback"
                id="home-page-title-fallback"
              >
                {pageTitle}
              </h1>
            </section>
          )}

          <div
            className={userId ? 'grid lg:grid-cols-[300px_minmax(0,1fr)]' : ''}
            data-cy="home-tabs-container"
            id="home-tabs-container"
          >
            {userId ? (
              <div
                className="hidden bg-primary lg:block"
                data-cy="home-tabs-avatar-rail"
              />
            ) : null}
            <div
              className="home-primary-tabs min-w-0"
              data-cy="home-tabs"
              id="home-tabs"
            >
              <div
                className="ant-tabs-nav flex items-center"
                data-cy="home-tabs-nav"
                id="home-tabs-nav"
              >
                <div
                  className="ant-tabs-nav-wrap min-w-0 flex-1"
                  data-cy="home-tabs-list"
                  id="home-tabs-list"
                >
                  <div
                    className="ant-tabs-nav-list"
                    role="tablist"
                    aria-activedescendant={`home-tabs-tab-${activeKey}`}
                    data-cy="home-tabs-nav-list"
                    id="home-tabs-nav-list"
                  >
                    {visibleTabs.map((tab) => {
                      const selected = activeKey === tab.key;

                      return (
                        <button
                          key={tab.key}
                          type="button"
                          role="tab"
                          aria-selected={selected}
                          onClick={() => handleTabChange(tab.key)}
                          className={`ant-tabs-tab border-0 bg-transparent ${
                            selected ? 'ant-tabs-tab-active' : ''
                          }`}
                          data-cy={`home-tabs-tab-${tab.key}`}
                          id={`home-tabs-tab-${tab.key}`}
                        >
                          <span
                            className="ant-tabs-tab-btn m-0 block whitespace-nowrap text-base font-semibold text-inherit"
                            data-cy={`home-${tab.key}-tab-label`}
                            id={`home-${tab.key}-tab-label`}
                          >
                            {tab.key === 'approvals' ? (
                              <Badge
                                count={MOCK_APPROVAL_TOTAL_PENDING}
                                size="small"
                                offset={[8, 0]}
                              >
                                <span data-cy="home-approvals-tab-label-text">
                                  {tab.label}
                                </span>
                              </Badge>
                            ) : (
                              tab.label
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {tabExtraAction ? (
                  <div
                    className="ant-tabs-extra-content shrink-0"
                    data-cy="home-tabs-extra-content"
                    id="home-tabs-extra-content"
                  >
                    {tabExtraAction}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div
            className={`grid min-h-[540px] lg:min-h-0 lg:flex-1 lg:grid-rows-[minmax(0,1fr)] ${
              userId ? 'lg:grid-cols-[300px_minmax(0,1fr)]' : ''
            }`}
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
              className="min-w-0 bg-white lg:overflow-y-auto"
              data-cy="home-personal-content"
              id="home-personal-content"
            >
              <div
                className={`px-4 pb-8 sm:px-6 lg:px-8 ${
                  homeDesignEnabled ? 'home-surface pt-5 lg:pt-7' : ''
                }`}
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
                <HomeThemeProvider enabled={homeDesignEnabled}>
                  {children}
                </HomeThemeProvider>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTimesheetProviders && (
        <HomeThemeProvider enabled={homeDesignEnabled}>
          <HomeTimesheetProviders />
        </HomeThemeProvider>
      )}
    </div>
  );
};

export default HomeLayout;
