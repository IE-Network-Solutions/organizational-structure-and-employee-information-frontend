import {
  EmployeeScorecard,
  EvaluationCycle,
  KpiApprovalStatus,
  KpiLibraryItem,
  ScorecardKpiTarget,
  TargetLogic,
} from '@/types/bsc';

/**
 * When assignment list payloads omit KPI lines (or return empty targets),
 * fill shared targets from the scorecard template so KPI detail / rollups
 * can still list assigned employees.
 */
export function enrichAssignmentsWithTemplateKpis(
  cards: EmployeeScorecard[] | undefined,
  templateKpis: EvaluationCycle['templateKpis'] | undefined,
  catalogById?: Map<string, KpiLibraryItem>,
): EmployeeScorecard[] {
  const list = cards || [];
  if (!templateKpis?.length) return list;

  return list.map((card) => {
    if (card.targets?.length) return card;

    const targets: ScorecardKpiTarget[] = templateKpis.map((line) => {
      const catalog = catalogById?.get(line.kpiLibraryId);
      return {
        id: `${card.id}:${line.kpiLibraryId}`,
        scorecardId: card.id,
        kpiLibraryId: line.kpiLibraryId,
        kpiName: line.name || catalog?.name || 'KPI',
        perspective:
          line.perspective || catalog?.perspective || 'Perspective',
        targetLogic:
          line.targetLogic ||
          catalog?.targetLogic ||
          TargetLogic.HigherBetter,
        measurementUnit:
          line.measurementUnit || catalog?.measurementUnit || '%',
        weightPercentage: Number(line.weightPercentage) || 0,
        targetValue: Number(line.targetValue) || 0,
        worstCase: line.worstCase ?? catalog?.worstCase ?? null,
        bestCase: line.bestCase ?? catalog?.bestCase ?? null,
        cadence: line.cadence ?? catalog?.cadence ?? null,
        checkInDay: line.checkInDay ?? catalog?.checkInDay ?? null,
        approvalStatus: KpiApprovalStatus.Pending,
        assignmentSource: 'shared',
      };
    });

    return { ...card, targets };
  });
}
