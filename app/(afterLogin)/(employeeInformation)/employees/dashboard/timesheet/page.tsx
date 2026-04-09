'use client';

import React from 'react';
import CustomBreadcrumb from '@/components/common/breadCramp';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import EmployeeAttendance from './_components/EmployeeAttendance';
import { Breadcrumb } from 'antd';
import Link from 'next/link';

export default function TimesheetDashboardPage() {
  return (
    <div
      className="h-auto w-full pr-2"
      id="timesheet-dashboard-page"
      data-cy="timesheet-dashboard-page"
    >
      <BlockWrapper className="h-auto w-full bg-white">
        <div
          className=""
          id="timesheet-dashboard-header"
          data-cy="timesheet-dashboard-header"
        >
          <div
            className=""
            data-cy="timesheet-dashboard-header-left"
            id="timesheet-dashboard-header-left"
          >
            <CustomBreadcrumb
              href="/employees/dashboard"
              title={
                <div
                  className="flex items-start gap-3"
                  data-cy="timesheet-dashboard-title"
                >
                  <span
                    className="text-[30px] leading-9 font-semibold text-[#1f1f1f]"
                    data-cy="vp-update-header-title-text"
                  >
                    Dashboard
                  </span>
                </div>
              }
              subtitle={
                <Breadcrumb
                  items={[
                    {
                      title: (
                        <Link
                          className="text-xs sm:text-sm"
                          href="/employees/manage-employees"
                        >
                          Employee
                        </Link>
                      ),
                    },
                    {
                      title: (
                        <Link
                          className="text-xs sm:text-sm"
                          href="/employees/dashboard"
                        >
                          Dashboard
                        </Link>
                      ),
                    },
                    {
                      title: (
                        <span
                          className="text-xs sm:text-sm"
                          data-cy="employee-dashboard-breadcrumb-employee"
                        >
                          Timesheet
                        </span>
                      ),
                    },
                  ]}
                />
              }
              data-cy="employee-dashboard-breadcrumb"
            />
          </div>
        </div>

        <div
          data-cy="timesheet-dashboard-content"
          id="timesheet-dashboard-content"
        >
          <EmployeeAttendance />
        </div>
      </BlockWrapper>
    </div>
  );
}
