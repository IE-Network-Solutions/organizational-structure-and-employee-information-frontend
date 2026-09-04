import {
  BscEvaluatorStep,
  EmployeeScorecard,
  EvaluationCycle,
  KpiApprovalStatus,
  ScorecardKpiTarget,
  ScorecardStatus,
} from '@/types/bsc';
import { periodLabel, scorecardContextLabel } from '@/utils/bsc/series';
import { targetScorePercent } from '@/utils/bsc/rollup';

export type CheckinRole = 'self' | 'evaluator';

export type CheckinItem = {
  key: string;
  scorecard: EmployeeScorecard;
  target: ScorecardKpiTarget;
  role: CheckinRole;
  stepIndex: number;
  step: BscEvaluatorStep;
  flow: BscEvaluatorStep[];
  periodLabel: string;
  contextLabel: string;
  score: number | null;
};

export function resolveEvaluationFlow(
  target: ScorecardKpiTarget,
): BscEvaluatorStep[] {
  if (target.evaluationFlow?.length) {
    return target.evaluationFlow.map((s) => ({ ...s }));
  }
  return [{ kind: 'self' }, { kind: 'directManager' }];
}

export function currentStepIndex(target: ScorecardKpiTarget): number {
  const flow = resolveEvaluationFlow(target);
  const raw = target.evaluationStepIndex ?? 0;
  return Math.min(Math.max(raw, 0), Math.max(flow.length - 1, 0));
}

export function currentEvaluationStep(
  target: ScorecardKpiTarget,
): BscEvaluatorStep {
  const flow = resolveEvaluationFlow(target);
  return flow[currentStepIndex(target)] || flow[0];
}

/** Who must act for this step on this scorecard. */
export function stepActorUserId(
  scorecard: EmployeeScorecard,
  step: BscEvaluatorStep,
): string | null {
  if (step.kind === 'self') return scorecard.userId;
  if (step.kind === 'directManager') return scorecard.managerId || null;
  if (step.kind === 'user') return step.userId || null;
  return null;
}

export function isActorForStep(
  scorecard: EmployeeScorecard,
  step: BscEvaluatorStep,
  actorId: string,
): boolean {
  if (!actorId) return false;
  const expected = stepActorUserId(scorecard, step);
  return !!expected && expected === actorId;
}

export function isLastEvaluationStep(target: ScorecardKpiTarget): boolean {
  const flow = resolveEvaluationFlow(target);
  return currentStepIndex(target) >= flow.length - 1;
}

function isCheckinOpenStatus(status: ScorecardStatus): boolean {
  return (
    status === ScorecardStatus.Active ||
    status === ScorecardStatus.NeedsResubmit ||
    status === ScorecardStatus.PendingEval
  );
}

/**
 * Build the Check-in inbox for the signed-in actor:
 * - self: KPIs where current step is self and scorecard allows reporting
 * - evaluator: KPIs where current step is manager/named user and prior result exists
 */
export function buildCheckinQueue(
  scorecards: EmployeeScorecard[] | undefined,
  actorId: string,
  cycleById?: Map<string, EvaluationCycle>,
): CheckinItem[] {
  if (!actorId) return [];
  const items: CheckinItem[] = [];

  for (const scorecard of scorecards || []) {
    if (!isCheckinOpenStatus(scorecard.status)) continue;
    const cycle = cycleById?.get(scorecard.cycleId);
    const context = scorecardContextLabel(scorecard, cycle);
    const period = periodLabel(scorecard);

    for (const target of scorecard.targets) {
      const flow = resolveEvaluationFlow(target);
      const stepIndex = currentStepIndex(target);
      const step = flow[stepIndex];
      if (!step || !isActorForStep(scorecard, step, actorId)) continue;

      const isSelf = step.kind === 'self';
      if (isSelf) {
        if (
          scorecard.status !== ScorecardStatus.Active &&
          scorecard.status !== ScorecardStatus.NeedsResubmit
        ) {
          continue;
        }
        if (
          scorecard.status === ScorecardStatus.NeedsResubmit &&
          target.approvalStatus !== KpiApprovalStatus.Rejected &&
          target.approvalStatus !== KpiApprovalStatus.Pending
        ) {
          continue;
        }
        // Skip if already moved past self with a submitted actual (unless rejected)
        if (
          (target.evaluationStepIndex ?? 0) > 0 &&
          target.approvalStatus !== KpiApprovalStatus.Rejected
        ) {
          continue;
        }
      } else {
        if (scorecard.status !== ScorecardStatus.PendingEval) continue;
        if (target.approvalStatus !== KpiApprovalStatus.Pending) continue;
        if (target.actualValue == null) continue;
      }

      items.push({
        key: `${scorecard.id}:${target.id}`,
        scorecard,
        target,
        role: isSelf ? 'self' : 'evaluator',
        stepIndex,
        step,
        flow,
        periodLabel: period,
        contextLabel: context,
        score: targetScorePercent(target),
      });
    }
  }

  return items.sort((a, b) => {
    const byOwner = a.scorecard.userName.localeCompare(b.scorecard.userName);
    if (byOwner) return byOwner;
    return a.target.kpiName.localeCompare(b.target.kpiName);
  });
}
