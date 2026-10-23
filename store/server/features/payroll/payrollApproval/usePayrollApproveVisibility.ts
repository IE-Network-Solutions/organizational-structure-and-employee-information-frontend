import { useMemo } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  useGetPendingPayrollApprovals,
  useGetPayrollApprovalsOfPayPeriod,
} from './queries';
import { getApprovableItems } from './payrollApprovalVisibility';
import { PeriodApproval } from './generationTypes';

export function usePayrollApproveVisibility(
  payPeriodId: string | undefined,
  payrollExists: boolean,
) {
  const { userId } = useAuthenticationStore();
  const {
    data: pendingApprovals,
    isLoading: isPendingLoading,
    refetch: refetchPendingApprovals,
  } = useGetPendingPayrollApprovals(payPeriodId, 1, 10);
  const {
    data: periodApprovalsData,
    refetch: refetchPayrollApprovalForPeriod,
  } = useGetPayrollApprovalsOfPayPeriod(payPeriodId);

  const periodApprovals: PeriodApproval[] = Array.isArray(periodApprovalsData)
    ? periodApprovalsData
    : [];

  const approvableItems = useMemo(
    () =>
      getApprovableItems({
        payPeriodId,
        currentUserId: userId,
        payrollExists,
        pendingApprovals,
        isPendingLoading,
      }),
    [payPeriodId, userId, payrollExists, pendingApprovals, isPendingLoading],
  );

  return {
    showApproveButton: approvableItems.length > 0,
    /** One entry per generation type waiting for the current user. */
    approvableItems,
    /** One entry per generation type of the pay period. */
    periodApprovals,
    isPendingLoading,
    refetchPendingApprovals,
    refetchPayrollApprovalForPeriod,
  };
}
