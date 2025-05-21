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
    <div className="p-5 rounded-2xl bg-white  w-full">
      <div className="flex justify-between mb-4 ">
        <h1 className="text-lg font-bold ">List Of Approval</h1>
        <AccessGuard permissions={[Permissions.CreateApprovalWorkFlow]}>
          <Button
            type="primary"
            id="createUserButton"
            icon={<FaPlus />}
            onClick={handleNavigation}
          >
            <span className="hidden sm:inline">Set Approval</span>
          </Button>
        </AccessGuard>
      </div>
      <div className="mb-4">
        <ApprovalFilter />
      </div>
      <div className="overflow-x-auto scrollbar-none w-full">
        <ApprovalListTable />
      </div>
    </div>
  );
};

export default Workflow;
