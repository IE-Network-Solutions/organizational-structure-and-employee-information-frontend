import {
  getMockPayrollApprovalWorkflow,
  isMockPayPeriodId,
  MockPayrollApprovalStep,
  MockPayrollApprovalWorkflow,
} from './payPeriodSelect/mockPayPeriods';

export const overallStatusIcon = (
  status: MockPayrollApprovalWorkflow['overall'],
) => {
  if (status === 'Approved') return '/icons/status/verify.svg';
  if (status === 'Pending') return '/icons/status/information.svg';
  if (status === 'Rejected') return '/icons/status/reject.svg';
  return '';
};

export const asApprovalList = (data: unknown): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (
    typeof data === 'object' &&
    Array.isArray((data as { items?: any[] }).items)
  ) {
    return (data as { items: any[] }).items;
  }
  if (
    typeof data === 'object' &&
    (data as { payPeriodId?: string }).payPeriodId
  ) {
    return [data];
  }
  return [];
};

export const stepsFromApprovalRecord = (
  item: any,
): MockPayrollApprovalStep[] => {
  const logs =
    item?.approvalLogs ||
    item?.approvers ||
    item?.steps ||
    item?.approvalStatus ||
    [];
  if (Array.isArray(logs) && logs.length > 0) {
    return logs.map((log: any, index: number) => ({
      stepOrder: Number(log.stepOrder || index + 1),
      status: (log.status ||
        log.action ||
        'Pending') as MockPayrollApprovalStep['status'],
      userId: String(log.userId || log.approverId || ''),
      displayUserId: String(
        log.displayUserId || log.approvedUserId || log.userId || '',
      ),
      approvedUserId: log.approvedUserId,
    }));
  }

  const next = item?.nextApprover?.[0];
  if (item?.approved === true) {
    return [
      {
        stepOrder: 1,
        status: 'Approved',
        userId: String(item.approvedUserId || next?.userId || ''),
        displayUserId: String(item.approvedUserId || next?.userId || ''),
        approvedUserId: item.approvedUserId,
      },
    ];
  }
  if (next || item?.approved === false) {
    return [
      {
        stepOrder: Number(next?.stepOrder || 1),
        status: 'Pending',
        userId: String(next?.userId || ''),
        displayUserId: String(next?.userId || ''),
      },
    ];
  }
  return [];
};

export const workflowFromApprovalRecord = (
  item: any,
): MockPayrollApprovalWorkflow => {
  const steps = stepsFromApprovalRecord(item);
  if (item?.approved === true) {
    return { overall: 'Approved', steps };
  }
  if (steps.some((step) => step.status === 'Rejected')) {
    return { overall: 'Rejected', steps };
  }
  if (steps.length > 0 || item?.approved === false) {
    return { overall: 'Pending', steps };
  }
  return { overall: 'Not generated', steps: [] };
};

export const resolvePayrollApprovalWorkflow = (
  payPeriodId: string,
  payrollApproval?: unknown,
  pendingApprovals?: unknown,
): MockPayrollApprovalWorkflow => {
  if (isMockPayPeriodId(payPeriodId)) {
    return getMockPayrollApprovalWorkflow(payPeriodId);
  }
  const fromApproval = asApprovalList(payrollApproval)[0];
  if (fromApproval) {
    return workflowFromApprovalRecord(fromApproval);
  }
  const fromPending = asApprovalList(pendingApprovals)[0];
  if (fromPending) {
    return workflowFromApprovalRecord(fromPending);
  }
  return { overall: 'Not generated', steps: [] };
};
