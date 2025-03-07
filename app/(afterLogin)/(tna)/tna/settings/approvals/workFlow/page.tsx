'use client';
import { ApprovalWorkFlowComponent } from '@/components/Approval/approvalWorkFlow';
import { useApprovalTNAStore } from '@/store/uistate/features/tna/settings/approval';
import { useRouter } from 'next/navigation';
import React from 'react';

const Workflow = () => {
  const router = useRouter();

  const { approverType, setApproverType } = useApprovalTNAStore();

  const onChange = (value: string) => {
    setApproverType(value);
    if (approverType) {
      router.push('/tna/settings/approvals/workFlow/approvalSetting');
    }
  };
  return (
    <div>
      <ApprovalWorkFlowComponent onChange={onChange} />
    </div>
  );
};

export default Workflow;
