import { approvalType, type PayrollGenerationType } from './generationTypes';

export function getNextApproverUserId(approver: any): string | undefined {
  return approver?.userId || approver?.approverId || approver?.approverUserId;
}

export function isCurrentApproverForItem(
  item: any,
  currentUserId: string,
): boolean {
  if (!item || !currentUserId) return false;
  const approvers = Array.isArray(item?.nextApprover) ? item.nextApprover : [];
  return approvers.some(
    (approver: {
      userId?: string;
      approverId?: string;
      approverUserId?: string;
    }) => getNextApproverUserId(approver) === currentUserId,
  );
}

/** Pending approval items of a period, one per generation type. */
export function getPendingApprovalsForPeriod(
  pendingApprovals: { items?: any[] } | undefined,
  payPeriodId: string,
): any[] {
  const items = pendingApprovals?.items ?? [];
  const matches = items.filter((item) => item?.payPeriodId === payPeriodId);
  if (matches.length) return matches;
  // Scoped pending responses may return items without repeating payPeriodId.
  return items.filter((item) => !item?.payPeriodId);
}

export function getPendingApprovalForPeriod(
  pendingApprovals: { items?: any[] } | undefined,
  payPeriodId: string,
  generationType: PayrollGenerationType = 'PAYROLL',
) {
  return getPendingApprovalsForPeriod(pendingApprovals, payPeriodId).find(
    (item) => approvalType(item) === generationType,
  );
}

export function resolvePendingApprovalForUser(
  pendingApprovals: { items?: any[] } | undefined,
  payPeriodId: string,
  currentUserId: string,
  generationType: PayrollGenerationType = 'PAYROLL',
) {
  const pendingForPeriod = getPendingApprovalForPeriod(
    pendingApprovals,
    payPeriodId,
    generationType,
  );
  if (
    !pendingForPeriod ||
    !isCurrentApproverForItem(pendingForPeriod, currentUserId)
  ) {
    return null;
  }
  return pendingForPeriod;
}

/**
 * Approvals the current user can act on right now: one per generation type
 * that is not yet approved and is waiting for this user.
 */
export function getApprovableItems({
  payPeriodId,
  currentUserId,
  payrollExists,
  pendingApprovals,
  isPendingLoading = false,
}: {
  payPeriodId?: string;
  currentUserId?: string;
  payrollExists: boolean;
  pendingApprovals?: { items?: any[] };
  isPendingLoading?: boolean;
}): any[] {
  if (isPendingLoading || !payPeriodId || !currentUserId) return [];
  if (!payrollExists) return [];

  return getPendingApprovalsForPeriod(pendingApprovals, payPeriodId).filter(
    (item) => {
      if (item?.approved === true) return false;
      if (!isCurrentApproverForItem(item, currentUserId)) return false;
      const stepOrder = Number(item.nextApprover?.[0]?.stepOrder || 0);
      return Boolean(item.approvalWorkflowId && stepOrder > 0);
    },
  );
}

export function canShowPayrollApproveButton(
  args: Parameters<typeof getApprovableItems>[0],
): boolean {
  return getApprovableItems(args).length > 0;
}
