'use client';

import { PepAuditRow, ScorecardKpiTarget } from '@/types/bsc';
import {
  ApprovalChainStatusBar,
  PepAuditApprovalStatusBar,
  PepAuditApprovalStatusBarAggregate,
  PepAuditApprovalStatusBarForRow,
  type PepAuditBarParticipants,
  type PepAuditStepParticipant,
} from '@/app/(afterLogin)/(bsc)/bsc/_components/PepAuditApprovalStatusBar';
import {
  resolveAggregatePepWorkflowSteps,
  resolveApprovalChain,
  resolvePepWorkflowSteps,
  type PepWorkflowStepState,
} from '@/utils/bsc/pepAuditWorkflow';

export type { PepWorkflowStepState, PepAuditBarParticipants };

export { resolveAggregatePepWorkflowSteps, resolvePepWorkflowSteps };

type Props = {
  row: PepAuditRow;
  participants?: Partial<PepAuditBarParticipants>;
};

export default function PepAuditWorkflowSteps({ row, participants }: Props) {
  return (
    <PepAuditApprovalStatusBarForRow row={row} participants={participants} />
  );
}

type AggregateProps = {
  rows: PepAuditRow[];
  participants: PepAuditBarParticipants;
  /**
   * Scorecard KPIs. When given, the bar follows their configured evaluation
   * flow (same evaluators as scorecard setup) instead of Employee → Manager.
   */
  targets?: ScorecardKpiTarget[];
  /** Names for named-evaluator ("user") steps. */
  resolveUser?: (userId: string) => PepAuditStepParticipant | undefined;
  dataCy?: string;
  className?: string;
};

export function PepAuditWorkflowStepsAggregate({
  rows,
  participants,
  targets,
  resolveUser,
  dataCy,
  className,
}: AggregateProps) {
  if (targets?.length && rows.length) {
    // Only the KPIs that are in this audit (reported), like the PEP rows.
    const reportedIds = new Set(rows.map((row) => row.targetId));
    const chainTargets = targets.filter((target) => reportedIds.has(target.id));
    return (
      <ApprovalChainStatusBar
        chain={resolveApprovalChain(
          chainTargets.length ? chainTargets : targets,
          rows,
        )}
        participants={participants}
        resolveUser={resolveUser || (() => undefined)}
        dataCy={dataCy}
        className={className}
      />
    );
  }
  return (
    <PepAuditApprovalStatusBarAggregate
      rows={rows}
      participants={participants}
      dataCy={dataCy}
      className={className}
    />
  );
}

/** @deprecated Use PepAuditApprovalStatusBar */
export function PepAuditWorkflowStepsVisual({
  steps,
  participants,
  dataCy,
}: {
  steps: [PepWorkflowStepState, PepWorkflowStepState, PepWorkflowStepState];
  participants: PepAuditBarParticipants;
  dataCy?: string;
}) {
  return (
    <PepAuditApprovalStatusBar
      steps={steps}
      participants={participants}
      dataCy={dataCy}
    />
  );
}
