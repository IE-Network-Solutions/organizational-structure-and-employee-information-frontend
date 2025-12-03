'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import AccessGuard from '@/utils/permissionGuard';
import { FaPlus } from 'react-icons/fa';
import { Permissions } from '@/types/commons/permissionEnum';
import ApprovalListTable from './_component/approvalListTable';
import ApprovalFilter from './_component/approvalFilter';
import { useApprovalTNAStore } from '@/store/uistate/features/tna/settings/approval';
import { Button } from 'antd';

const Workflow = () => {
  const router = useRouter();
  const { setApproverType } = useApprovalTNAStore();
  const handleNavigation = () => {
    router.push('/tna/settings/approvals/workFlow');
    setApproverType('');
  };
  return (
    <div className="py-4 px-2 rounded-2xl bg-white w-full" id="tnaApprovalsPageId" data-cy="tna-approvals-page">
      <div className="flex justify-between mb-4 " id="tnaApprovalsPageHeaderId" data-cy="tna-approvals-page-header">
        <h1 className="text-lg font-bold " id="tnaApprovalsPageTitleId" data-cy="tna-approvals-page-title">List Of Approval</h1>
        <AccessGuard permissions={[Permissions.CreateApprovalWorkFlow]} data-cy="tna-approvals-create-guard" id="tnaApprovalsCreateGuardId">
          <Button
            type="primary"
            id="createUserButton"
            data-cy="tna-approvals-create-button"
            className="hidden sm:flex h-10 w-10 sm:w-auto"
            icon={<FaPlus />}
            onClick={handleNavigation}
          >
            <span className="hidden sm:inline" data-cy="tna-approvals-create-button-text" id="tnaApprovalsCreateButtonTextId">Set Approval</span>
          </Button>
        </AccessGuard>
      </div>
      <div className="mb-4" id="tnaApprovalsPageFilterId" data-cy="tna-approvals-page-filter">
        <ApprovalFilter data-cy="tna-approvals-filter" />
      </div>
      <div id="tnaApprovalsPageTableId" data-cy="tna-approvals-page-table">
        <ApprovalListTable data-cy="tna-approvals-table" />
      </div>
    </div>
  );
};

export default Workflow;
