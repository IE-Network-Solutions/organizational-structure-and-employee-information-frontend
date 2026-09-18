import { ScorecardStatus } from '@/types/bsc';

/**
 * Prompt lifecycle → persisted mock status.
 * SYSTEM_SCORING is a synchronous step inside finalizeApprovals, never stored.
 */
export const PROMPT_TO_MOCK_STATUS = {
  DRAFT: ScorecardStatus.Draft,
  PENDING_ACK: ScorecardStatus.PendingAck,
  ACTIVE_CYCLE: ScorecardStatus.Active,
  PENDING_EVAL: ScorecardStatus.PendingEval,
  NEEDS_RESUBMIT: ScorecardStatus.NeedsResubmit,
  MANAGER_REVIEW: ScorecardStatus.Scored,
  COMPLETED: ScorecardStatus.Completed,
} as const;

const TRANSITIONS: Record<ScorecardStatus, ScorecardStatus[]> = {
  [ScorecardStatus.Draft]: [ScorecardStatus.PendingAck],
  [ScorecardStatus.PendingAck]: [ScorecardStatus.Active],
  [ScorecardStatus.Active]: [ScorecardStatus.PendingEval],
  [ScorecardStatus.PendingEval]: [
    ScorecardStatus.NeedsResubmit,
    ScorecardStatus.Scored,
  ],
  [ScorecardStatus.NeedsResubmit]: [ScorecardStatus.PendingEval],
  [ScorecardStatus.Scored]: [ScorecardStatus.Completed],
  [ScorecardStatus.Completed]: [],
};

export function canTransition(
  from: ScorecardStatus,
  to: ScorecardStatus,
): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(
  from: ScorecardStatus,
  to: ScorecardStatus,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid scorecard transition: ${from} → ${to}`);
  }
}

export const SCORECARD_STATUS_LABEL: Record<ScorecardStatus, string> = {
  [ScorecardStatus.Draft]: 'Draft',
  [ScorecardStatus.PendingAck]: 'Pending Acknowledgment',
  [ScorecardStatus.Active]: 'Active',
  [ScorecardStatus.PendingEval]: 'Pending Evaluation',
  [ScorecardStatus.NeedsResubmit]: 'Needs Resubmit',
  [ScorecardStatus.Scored]: 'Scored',
  [ScorecardStatus.Completed]: 'Completed',
};

export const SCORECARD_STATUS_COLOR: Record<ScorecardStatus, string> = {
  [ScorecardStatus.Draft]: 'default',
  [ScorecardStatus.PendingAck]: 'orange',
  [ScorecardStatus.Active]: 'blue',
  [ScorecardStatus.PendingEval]: 'purple',
  [ScorecardStatus.NeedsResubmit]: 'red',
  [ScorecardStatus.Scored]: 'cyan',
  [ScorecardStatus.Completed]: 'green',
};
