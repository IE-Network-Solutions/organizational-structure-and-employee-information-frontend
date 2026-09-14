'use client';
import React from 'react';
import { Tabs } from 'antd';
import CustomBreadcrumb from '@/components/common/breadCramp';
import AccessGuard, { useHasPermission } from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import RequestsTab from './_components/requestsTab';
import CommitmentsTab from './_components/commitmentsTab';
import ConfirmationTab from './_components/confirmationTab';
import TrainingApprovalTable from '@/app/(afterLogin)/(tna)/tna/_components/trainingApprovalTable';

/**
 * Centralised TNA administration for HR, L&D admins and TNA Officers: every
 * request and commitment in the organisation, plus the confirmation queue.
 */
const TnaManagementAdminPage = () => {
  const canViewAll = AccessGuard.checkAccess({
    permissions: [Permissions.ViewAllTna],
  });
  const canConfirm = useHasPermission(Permissions.ConfirmTnaCommitment);

  const items = [
    ...(canViewAll
      ? [
          {
            key: 'requests',
            label: (
              <span data-cy="tna-admin-tab-requests">Training Requests</span>
            ),
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
      children: <TrainingApprovalTable />,
    },
    ...(canConfirm
      ? [
          {
            key: 'confirmation',
            label: (
              <span data-cy="tna-admin-tab-confirmation">
                Awaiting Confirmation
              </span>
            ),
            children: <ConfirmationTab />,
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
