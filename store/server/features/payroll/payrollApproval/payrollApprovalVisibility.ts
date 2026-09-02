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
    (approver) => getNextApproverUserId(approver) === currentUserId,
  );
}

export function getPendingApprovalForPeriod(
  pendingApprovals: { items?: any[] } | undefined,
  payPeriodId: string,
) {
  const items = pendingApprovals?.items ?? [];
  const match = items.find((item) => item?.payPeriodId === payPeriodId);
  if (match) return match;
  // Scoped pending responses may return a single item without repeating payPeriodId.
  if (items.length === 1) return items[0];
  return undefined;
}

export function resolvePendingApprovalForUser(
  pendingApprovals: { items?: any[] } | undefined,
  payPeriodId: string,
  currentUserId: string,
) {
  const pendingForPeriod = getPendingApprovalForPeriod(
    pendingApprovals,
    payPeriodId,
  );
  if (
    !pendingForPeriod ||
    !isCurrentApproverForItem(pendingForPeriod, currentUserId)
  ) {
    return null;
  }
  return pendingForPeriod;
}

export function canShowPayrollApproveButton({
  payPeriodId,
  currentUserId,
  payrollExists,
  payrollApprovalForPeriod,
  pendingApprovals,
  isPendingLoading = false,
}: {
  payPeriodId?: string;
  currentUserId?: string;
  payrollExists: boolean;
  payrollApprovalForPeriod?: { approved?: boolean } | null;
  pendingApprovals?: { items?: any[] };
  isPendingLoading?: boolean;
}): boolean {
  if (isPendingLoading || !payPeriodId || !currentUserId) return false;
  if (!payrollExists) return false;
  if (payrollApprovalForPeriod?.approved === true) return false;

  const pendingForPeriod = resolvePendingApprovalForUser(
    pendingApprovals,
    payPeriodId,
    currentUserId,
  );
  if (!pendingForPeriod) return false;

  const stepOrder = Number(pendingForPeriod.nextApprover?.[0]?.stepOrder || 0);
  const approvalWorkflowId = pendingForPeriod.approvalWorkflowId;

  return Boolean(approvalWorkflowId && stepOrder > 0);
}
