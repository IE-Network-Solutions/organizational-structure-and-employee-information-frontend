import { EmployeeScorecard } from '@/types/bsc';
import { latestScorecardsByEmployee } from '@/utils/bsc/rollup';
import {
  isCurrentReportingScorecard,
  type ResultsScope,
} from '@/utils/bsc/scorecardTab';

export function resolveTeamManagerId(
  actorId: string | undefined,
  scorecards: EmployeeScorecard[],
): string {
  const preferred = actorId || 'demo-user';
  const isDirectReport = (card: EmployeeScorecard, managerId: string) =>
    card.managerId === managerId &&
    card.userId !== managerId &&
    card.userId !== 'demo-user';
  const countReports = (managerId: string) =>
    scorecards.filter((card) => isDirectReport(card, managerId)).length;
  if (countReports(preferred) > 0) return preferred;
  if (preferred !== 'demo-user' && countReports('demo-user') > 0) {
    return 'demo-user';
  }
  return preferred;
}

export function filterScorecardsForResultsScope(
  scorecards: EmployeeScorecard[],
  resultsScope: ResultsScope,
  actorId?: string,
): EmployeeScorecard[] {
  if (resultsScope === 'mine') {
    const actor = actorId || 'demo-user';
    return scorecards.filter((card) => card.userId === actor);
  }
  if (resultsScope !== 'team') return scorecards;
  const manager = resolveTeamManagerId(actorId, scorecards);
  const skip = new Set([manager, 'demo-user'].filter(Boolean));
  return scorecards.filter(
    (card) => card.managerId === manager && !skip.has(card.userId),
  );
}

export function currentPeriodScorecardsByEmployee(
  scorecards: EmployeeScorecard[],
  cycleById?: Map<string, { isActive?: boolean; status?: string }>,
): EmployeeScorecard[] {
  const current = scorecards.filter((card) =>
    isCurrentReportingScorecard(card, cycleById),
  );
  return latestScorecardsByEmployee(current);
}
