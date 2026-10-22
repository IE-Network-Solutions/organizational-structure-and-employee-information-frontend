import { notification } from 'antd';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useApprovePayrollApproval, useLastApprovingPayroll } from './mutation';
import { approvalType } from './generationTypes';

/**
 * Approves one pending item (one generation type of a pay period). When the
 * approval service reports the last level, the payroll backend marks that
 * generation type approved.
 */
export function usePayrollApproveAction(payPeriodId: string | undefined) {
  const { userId } = useAuthenticationStore();
  const { mutate: approvePayroll, isLoading: isApproving } =
    useApprovePayrollApproval();
  const { mutate: lastApproving, isLoading: isLastApproving } =
    useLastApprovingPayroll();

  const approve = (pendingItem: any, onDone?: () => void) => {
    if (!pendingItem) return;

    const approvalWorkflowId = String(pendingItem.approvalWorkflowId || '');
    const stepOrder = Number(pendingItem.nextApprover?.[0]?.stepOrder || 0);

    if (!approvalWorkflowId || stepOrder === 0) {
      notification.error({
        message: 'Invalid Approval Data',
        description: 'Missing required approval information. Please try again.',
      });
      return;
    }

    const { tenantId, userData } = useAuthenticationStore.getState();

    approvePayroll(
      {
        approvalWorkflowId,
        stepOrder,
        requestId: pendingItem.id,
        approvedUserId: userId,
        approverRoleId: userData?.roleId,
        action: 'Approved',
        tenantId,
      },
      {
        onSuccess: (data) => {
          if (data?.last === true) {
            lastApproving(
              { payPeriodId, generationType: approvalType(pendingItem) },
              { onSuccess: onDone },
            );
          } else {
            onDone?.();
          }
        },
      },
    );
  };

  return { approve, isApproving: isApproving || isLastApproving };
}
