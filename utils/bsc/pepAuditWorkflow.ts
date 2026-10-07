import {
  BscEvaluatorStep,
  KpiApprovalStatus,
  PepAuditFlag,
  PepAuditRow,
  ScorecardKpiTarget,
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
  // PEP is done only after the evaluator chain finished AND PEP approved.
  if (manager === 'done' && row.pepAuditFlag === PepAuditFlag.Realistic) {
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
  // "PEP approved" needs every KPI through the whole evaluator chain first —
  // a first approver's sign-off (KPI still Pending) never completes PEP.
  if (allManagerApproved && allPepApproved && !hasReturned) {
    pep = 'done';
  } else if (manager === 'done' && (needsPep || !allPepApproved)) {
    pep = 'active';
  }

  return [reported, manager, pep];
}

/** One level of the approval chain shown on Results / PEP audit. */
export type ApprovalChainLevel = {
  kind: 'self' | 'directManager' | 'user' | 'pep';
  userId?: string | null;
  state: PepWorkflowStepState;
};

type ChainTarget = Pick<
  ScorecardKpiTarget,
  | 'id'
  | 'evaluationFlow'
  | 'evaluationStepIndex'
  | 'approvalStatus'
  | 'actualValue'
>;

const DEFAULT_CHAIN: BscEvaluatorStep[] = [
  { kind: 'self' },
  { kind: 'directManager' },
];

function targetFlow(target: ChainTarget): BscEvaluatorStep[] {
  return target.evaluationFlow?.length ? target.evaluationFlow : DEFAULT_CHAIN;
}

/** Per-step state for one KPI, following its own evaluation flow. */
function targetChainStates(target: ChainTarget): PepWorkflowStepState[] {
  const flow = targetFlow(target);
  if (target.approvalStatus === KpiApprovalStatus.Approved) {
    return flow.map(() => 'done');
  }
  if (target.approvalStatus === KpiApprovalStatus.Rejected) {
    // Returned to the employee: the first reviewer after Self declined it.
    const reviewer = flow.findIndex((step) => step.kind !== 'self');
    return flow.map((step, index) => {
      if (step.kind === 'self') return 'active';
      return index === reviewer ? 'rejected' : 'pending';
    });
  }
  const current = Math.min(
    Math.max(Number(target.evaluationStepIndex ?? 0), 0),
    Math.max(flow.length - 1, 0),
  );
  return flow.map((step, index) =>
    index < current ? 'done' : index === current ? 'active' : 'pending',
  );
}

/**
 * Approval chain for a scorecard: the KPIs' configured evaluation flow
 * (Self → Manager → named evaluators…) followed by PEP. Uses the flow set in
 * scorecard setup's Evaluation step so Results shows the same evaluators.
 *
 * KPIs normally share one flow; if they differ, the longest flow is shown and
 * each level aggregates the KPIs that have a step at that position.
 */
export function resolveApprovalChain(
  targets: ChainTarget[],
  pepRows: PepAuditRow[],
): ApprovalChainLevel[] {
  if (!targets.length) return [];

  const reference = targets
    .map(targetFlow)
    .reduce((longest, flow) => (flow.length > longest.length ? flow : longest));
  const perTarget = targets.map((target) => targetChainStates(target));

  const levels: ApprovalChainLevel[] = reference.map((step, index) => {
    const states = perTarget
      .map((list) => list[index])
      .filter((state): state is PepWorkflowStepState => Boolean(state));
    const state: PepWorkflowStepState = states.includes('rejected')
      ? 'rejected'
      : states.includes('active')
        ? 'active'
        : states.length && states.every((s) => s === 'done')
          ? 'done'
          : 'pending';
    return {
      kind: step.kind,
      userId: step.kind === 'user' ? (step.userId ?? null) : null,
      state,
    };
  });

  const pepState = pepRows.length
    ? resolveAggregatePepWorkflowSteps(pepRows)[2]
    : 'pending';
  levels.push({ kind: 'pep', state: pepState });
  return levels;
}
