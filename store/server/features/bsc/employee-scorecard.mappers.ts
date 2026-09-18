import {
  EmployeeScorecard,
  KpiApprovalStatus,
  ScorecardKpiTarget,
  ScorecardStatus,
} from '@/types/bsc';
import {
  mapCadenceFromApi,
} from './scorecard.mappers';
import {
  mapEvaluatorStepFromApi,
  mapTargetLogicFromApi,
} from './mappers';

export type BscEmployeeScorecardKpiApi = {
  id: string;
  employeeScorecardId?: string;
  kpiId: string;
  assignmentSource: string;
  name: string;
  perspectiveName: string;
  targetDirection: string;
  measurementUnit: string;
  weight: number | string;
  targetValue: number | string;
  worstCase?: number | string | null;
  bestCase?: number | string | null;
  cadence: string;
  checkInDay?: number | null;
  evaluationFlow?: Array<{ kind: string; userId?: string | null }> | null;
  evaluationStepIndex?: number;
  actualValue?: number | string | null;
  score?: number | string | null;
  approvalStatus?: string;
  rejectionReason?: string | null;
  adjustedValue?: number | string | null;
};

export type BscEmployeeScorecardApi = {
  id: string;
  scorecardId: string;
  userId: string;
  managerId?: string | null;
  departmentId?: string | null;
  positionId?: string | null;
  periodKey: string;
  periodLabel: string;
  periodStart?: string | Date;
  periodEnd?: string | Date;
  status: string;
  compositeScore?: number | string | null;
  submittedAt?: string | Date | null;
  completedAt?: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  scorecard?: { id?: string; name?: string } | null;
  kpis?: BscEmployeeScorecardKpiApi[];
};

function toIso(value?: string | Date | null): string {
  if (value instanceof Date) return value.toISOString();
  if (value) return String(value);
  return new Date().toISOString();
}

function toNum(value: number | string | null | undefined, fallback = 0): number {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toNullableNum(
  value: number | string | null | undefined,
): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function mapEmployeeStatusFromApi(status: string): ScorecardStatus {
  switch (status) {
    case 'Draft':
      return ScorecardStatus.Draft;
    case 'Active':
      return ScorecardStatus.Active;
    case 'PendingEval':
      return ScorecardStatus.PendingEval;
    case 'NeedsResubmit':
      return ScorecardStatus.NeedsResubmit;
    case 'Scored':
      return ScorecardStatus.Scored;
    case 'Completed':
      return ScorecardStatus.Completed;
    default:
      return ScorecardStatus.Active;
  }
}

export function mapApprovalStatusFromApi(
  status?: string | null,
): KpiApprovalStatus {
  switch (status) {
    case 'Approved':
      return KpiApprovalStatus.Approved;
    case 'Rejected':
      return KpiApprovalStatus.Rejected;
    default:
      return KpiApprovalStatus.Pending;
  }
}

export function mapEmployeeKpiToTarget(
  row: BscEmployeeScorecardKpiApi,
  employeeScorecardId: string,
): ScorecardKpiTarget {
  const sourceRaw = String(row.assignmentSource || '').toLowerCase();
  const source = sourceRaw === 'individual' ? 'individual' : 'shared';

  return {
    id: row.id,
    scorecardId: employeeScorecardId,
    kpiLibraryId: row.kpiId,
    kpiName: row.name,
    perspective: row.perspectiveName,
    targetLogic: mapTargetLogicFromApi(row.targetDirection),
    measurementUnit: row.measurementUnit || '%',
    weightPercentage: toNum(row.weight),
    targetValue: toNum(row.targetValue),
    worstCase: toNullableNum(row.worstCase),
    bestCase: toNullableNum(row.bestCase),
    cadence: mapCadenceFromApi(row.cadence),
    checkInDay: row.checkInDay ?? null,
    actualValue: toNullableNum(row.actualValue ?? row.adjustedValue),
    score: toNullableNum(row.score),
    approvalStatus: mapApprovalStatusFromApi(row.approvalStatus),
    rejectionReason: row.rejectionReason ?? null,
    assignmentSource: source,
    evaluationFlow: (row.evaluationFlow || []).map(mapEvaluatorStepFromApi),
    evaluationStepIndex: row.evaluationStepIndex ?? 0,
  };
}

export function mapEmployeeScorecardFromApi(
  row: BscEmployeeScorecardApi,
  options?: { userName?: string | null },
): EmployeeScorecard {
  const kpis = row.kpis || [];
  const periodStart = toIso(row.periodStart);
  const yearMatch = String(row.periodKey || '').match(/^(\d{4})/);

  return {
    id: row.id,
    userId: row.userId,
    userName: options?.userName || row.userId,
    managerId: row.managerId || '',
    departmentId: row.departmentId ?? null,
    positionId: row.positionId ?? null,
    cycleId: row.scorecardId,
    cycleLabel: row.scorecard?.name || row.periodLabel || '',
    periodMonthName: row.periodLabel || null,
    periodYear: yearMatch ? Number(yearMatch[1]) : null,
    status: mapEmployeeStatusFromApi(row.status),
    targets: kpis.map((kpi) => mapEmployeeKpiToTarget(kpi, row.id)),
    finalEvaluation:
      row.compositeScore != null
        ? {
            compositeScore: toNum(row.compositeScore),
            managerNote: '',
            evaluatedAt: toIso(row.completedAt || row.updatedAt),
            evaluatorUserId: 'system',
          }
        : null,
    createdAt: toIso(row.createdAt || periodStart),
    updatedAt: toIso(row.updatedAt || row.createdAt),
  };
}

export function mapMyScorecardDetailToEmployee(
  detail: {
    scorecard: BscEmployeeScorecardApi;
    sharedKpis: BscEmployeeScorecardKpiApi[];
    individualKpis: BscEmployeeScorecardKpiApi[];
  },
  options?: { userName?: string | null },
): EmployeeScorecard {
  const merged: BscEmployeeScorecardApi = {
    ...detail.scorecard,
    kpis: [...(detail.sharedKpis || []), ...(detail.individualKpis || [])],
  };
  return mapEmployeeScorecardFromApi(merged, options);
}

export type BscCheckInQueueRowApi = {
  kpi: BscEmployeeScorecardKpiApi;
  employeeScorecard: BscEmployeeScorecardApi;
};

/** Group queue KPI rows into FE employee scorecards for buildCheckinQueue. */
export function mapCheckInQueueToScorecards(
  rows: BscCheckInQueueRowApi[],
  options?: { userNameByUserId?: Record<string, string> },
): EmployeeScorecard[] {
  const byId = new Map<string, BscEmployeeScorecardApi>();

  for (const row of rows || []) {
    const card = row.employeeScorecard;
    if (!card?.id || !row.kpi) continue;
    const existing = byId.get(card.id);
    if (!existing) {
      byId.set(card.id, {
        ...card,
        kpis: [row.kpi],
      });
    } else {
      const kpis = existing.kpis || [];
      if (!kpis.some((k) => k.id === row.kpi.id)) {
        existing.kpis = [...kpis, row.kpi];
      }
    }
  }

  return Array.from(byId.values()).map((card) =>
    mapEmployeeScorecardFromApi(card, {
      userName: options?.userNameByUserId?.[card.userId],
    }),
  );
}
