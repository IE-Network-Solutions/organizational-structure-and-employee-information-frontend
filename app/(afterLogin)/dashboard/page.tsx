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
import { useState } from 'react';

export default function Home() {
  useFiscalYearRedirect(); // 👈 Activate fiscal year redirect logic

  const { data: activeCalender, isLoading: isResponseLoading } =
    useGetActiveFiscalYears({
      refetchInterval: 30000, // Keep polling for banner display
    });

  const hasEndedFiscalYear =
    activeCalender?.isActive &&
    activeCalender?.endDate &&
    new Date(activeCalender?.endDate) < new Date();
  const [selectedTenatType, setSelectedTenatType] = useState<
    'performance' | 'essentials' | 'enterprise'
  >('performance');
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
          <span
            className="text-sm font-semibold text-gray-700"
            data-cy="dashboard-tenant-type-label"
          >
            View as:
          </span>
          <select
            value={selectedTenatType}
            onChange={(e) =>
              setSelectedTenatType(
                e.target.value as 'performance' | 'essentials' | 'enterprise',
              )
            }
            className="border rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ minWidth: 120 }}
            data-cy="dashboard-tenant-type-select"
          >
            <option
              value="performance"
              data-cy="dashboard-tenant-type-performance"
            >
              Performance
            </option>
            <option
              value="essentials"
              data-cy="dashboard-tenant-type-essentials"
            >
              Essentials
            </option>
            <option
              value="enterprise"
              data-cy="dashboard-tenant-type-enterprise"
            >
              Enterprise
            </option>
          </select>
          {/* 
          For now, selection is disabled since TenatType is hard-coded.
          In a real implementation, you can lift TenatType into useState and
          update accordingly onChange.
        */}
        </div>
      </div>

      {selectedTenatType !== 'essentials' ? (
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
            {selectedTenatType !== 'essentials' ? (
              <LeftBar />
            ) : (
              <ThisWeeksAttendanceReviewCard />
            )}
          </div>
          <div
            className="md:col-span-5 col-span-12"
            data-cy="dashboard-desktop-rightbar-container"
          >
            {selectedTenatType !== 'essentials' &&
            selectedTenatType !== 'enterprise' ? (
              <RecentFeedbacks />
            ) : (
              <RightBar type={selectedTenatType} />
            )}
          </div>
        </div>
        {selectedTenatType !== 'essentials' ? (
          <EventsCard />
        ) : (
          <EventEssentials />
        )}
      </div>
      {selectedTenatType !== 'essentials' && <Calender />}
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
