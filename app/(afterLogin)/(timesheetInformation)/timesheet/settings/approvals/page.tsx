'use client';
import CustomButton from '@/components/common/buttons/customButton';
import React from 'react';
import ApprovalFilter from './_component/approvalFilter';
import ApprovalListTable from './_component/approvalListTable';
import { FaPlus } from 'react-icons/fa';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { useRouter } from 'next/navigation';

const Workflow = () => {
  const router = useRouter();
  const { setApproverType } = useApprovalStore();

  const handleNavigation = () => {
    router.push('/timesheet/settings/approvals/workFlow');
    setApproverType('');
  };
  return (
    <div>
      <div className="mb-10 flex justify-between">
        <div className="text-2xl font-bold ">List Of Approval</div>

        <CustomButton
          title="Set Approval"
          id="createUserButton"
          icon={<FaPlus className="mr-2" />}
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleNavigation}
        />
      </div>
      <div className="px-5">
        <ApprovalFilter />
        <ApprovalListTable />
      </div>
    </div>
  );
};

export default Workflow;
