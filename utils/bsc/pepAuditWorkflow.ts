import {
  KpiApprovalStatus,
  PepAuditFlag,
  PepAuditRow,
  ScorecardStatus,
} from '@/types/bsc';

export type PepWorkflowStepState = 'done' | 'active' | 'pending' | 'rejected';

/** Scorecard statuses that allow PEP approve/reject actions in the prototype. */
export const PEP_AUDIT_ACTIONABLE_STATUSES: ScorecardStatus[] = [
  ScorecardStatus.PendingEval,
  ScorecardStatus.NeedsResubmit,
  ScorecardStatus.Scored,
  ScorecardStatus.Completed,
];

export function isPepAuditActionableScorecard(
  status: ScorecardStatus,
): boolean {
  return PEP_AUDIT_ACTIONABLE_STATUSES.includes(status);
}

export function rowNeedsPepAction(row: PepAuditRow): boolean {
  if (row.actualValue == null) return false;
  if (row.approvalStatus !== KpiApprovalStatus.Approved) return false;
  return (
    row.pepAuditFlag === PepAuditFlag.Unrealistic ||
    row.pepAuditFlag === PepAuditFlag.PendingReview
  );
}

export function rowsNeedPepAction(rows: PepAuditRow[]): boolean {
  return rows.some(rowNeedsPepAction);
}

export function resolvePepWorkflowSteps(
  row: PepAuditRow,
): [PepWorkflowStepState, PepWorkflowStepState, PepWorkflowStepState] {
  const reported: PepWorkflowStepState =
    row.actualValue != null ? 'done' : 'pending';

  let manager: PepWorkflowStepState = 'pending';
  if (row.approvalStatus === KpiApprovalStatus.Approved) {
    manager = 'done';
  } else if (row.approvalStatus === KpiApprovalStatus.Rejected) {
    manager = 'rejected';
  } else if (reported === 'done') {
    manager = 'active';
  }

  let pep: PepWorkflowStepState = 'pending';
  if (row.pepAuditFlag === PepAuditFlag.Realistic) {
    pep = 'done';
  } else if (manager === 'rejected') {
    pep = 'pending';
  } else if (manager === 'done') {
    if (
      row.pepAuditFlag === PepAuditFlag.Unrealistic ||
      row.pepAuditFlag === PepAuditFlag.PendingReview
    ) {
      pep = 'active';
    }
  }

  return [reported, manager, pep];
}

export function resolveAggregatePepWorkflowSteps(
  rows: PepAuditRow[],
): [PepWorkflowStepState, PepWorkflowStepState, PepWorkflowStepState] {
  if (!rows.length) {
    return ['pending', 'pending', 'pending'];
  }

  const reported: PepWorkflowStepState = rows.every(
    (row) => row.actualValue != null,
  )
    ? 'done'
    : 'active';

  const pendingManager = rows.some(
    (row) => row.approvalStatus === KpiApprovalStatus.Pending,
  );
  const allManagerApproved = rows.every(
    (row) => row.approvalStatus === KpiApprovalStatus.Approved,
  );
  const hasReturned = rows.some(
    (row) => row.approvalStatus === KpiApprovalStatus.Rejected,
  );

  let manager: PepWorkflowStepState = 'pending';
  if (hasReturned && !pendingManager && !allManagerApproved) {
    manager = 'rejected';
  } else if (pendingManager) {
    manager = 'active';
  } else if (allManagerApproved) {
    manager = 'done';
  } else if (hasReturned) {
    manager = 'rejected';
  }

  const allPepApproved = rows.every(
    (row) => row.pepAuditFlag === PepAuditFlag.Realistic,
  );
  const needsPep = rows.some(
    (row) =>
      row.pepAuditFlag === PepAuditFlag.Unrealistic ||
      row.pepAuditFlag === PepAuditFlag.PendingReview,
  );

  let pep: PepWorkflowStepState = 'pending';
  if (allPepApproved && !hasReturned) {
    pep = 'done';
  } else if (needsPep && manager === 'done') {
    pep = 'active';
  } else if (hasReturned && !needsPep) {
    pep = 'pending';
  }

  return [reported, manager, pep];
}
