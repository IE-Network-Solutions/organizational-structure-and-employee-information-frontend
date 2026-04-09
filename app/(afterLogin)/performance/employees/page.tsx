'use client';

import React from 'react';
import Link from 'next/link';
import { Breadcrumb } from 'antd';
import CustomBreadcrumb from '@/components/common/breadCramp';
import EmployeePerformanceTable from './_components/EmployeePerformanc';

export default function EmployeesOKRPage() {
  return (
    <div className="min-h-screen " data-cy="okr-all-employee-page">
      <header className="mb-4" data-cy="performance-employees-header">
        <CustomBreadcrumb
          href="/performance"
          title={
            <div
              className="flex items-center gap-3"
              data-cy="performance-employees-title-row"
            >
              <span
                className="text-2xl font-bold text-black"
                data-cy="performance-employees-title-text"
              >
                Performance
              </span>
            </div>
          }
          subtitle={
            <Breadcrumb
              aria-label="Breadcrumb"
              items={[
                {
                  title: (
                    <Link
                      className="text-xs sm:text-sm text-gray-400"
                      href="/okr"
                      data-cy="performance-employees-breadcrumb-okr"
                    >
                      OKR
                    </Link>
                  ),
                },
                {
                  title: (
                    <span
                      className="text-xs sm:text-sm text-gray-600"
                      data-cy="performance-employees-breadcrumb-performance"
                    >
                      Performance
                    </span>
                  ),
                },
              ]}
            />
          }
        />
      </header>
      <EmployeePerformanceTable />
    </div>
  );
}
