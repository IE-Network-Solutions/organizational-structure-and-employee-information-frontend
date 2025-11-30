'use client';
import ApprovalWorkFlowSettingComponent from '@/components/Approval/ApprovalWorkFlowSetting';
import { useCreateApproverMutation } from '@/store/server/features/approver/mutation';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { useApprovalTNAStore } from '@/store/uistate/features/tna/settings/approval';
import { APPROVALTYPES } from '@/types/enumTypes';
import { Button, Form } from 'antd';
import { useRouter } from 'next/navigation';
import React from 'react';
import { IoArrowBack } from 'react-icons/io5';

const ApprovalSetting = () => {
  const { mutate: CreateApprover, isSuccess } = useCreateApproverMutation();
  const [form] = Form.useForm();
  const router = useRouter();
  const { approverType } = useApprovalTNAStore();
  const { selections, workflowApplies } = useApprovalStore();

  const handleSubmit = () => {
    const name = form.getFieldValue('workFlownName');
    const description = form.getFieldValue('description');
    const workflowAppliesId = form.getFieldValue('workflowAppliesId');

    const jsonPayload = {
      name: name,
      description: description,
      entityType: workflowApplies,
      entityId: workflowAppliesId,
      approvalType: APPROVALTYPES.TNA,
      approvalWorkflowType:
        approverType === 'Sequential'
          ? 'Sequential'
          : approverType === 'Parallel'
            ? 'Parallel'
            : approverType === 'Conditional'
              ? '  '
              : ' ',
      steps: selections.SectionItemType.flatMap((selection, idx) => {
        const users = Array.isArray(selection.user)
          ? selection.user
          : [selection.user];
        return users.map((userId) => ({
          stepOrder: idx + 1,
          userId: userId,
        }));
      }),
    };
    CreateApprover(
      { values: jsonPayload },
      {
        onSuccess: () => {
          router.push('/tna/settings/approvals');
        },
      },
    );
  };
  const handleBack = () => {
    router.push('/tna/settings/approvals/workFlow');
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
      <ApprovalWorkFlowSettingComponent
        handleSubmit={handleSubmit}
        isSuccess={isSuccess}
        form={form}
        title={'TNA '}
      />
    </div>
  );
};

export default ApprovalSetting;
