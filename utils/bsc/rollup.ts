import {
  EmployeeScorecard,
  KpiApprovalStatus,
  ScorecardStatus,
} from '@/types/bsc';
import { computeCompositeScore } from '@/utils/bsc/scoring';

export function isScorecardEvaluated(scorecard: EmployeeScorecard): boolean {
  return (
    scorecard.status === ScorecardStatus.Scored ||
    scorecard.status === ScorecardStatus.Completed ||
    scorecard.finalEvaluation?.compositeScore != null
  );
}

export function scorecardTotal(scorecard: EmployeeScorecard): number {
  if (!isScorecardEvaluated(scorecard)) return 0;
  if (scorecard.finalEvaluation?.compositeScore != null) {
    return Math.min(Number(scorecard.finalEvaluation.compositeScore), 100);
  }
  const result = computeCompositeScore(scorecard.targets);
  let total = 0;
  for (const t of scorecard.targets) {
    const item = result.items.find((b) => b.targetId === t.id);
    const ratio = item ? Math.min(item.ratio, 1) : 0;
    total += ratio * t.weightPercentage;
  }
  return Math.min(total, 100);
}

export function formatScore(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return Math.abs(value % 1) < 1e-9
    ? String(Math.round(value))
    : value.toFixed(1);
}

export function isScorecardApproved(scorecard: EmployeeScorecard): boolean {
  if (
    scorecard.status === ScorecardStatus.Scored ||
    scorecard.status === ScorecardStatus.Completed
  ) {
    return true;
  }
  return (
    scorecard.targets.length > 0 &&
    scorecard.targets.every(
      (t) => t.approvalStatus === KpiApprovalStatus.Approved,
    )
  );
}

export function latestScorecardsByEmployee(
  scorecards: EmployeeScorecard[] | undefined,
): EmployeeScorecard[] {
  const map = new Map<string, EmployeeScorecard>();
  for (const card of scorecards || []) {
    const existing = map.get(card.userId);
    if (!existing || (card.updatedAt || '') > (existing.updatedAt || '')) {
      map.set(card.userId, card);
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.userName.localeCompare(b.userName),
  );
}

export type RollupSummary = {
  scope: 'company' | 'department';
  label: string;
  departmentName?: string;
  averageScore: number;
  evaluatedCount: number;
  totalCount: number;
  pendingCount: number;
};

export function computeRollup(
  cards: EmployeeScorecard[],
  options?: { scope: 'company' | 'department'; departmentName?: string },
): RollupSummary {
  const scope = options?.scope || 'company';
  const departmentName = options?.departmentName;
  const pool =
    scope === 'department' && departmentName
      ? cards.filter((c) => c.departmentName === departmentName)
      : cards;
  const evaluated = pool.filter(isScorecardEvaluated);
  const sum = evaluated.reduce((s, c) => s + scorecardTotal(c), 0);
  const averageScore = evaluated.length ? sum / evaluated.length : 0;
  return {
    scope,
    label:
      scope === 'department' && departmentName
        ? departmentName
        : 'Company-wide',
    departmentName,
    averageScore,
    evaluatedCount: evaluated.length,
    totalCount: pool.length,
    pendingCount: pool.length - evaluated.length,
  };
}

export function departmentRollups(cards: EmployeeScorecard[]): RollupSummary[] {
  const names = Array.from(
    new Set(
      cards
        .map((c) => c.departmentName)
        .filter((name): name is string => Boolean(name)),
    ),
  ).sort();
  return names.map((name) =>
    computeRollup(cards, { scope: 'department', departmentName: name }),
  );
}
