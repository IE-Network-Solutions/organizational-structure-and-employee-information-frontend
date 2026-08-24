'use client';

import { useState } from 'react';
import { Breadcrumb, Tabs } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import EmptyState from '@/components/empty';
import { DEMO_LOGGED_IN_EMPLOYEE_ID } from '@/types/timesheet/workSchedule';
import { MOCK_EMPLOYEES } from '@/store/server/features/timesheet/workSchedule/mockData';
import MockBasicInfo from './_components/basicInfo';
import MockGeneral from './_components/general';
import MockJob from './_components/job';

const MOCK_EMPLOYEE =
  MOCK_EMPLOYEES.find((item) => item.id === DEMO_LOGGED_IN_EMPLOYEE_ID) ??
  MOCK_EMPLOYEES[0];

function MockPlaceholderTab({
  title,
  dataCy,
}: {
  title: string;
  dataCy: string;
}) {
  return (
    <div className="py-4" data-cy={dataCy}>
      <EmptyState title={title} description="Nothing to display on this mock tab." compact />
    </div>
  );
}

export default function MockEmployeeDemoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('1');

  const items = [
    {
      key: '1',
      label: 'General',
      children: <MockGeneral employee={MOCK_EMPLOYEE} />,
    },
    {
      key: '2',
      label: 'Job',
      children: <MockJob />,
    },
    {
      key: '3',
      label: 'Documents',
      children: (
        <MockPlaceholderTab
          title="No documents"
          dataCy="mock-employee-demo-documents"
        />
      ),
    },
    {
      key: '4',
      label: 'Role Permission',
      children: (
        <MockPlaceholderTab
          title="No role permissions"
          dataCy="mock-employee-demo-role-permission"
        />
      ),
    },
    {
      key: '5',
      label: 'OffBoarding',
      children: (
        <MockPlaceholderTab
          title="No offboarding tasks"
          dataCy="mock-employee-demo-offboarding"
        />
      ),
    },
    {
      key: '6',
      label: 'Probation',
      children: (
        <MockPlaceholderTab
          title="No probation targets"
          dataCy="mock-employee-demo-probation"
        />
      ),
    },
  ];

  return (
    <div
      className="h-auto min-h-screen"
      data-cy="mock-employee-demo-page"
      id="mock-employee-demo-page"
    >
      <div className="w-full" data-cy="mock-employee-demo-header">
        <CustomBreadcrumb
          onBack={() => router.back()}
          title={
            <span data-cy="mock-employee-demo-title">Employee Details</span>
          }
          titleClassName="text-lg sm:text-xl md:text-2xl !text-gray-900"
          rootClassName="w-full !mb-0 !py-4"
          subtitle={
            <Breadcrumb
              className="text-xs sm:text-sm"
              items={[
                {
                  title: (
                    <span className="text-gray-500">Employee</span>
                  ),
                },
                {
                  title: (
                    <Link
                      className="text-gray-600"
                      href="/employees/manage-employees"
                    >
                      Employee Management
                    </Link>
                  ),
                },
              ]}
              data-cy="mock-employee-demo-breadcrumb"
            />
          }
        />
      </div>

      <MockBasicInfo employee={MOCK_EMPLOYEE} />

      <div data-cy="mock-employee-demo-tabs-wrapper">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          tabBarGutter={16}
          size="small"
          tabBarStyle={{ textAlign: 'center' }}
          data-cy="mock-employee-demo-tabs"
        />
      </div>
    </div>
  );
}
