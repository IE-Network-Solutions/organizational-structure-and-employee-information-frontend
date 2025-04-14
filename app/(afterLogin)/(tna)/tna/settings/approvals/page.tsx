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
    <div>
      <div className="mb-10 flex justify-between">
        <div className="text-2xl font-bold ">List Of Approval</div>
        <AccessGuard permissions={[Permissions.CreateApprovalWorkFlow]}>
          <Button
            type="primary"
            id="createUserButton"
            icon={<FaPlus />}
            onClick={handleNavigation}
          >
            <span className="hidden lg:inline">Set Approval</span>
          </Button>
        </AccessGuard>
      </div>
      <div className="px-5">
        <ApprovalFilter />
      </div>
      <div className="flex  overflow-x-auto scrollbar-none w-full">
        <ApprovalListTable />
      </div>
    </div>
  );
};

export default Workflow;
