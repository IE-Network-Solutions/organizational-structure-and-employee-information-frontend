import { useMemo } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  useGetPendingPayrollApprovals,
  useGetPayrollApprovalByPayPeriodId,
} from './queries';
import {
  canShowPayrollApproveButton,
  resolvePendingApprovalForUser,
} from './payrollApprovalVisibility';

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
    data: payrollApprovalForPeriod,
    refetch: refetchPayrollApprovalForPeriod,
  } = useGetPayrollApprovalByPayPeriodId(payPeriodId);

  const pendingApproval = useMemo(() => {
    if (!payPeriodId || !userId) return null;
    return resolvePendingApprovalForUser(
      pendingApprovals,
      payPeriodId,
      userId,
    );
  }, [pendingApprovals, payPeriodId, userId]);

  const showApproveButton = canShowPayrollApproveButton({
    payPeriodId,
    currentUserId: userId,
    payrollExists,
    payrollApprovalForPeriod,
    pendingApprovals,
    isPendingLoading,
  });

  return {
    showApproveButton,
    pendingApproval,
    payrollApprovalForPeriod,
    isPendingLoading,
    refetchPendingApprovals,
    refetchPayrollApprovalForPeriod,
  };
}
