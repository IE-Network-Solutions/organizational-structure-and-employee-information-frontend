'use client';

import React from 'react';
import CustomBreadcrumb from '@/components/common/breadCramp';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { useGetCombinedHrDashboard } from '@/store/server/features/employees/approval/queries';
import EmployeeDashboardStatsCards from './_components/employee-dashboard-stats-cards';
import EmployeeTodaysAttendanceCard from './_components/employee-todays-attendance-card';
import EmployeeHiringFunnelCard from './_components/employee-hiring-funnel-card';
import HireVsResignationTrendChart from './_components/HireVsResignationTrendChart';
import EmployeeLeave from './_components/employee-leave';
import RecentHrActions from './_components/recent-hr-actions';

export default function EmployeeDashboardPage() {
  const { data: combinedHrData, isLoading: combinedHrLoading } =
    useGetCombinedHrDashboard();
  return (
    <div
      className="h-auto w-full md:pr-2 pr-0"
      id="employee-dashboard-page"
      data-cy="employee-dashboard-page"
    >
      <BlockWrapper className="h-auto w-full bg-white">
        <div
          className="flex flex-wrap justify-between items-center"
          id="employee-dashboard-header"
          data-cy="employee-dashboard-header"
        >
          <CustomBreadcrumb
            title="Employee Dashboard"
            showBottomSeparator={false}
            data-cy="employee-dashboard-breadcrumb"
          />
        </div>

        <div
          className=""
          id="employee-dashboard-content"
          data-cy="employee-dashboard-content"
        >
          <EmployeeDashboardStatsCards
            combinedHrData={combinedHrData}
            loading={combinedHrLoading}
          />
          <div
            className="grid grid-cols-12 gap-4"
            data-cy="employee-dashboard-grid"
          >
            <div
              className="col-span-12 md:mt-6 mt-2"
              data-cy="employee-dashboard-todays-attendance-section"
            >
              <EmployeeTodaysAttendanceCard />
            </div>

            <div
              className="md:mt-6 mt-2 md:col-span-3 col-span-12"
              data-cy="employee-dashboard-hiring-funnel-section"
            >
              <EmployeeHiringFunnelCard />
            </div>
            <div
              className="md:mt-6 mt-2 md:col-span-9 col-span-12"
              data-cy="employee-dashboard-hire-vs-resignation-section"
            >
              <HireVsResignationTrendChart />
            </div>
            <div
              className="md:mt-6 mt-2 md:col-span-8 col-span-12"
              data-cy="employee-dashboard-leave-section"
            >
              <EmployeeLeave />
            </div>
            <div
              className="md:mt-6 mt-2 md:col-span-4 col-span-12"
              data-cy="employee-dashboard-recent-hr-actions-section"
            >
              <RecentHrActions />
            </div>
          </div>
        </div>
      </BlockWrapper>
    </div>
  );
}
