'use client';
import { ApprovalWorkFlowComponent } from '@/components/Approval/approvalWorkFlow';
import { useApprovalTNAStore } from '@/store/uistate/features/tna/settings/approval';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import React from 'react';
import { IoArrowBack } from 'react-icons/io5';

const Workflow = () => {
  const router = useRouter();

  const { setApproverType } = useApprovalTNAStore();

  const onChange = (value: string) => {
    setApproverType(value);
    if (value) {
      router.push('/tna/settings/approvals/workFlow/approvalSetting');
    }
  };

  const handleBack = () => {
    setApproverType('');
    router.push('/tna/settings/approvals');
  };
  return (
    <div>
      <div className="mb-4 flex justify-between">
        <Button
          className="flex items-center justify-center space-x-2 px-4 py-2 font-bold bg-[#3636F0] text-white hover:bg-[#2d2dbf]"
          onClick={handleBack}
          aria-label="Go back"
        >
          <IoArrowBack className="text-white" />
          <span className="hidden sm:inline"> Back</span>
        </Button>
        <div className="text-2xl font-bold" />
      </div>
      <ApprovalWorkFlowComponent onChange={onChange} />
    </div>
  );
};

export default Workflow;
