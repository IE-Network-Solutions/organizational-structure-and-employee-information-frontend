'use client';
import CustomButton from '@/components/common/buttons/customButton';
import { useRouter } from 'next/navigation';
import React from 'react';
import AccessGuard from '@/utils/permissionGuard';
import { FaPlus } from 'react-icons/fa';
import { Permissions } from '@/types/commons/permissionEnum';
import ApprovalListTable from './_component/approvalListTable';
import ApprovalFilter from './_component/approvalFilter';
import { useApprovalTNAStore } from '@/store/uistate/features/tna/settings/approval';

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
          <CustomButton
            title="Set Approval"
            id="createUserButton"
            icon={<FaPlus className="mr-2" />}
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleNavigation}
          />
        </AccessGuard>
      </div>
      <div className="px-5">
        <ApprovalFilter />
        <ApprovalListTable />
      </div>
    </div>
  );
};

export default Workflow;
