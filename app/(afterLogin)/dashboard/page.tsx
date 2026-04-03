'use client';
import Header from './_components/header';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { Skeleton } from 'antd';
import { Permissions } from '@/types/commons/permissionEnum';
import { useFiscalYearRedirect } from '@/hooks/useFiscalYearRedirect';
import LeftBar from './_components/leftBar';
import RightBar from './_components/rightBar';
import AccessGuard from '@/utils/permissionGuard';

import Calender from './_components/action-plan/calender';
import AttendanceSummaryCards from './_components/attendance-stats';
import ThisWeeksAttendanceReviewCard from './_components/attendance-review';
import RecentFeedbacks from './_components/recent-feedbacks';
import EventsCard from './_components/events';
import EventEssentials from './_components/event-essentials';
import { useEffect, useState } from 'react';
import { useGetSubscriptionByTenant } from '@/store/server/features/tenant-management/manage-subscriptions/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import type { ApiResponse } from '@/types/commons/responseTypes';
import type { Subscription } from '@/types/tenant-management';

type DashboardPlanView =
  | 'Performance Plan'
  | 'Essential Plan '
  | 'Enterprise Plan';

function dashboardPlanFromSubscription(
  data: ApiResponse<Subscription> | undefined,
): DashboardPlanView | undefined {
  const name = data?.item?.plan?.name;
  if (name === 'Performance Plan') return 'Performance Plan';
  if (name === 'Essential Plan ') return 'Essential Plan ';
  if (name === 'Enterprise Plan') return 'Enterprise Plan';
  return undefined;
}

export default function Home() {
  useFiscalYearRedirect(); // 👈 Activate fiscal year redirect logic

  const { data: activeCalender, isLoading: isResponseLoading } =
    useGetActiveFiscalYears({
      refetchInterval: 30000, // Keep polling for banner display
    });
  const { tenantId } = useAuthenticationStore();
  const { data: subscriptionData } = useGetSubscriptionByTenant(
    tenantId,
    !!tenantId,
  );
  console.log(subscriptionData,"subscriptionData");
  const hasEndedFiscalYear =
    activeCalender?.isActive &&
    activeCalender?.endDate &&
    new Date(activeCalender?.endDate) < new Date();
  const [selectedTenatType, setSelectedTenatType] =
    useState<DashboardPlanView>(dashboardPlanFromSubscription(subscriptionData) ?? 'Performance Plan');

  useEffect(() => {
    const plan = dashboardPlanFromSubscription(subscriptionData);
    if (plan) setSelectedTenatType(plan);
  }, [subscriptionData]);

  const mainLayout = (
    <div className="min-h-screen" data-cy="dashboard-main-layout">
      <div
        className="my-5 flex justify-between items-center "
        data-cy="dashboard-header"
      >
        <h1
          className="text-2xl font-bold text-gray-900"
          data-cy="dashboard-header-title"
        >
          Dashboard
        </h1>
        {/* TenatType Options Display */}
        <div
          className="flex gap-2 items-center"
          data-cy="dashboard-tenant-type-control"
        >
          
        </div>
      </div>

      {selectedTenatType !== 'Essential Plan ' ? (
        <Header />
      ) : (
        <AttendanceSummaryCards />
      )}
      <div data-cy="dashboard-content">
        <div
          className="grid grid-cols-12 gap-4 pb-5"
          data-cy="dashboard-desktop-grid"
        >
          <div
            className="md:col-span-7 col-span-12"
            data-cy="dashboard-desktop-leftbar-container"
          >
            {selectedTenatType !== 'Essential Plan ' ? (
              <LeftBar />
            ) : (
              <ThisWeeksAttendanceReviewCard />
            )}
          </div>
          <div
            className="md:col-span-5 col-span-12"
            data-cy="dashboard-desktop-rightbar-container"
          >
            {selectedTenatType !== 'Essential Plan ' &&
            selectedTenatType !== 'Enterprise Plan' ? (
              <RecentFeedbacks />
            ) : (
              <RightBar type={selectedTenatType} />
            )}
          </div>
        </div>
        {selectedTenatType !== 'Essential Plan ' ? (
          <EventsCard />
        ) : (
          <EventEssentials />
        )}
      </div>
      {selectedTenatType !== 'Essential Plan ' && <Calender />}
    </div>
  );

  return (
    <div data-cy="dashboard-page-container">
      {isResponseLoading && <Skeleton active paragraph={{ rows: 0 }} />}
      {hasEndedFiscalYear && (
        <AccessGuard permissions={[Permissions.CreateCalendar]}>
          <div
            className="bg-[#323B49] p-2 rounded-lg h-12 flex items-center justify-start text-md gap-2 cursor-pointer hover:bg-[#3a4354] transition"
            onClick={() => {
              window.location.href =
                '/organization/settings/fiscalYear/fiscalYearCard';
            }}
            title="Go to Fiscal Year Settings"
            data-cy="dashboard-fiscal-year-banner-clickable"
          >
            <span
              className="text-[#FFDE65] px-2"
              data-cy="dashboard-fiscal-year-banner-title"
            >
              Your fiscal year has ended
            </span>
            <span
              className="text-white"
              data-cy="dashboard-fiscal-year-banner-message"
            >
              Please contact your system admin for more information
            </span>
          </div>
        </AccessGuard>
      )}
      {/* If user does not have permission, show non-clickable banner */}
      {hasEndedFiscalYear && (
        <AccessGuard permissions={[]}>
          <div
            className="bg-[#323B49] p-2 rounded-lg h-12 flex items-center justify-start text-md gap-2"
            data-cy="dashboard-fiscal-year-banner-non-clickable"
          >
            <span
              className="text-[#FFDE65] px-2"
              data-cy="dashboard-fiscal-year-banner-title-non-clickable"
            >
              Your fiscal year has ended
            </span>
            <span
              className="text-white"
              data-cy="dashboard-fiscal-year-banner-message-non-clickable"
            >
              Please contact your system admin for more information
            </span>
          </div>
        </AccessGuard>
      )}
      {mainLayout}
    </div>
  );
}
