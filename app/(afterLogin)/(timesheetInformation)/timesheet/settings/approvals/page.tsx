'use client';
import React from 'react';
import ApprovalFilter from './_component/approvalFilter';
import ApprovalListTable from './_component/approvalListTable';
import { FaPlus } from 'react-icons/fa';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { useRouter } from 'next/navigation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { Button } from 'antd';

const Workflow = () => {
  const router = useRouter();
  const { setApproverType } = useApprovalStore();

  const handleNavigation = () => {
    router.push('/timesheet/settings/approvals/workFlow');
    setApproverType('');
  };
  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      id="time-attendance-settings-approvals-container"
      data-cy="time-attendance-settings-approvals-container"
    >
      <div
        className="flex justify-between mb-4"
        id="time-attendance-settings-approvals-header"
        data-cy="time-attendance-settings-approvals-header"
      >
        <h1
          className="text-lg font-bold "
          id="time-attendance-settings-approvals-title"
          data-cy="time-attendance-settings-approvals-title"
        >
          List Of Approval
        </h1>
        <AccessGuard
          permissions={[Permissions.CreateApprovalWorkFlow]}
          data-cy="time-attendance-settings-approvals-add-button-access-guard"
        >
          <Button
            title="Set Approval"
            id="time-attendance-settings-approvals-add-button"
            data-cy="time-attendance-settings-approvals-add-button"
            className="hidden sm:flex h-10 w-10 sm:w-auto "
            icon={<FaPlus data-cy="time-attendance-settings-approvals-add-button-icon" />}
            onClick={handleNavigation}
            type="primary"
          >
            <span id="time-attendance-settings-approvals-add-button-label" data-cy="time-attendance-settings-approvals-add-button-label" className="hidden sm:inline">Set Approval</span>
          </Button>
        </AccessGuard>
      </div>
      <ApprovalFilter data-cy="time-attendance-settings-approvals-filter" />
      <div
        className="overflow-x-auto w-full mt-2"
        id="time-attendance-settings-approvals-table-container"
        data-cy="time-attendance-settings-approvals-table-container"
      >
        <ApprovalListTable data-cy="time-attendance-settings-approvals-table" />
      </div>
    </div>
  );
};

export default Workflow;
