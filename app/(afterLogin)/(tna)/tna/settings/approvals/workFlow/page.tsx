'use client';
import { ApprovalWorkFlowComponent } from '@/components/Approval/approvalWorkFlow';
import { useApprovalTNAStore } from '@/store/uistate/features/tna/settings/approval';
import { useRouter } from 'next/navigation';
import React from 'react';

const Workflow = () => {
  const router = useRouter();

  const { setApproverType } = useApprovalTNAStore();

  const onChange = (value: string) => {
    setApproverType(value);
    if (value) {
      router.push('/tna/settings/approvals/workFlow/approvalSetting');
    }
  };
  return (
    <div id="tnaApprovalWorkflowPageId" data-cy="tna-approval-workflow-page">
      <ApprovalWorkFlowComponent onChange={onChange} data-cy="tna-approval-workflow-component" />
    </div>
  );
};

export default Workflow;
