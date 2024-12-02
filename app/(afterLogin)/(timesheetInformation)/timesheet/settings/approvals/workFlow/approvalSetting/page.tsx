'use client';
import ApprovalWorkFlowSettingComponent from '@/components/Approval/ApprovalWorkFlowSetting';
import { useCreateApproverMutation } from '@/store/server/features/approver/mutation';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { APPROVALTYPES } from '@/types/enumTypes';
import { Form } from 'antd';
import { useRouter } from 'next/navigation';

const ApprovalSetting: React.FC<any> = () => {
  const { mutate: CreateApprover, isSuccess } = useCreateApproverMutation();
  const [form] = Form.useForm();
  const router = useRouter();
  const { approverType, workflowApplies, selections } = useApprovalStore();

  const handleSubmit = () => {
    const name = form.getFieldValue('workFlownName');
    const description = form.getFieldValue('description');
    const workflowAppliesId = form.getFieldValue('workflowAppliesId');

    const jsonPayload = {
      name: name,
      description: description,
      entityType: workflowApplies,
      entityId: workflowAppliesId,
      approvalType: APPROVALTYPES.LEAVE,
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
          router.push('/timesheet/settings/approvals');
        },
      },
    );
  };

  return (
    <div>
      <ApprovalWorkFlowSettingComponent
        handleSubmit={handleSubmit}
        isSuccess={isSuccess}
        form={form}
      />
    </div>
  );
};

export default ApprovalSetting;
