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
    <div className="p-5 rounded-2xl bg-white h-full">
      <div className="flex justify-between mb-4">
        <h1 className="text-lg font-bold ">List Of Approval</h1>
        <AccessGuard permissions={[Permissions.CreateApprovalWorkFlow]}>
          <Button
            title="Set Approval"
            id="createUserButton"
            className="h-10 w-10 sm:w-auto hidden sm:block"
            icon={<FaPlus />}
            onClick={handleNavigation}
            type="primary"
          >
            <span className="hidden sm:inline">Set Approval</span>
          </Button>
        </AccessGuard>
      </div>
      <ApprovalFilter />
      <div className="overflow-x-auto w-full mt-2">
        <ApprovalListTable />
      </div>
    </div>
  );
};

export default Workflow;
