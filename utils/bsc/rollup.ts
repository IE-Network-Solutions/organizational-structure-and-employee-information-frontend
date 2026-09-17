import {
  EmployeeScorecard,
  KpiApprovalStatus,
  ScorecardKpiTarget,
  ScorecardStatus,
} from '@/types/bsc';
import { computeCompositeScore, normalizeRatio } from '@/utils/bsc/scoring';

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

/** Achievement % for a single target; null when not yet reported. */
export function targetScorePercent(target: ScorecardKpiTarget): number | null {
  if (target.actualValue == null) return null;
  const { ratio } = normalizeRatio(
    target.actualValue,
    target.targetValue,
    target.targetLogic,
    { worstCase: target.worstCase, bestCase: target.bestCase },
  );
  return Math.min(Math.max(ratio, 0), 1) * 100;
}

export type KpiContributor = {
  scorecard: EmployeeScorecard;
  target: ScorecardKpiTarget;
  score: number | null;
  evaluated: boolean;
};

function averageFromScores(scores: number[]): number {
  if (!scores.length) return 0;
  return scores.reduce((sum, value) => sum + value, 0) / scores.length;
}

function rollupFromScores(
  scores: Array<number | null>,
  label: string,
  scope: 'company' | 'department',
  departmentName?: string,
): RollupSummary {
  const evaluated = scores.filter((s): s is number => s != null);
  return {
    scope,
    label,
    departmentName,
    averageScore: averageFromScores(evaluated),
    evaluatedCount: evaluated.length,
    totalCount: scores.length,
    pendingCount: scores.length - evaluated.length,
  };
}

export function kpiContributors(
  cards: EmployeeScorecard[],
  kpiLibraryId: string,
): KpiContributor[] {
  const rows: KpiContributor[] = [];
  for (const scorecard of cards) {
    for (const target of scorecard.targets) {
      if (target.kpiLibraryId !== kpiLibraryId) continue;
      const score = targetScorePercent(target);
      rows.push({
        scorecard,
        target,
        score,
        evaluated: score != null,
      });
    }
  }
  return rows.sort((a, b) => {
    if (a.evaluated !== b.evaluated) return a.evaluated ? -1 : 1;
    return (b.score || 0) - (a.score || 0);
  });
}

export function computeKpiRollup(
  cards: EmployeeScorecard[],
  kpiLibraryId: string,
  options?: { scope: 'company' | 'department'; departmentName?: string },
): RollupSummary {
  const scope = options?.scope || 'company';
  const departmentName = options?.departmentName;
  const pool =
    scope === 'department' && departmentName
      ? cards.filter((c) => c.departmentName === departmentName)
      : cards;
  const contributors = kpiContributors(pool, kpiLibraryId);
  return rollupFromScores(
    contributors.map((c) => c.score),
    scope === 'department' && departmentName ? departmentName : 'Company-wide',
    scope,
    departmentName,
  );
}

export function departmentRollupsForKpi(
  cards: EmployeeScorecard[],
  kpiLibraryId: string,
): RollupSummary[] {
  const names = Array.from(
    new Set(
      kpiContributors(cards, kpiLibraryId)
        .map((c) => c.scorecard.departmentName)
        .filter((name): name is string => Boolean(name)),
    ),
  ).sort();
  return names.map((name) =>
    computeKpiRollup(cards, kpiLibraryId, {
      scope: 'department',
      departmentName: name,
    }),
  );
}

export type PerspectiveKpiProgress = {
  kpiLibraryId: string;
  kpiName: string;
  measurementUnit: string;
  averageScore: number;
  evaluatedCount: number;
  totalCount: number;
  pendingCount: number;
};

/** Perspective-level score for one person (avg of reported KPIs in that perspective). */
export function perspectiveScoreOnScorecard(
  scorecard: EmployeeScorecard,
  perspectiveName: string,
): number | null {
  const scores = scorecard.targets
    .filter((t) => t.perspective === perspectiveName)
    .map(targetScorePercent)
    .filter((s): s is number => s != null);
  if (!scores.length) return null;
  return averageFromScores(scores);
}

export function computePerspectiveRollup(
  cards: EmployeeScorecard[],
  perspectiveName: string,
  options?: { scope: 'company' | 'department'; departmentName?: string },
): RollupSummary {
  const scope = options?.scope || 'company';
  const departmentName = options?.departmentName;
  const pool =
    scope === 'department' && departmentName
      ? cards.filter((c) => c.departmentName === departmentName)
      : cards;
  const withPerspective = pool.filter((c) =>
    c.targets.some((t) => t.perspective === perspectiveName),
  );
  const scores = withPerspective.map((c) =>
    perspectiveScoreOnScorecard(c, perspectiveName),
  );
  return rollupFromScores(
    scores,
    scope === 'department' && departmentName ? departmentName : 'Company-wide',
    scope,
    departmentName,
  );
}

export function departmentRollupsForPerspective(
  cards: EmployeeScorecard[],
  perspectiveName: string,
): RollupSummary[] {
  const names = Array.from(
    new Set(
      cards
        .filter((c) => c.targets.some((t) => t.perspective === perspectiveName))
        .map((c) => c.departmentName)
        .filter((name): name is string => Boolean(name)),
    ),
  ).sort();
  return names.map((name) =>
    computePerspectiveRollup(cards, perspectiveName, {
      scope: 'department',
      departmentName: name,
    }),
  );
}

export function perspectiveKpiProgressList(
  cards: EmployeeScorecard[],
  kpiLibraryIds: Array<{
    id: string;
    name: string;
    measurementUnit: string;
  }>,
): PerspectiveKpiProgress[] {
  return kpiLibraryIds.map((kpi) => {
    const rollup = computeKpiRollup(cards, kpi.id);
    return {
      kpiLibraryId: kpi.id,
      kpiName: kpi.name,
      measurementUnit: kpi.measurementUnit,
      averageScore: rollup.averageScore,
      evaluatedCount: rollup.evaluatedCount,
      totalCount: rollup.totalCount,
      pendingCount: rollup.pendingCount,
    };
  });
}
