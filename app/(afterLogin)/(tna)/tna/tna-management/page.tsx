'use client';
import React, { useState } from 'react';
import { Input, Tabs } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import RequestsTab from './_components/requestsTab';
import CommitmentsTab from './_components/commitmentsTab';
import ApprovalsTab from './_components/approvalsTab';
import ReportsTab from './_components/reportsTab';

/**
 * Centralised TNA administration for HR, L&D admins and TNA Officers: every
 * request and commitment in the organisation, approval queues and reporting.
 */
const TnaManagementAdminPage = () => {
  const router = useRouter();
  const [employeeLookup, setEmployeeLookup] = useState('');

  const canViewAll = AccessGuard.checkAccess({
    permissions: [Permissions.ViewAllTna],
  });

  const items = [
    ...(canViewAll
      ? [
          {
            key: 'requests',
            label: <span data-cy="tna-admin-tab-requests">TNA Requests</span>,
            children: <RequestsTab />,
          },
          {
            key: 'commitments',
            label: <span data-cy="tna-admin-tab-commitments">Commitments</span>,
            children: <CommitmentsTab />,
          },
        ]
      : []),
    {
      key: 'approvals',
      label: <span data-cy="tna-admin-tab-approvals">My Approvals</span>,
      children: <ApprovalsTab />,
    },
    ...(canViewAll
      ? [
          {
            key: 'reports',
            label: <span data-cy="tna-admin-tab-reports">Reports</span>,
            children: <ReportsTab />,
          },
        ]
      : []),
  ];

  return (
    <div
      className="page-wrap flex flex-col gap-4"
      id="tnaAdminPageId"
      data-cy="tna-admin-page"
    >
      <CustomBreadcrumb
        title={<span data-cy="tna-admin-title">TNA Management</span>}
        subtitle={
          <nav
            className="flex flex-row flex-wrap items-center text-sm leading-[22px]"
            aria-label="Breadcrumb"
            data-cy="tna-admin-breadcrumb"
          >
            <span data-cy="tna-admin-breadcrumb-root" className="text-black/45">
              Learning and Growth
            </span>
            <span
              data-cy="tna-admin-breadcrumb-separator"
              className="px-2 text-black/45"
            >
              /
            </span>
            <span
              data-cy="tna-admin-breadcrumb-current"
              className="text-black/70"
            >
              TNA Management
            </span>
          </nav>
        }
        titleExtra={
          canViewAll ? (
            <Input
              allowClear
              prefix={<SearchOutlined className="text-black/45" />}
              placeholder="Open employee TNA history (paste employee ID)"
              className="h-10 w-full rounded-[6px] md:w-[340px]"
              value={employeeLookup}
              onChange={(e) => setEmployeeLookup(e.target.value)}
              onPressEnter={() => {
                const value = employeeLookup.trim();
                if (value) {
                  router.push(`/tna/tna-management/employee/${value}`);
                }
              }}
              data-cy="tna-admin-employee-lookup"
            />
          ) : undefined
        }
      />

      <div
        className="box-border rounded-[8px] border border-[#D9D9D9] bg-white p-4"
        data-cy="tna-admin-content"
      >
        <Tabs
          defaultActiveKey={canViewAll ? 'requests' : 'approvals'}
          items={items}
          data-cy="tna-admin-tabs"
        />
      </div>
    </div>
  );
};

export default TnaManagementAdminPage;
