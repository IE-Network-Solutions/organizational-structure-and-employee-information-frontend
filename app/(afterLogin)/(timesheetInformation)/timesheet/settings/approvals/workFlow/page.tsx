'use client';
import { ApprovalWorkFlowComponent } from '@/components/Approval/approvalWorkFlow';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { useRouter } from 'next/navigation';

const WorkFlow: React.FC<any> = () => {
  const { setApproverType, approverType } = useApprovalStore();
  const router = useRouter();

  const onChange = (value: string) => {
    setApproverType(value);
    if (approverType) {
      router.push('/timesheet/settings/approvals/workFlow/approvalSetting');
    }
  };

  return (
    <div
      id="time-attendance-settings-approvals-workflow-container"
      data-cy="time-attendance-settings-approvals-workflow-container"
    >
      <ApprovalWorkFlowComponent
        onChange={onChange}
        data-cy="time-attendance-settings-approvals-workflow-component"
      />
    </div>
  );
};
export default WorkFlow;
