'use client';

import { PepAuditRow } from '@/types/bsc';
import {
  PepAuditApprovalStatusBar,
  PepAuditApprovalStatusBarAggregate,
  PepAuditApprovalStatusBarForRow,
  type PepAuditBarParticipants,
} from '@/app/(afterLogin)/(bsc)/bsc/_components/PepAuditApprovalStatusBar';
import {
  resolveAggregatePepWorkflowSteps,
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
  dataCy?: string;
  className?: string;
};

export function PepAuditWorkflowStepsAggregate({
  rows,
  participants,
  dataCy,
  className,
}: AggregateProps) {
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
