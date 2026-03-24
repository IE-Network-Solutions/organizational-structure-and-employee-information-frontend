'use client';

import React from 'react';
import CustomBreadcrumb from '@/components/common/breadCramp';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import EmployeeAttendance from './_components/EmployeeAttendance';
import { Breadcrumb } from 'antd';
import Link from 'next/link';
import { MdKeyboardArrowLeft } from 'react-icons/md';

export default function TimesheetDashboardPage() {
    return (
        <div
            className="h-auto w-full pr-2"
            id="timesheet-dashboard-page"
            data-cy="timesheet-dashboard-page"
        >
            <BlockWrapper className="h-auto w-full bg-white">
                <div
                    className="flex flex-wrap justify-between items-center px-3 sm:px-6"
                    id="timesheet-dashboard-header"
                    data-cy="timesheet-dashboard-header"
                >
                    <div className="flex items-center gap-2">
                        <Link
                            href="/employees/dashboard"
                            className="w-9 h-9 !text-black flex items-center justify-center rounded bg-white hover:bg-gray-200 border border-gray-300 transition"
                            data-cy="timesheet-dashboard-back-button"
                        >
                            <MdKeyboardArrowLeft className="text-lg sm:text-2xl" />
                        </Link>
                        <CustomBreadcrumb
                            title="Dashboard"
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

                <div>
                    <EmployeeAttendance />
                </div>
            </BlockWrapper>
        </div>
    );
}
