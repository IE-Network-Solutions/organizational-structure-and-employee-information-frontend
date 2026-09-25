import {
  EmployeeScorecard,
  KpiApprovalStatus,
  PepAuditFlag,
  PepAuditRow,
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
  stretchTarget?: number | string | null;
  worstCase?: number | string | null;
  bestCase?: number | string | null;
  dataSource?: string | null;
  acceptableThreshold?: number | string | null;
  cadence: string;
  checkInDay?: number | null;
  evaluationFlow?: Array<{ kind: string; userId?: string | null }> | null;
  evaluationStepIndex?: number;
  actualValue?: number | string | null;
  score?: number | string | null;
  approvalStatus?: string;
  rejectionReason?: string | null;
  pepAuditFlag?: string | null;
  pepReturnReason?: string | null;
  adjustedValue?: number | string | null;
};

/** Raw row from GET /bsc/pep-audit */
export type BscPepAuditRowApi = {
  employeeScorecardId: string;
  kpiRowId: string;
  userId: string;
  managerId?: string | null;
  departmentId?: string | null;
  positionId?: string | null;
  cycleLabel?: string | null;
  periodKey?: string | null;
  scorecardName?: string | null;
  status?: string;
  kpiName: string;
  perspectiveName: string;
  targetValue: number | string;
  stretchTarget?: number | string | null;
  actualValue?: number | string | null;
  acceptableThreshold?: number | string | null;
  dataSource?: string | null;
  targetDirection: string;
  measurementUnit: string;
  approvalStatus?: string;
  rejectionReason?: string | null;
  pepReturnReason?: string | null;
  pepAuditFlag?: string | null;
  needsPepAction?: boolean;
  stretchAchieved?: boolean;
  employeeName?: string | null;
  departmentName?: string | null;
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

export function mapPepAuditFlagFromApi(
  flag?: string | null,
): PepAuditFlag | null {
  switch (flag) {
    case PepAuditFlag.PendingReview:
      return PepAuditFlag.PendingReview;
    case PepAuditFlag.Realistic:
      return PepAuditFlag.Realistic;
    case PepAuditFlag.Unrealistic:
      return PepAuditFlag.Unrealistic;
    default:
      return null;
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
    stretchTarget: toNullableNum(row.stretchTarget),
    worstCase: toNullableNum(row.worstCase),
    bestCase: toNullableNum(row.bestCase),
    cadence: mapCadenceFromApi(row.cadence),
    checkInDay: row.checkInDay ?? null,
    actualValue: toNullableNum(row.actualValue ?? row.adjustedValue),
    score: toNullableNum(row.score),
    approvalStatus: mapApprovalStatusFromApi(row.approvalStatus),
    rejectionReason: row.rejectionReason ?? null,
    dataSource: row.dataSource?.trim() ? row.dataSource.trim() : null,
    acceptableThreshold: toNullableNum(row.acceptableThreshold),
    pepAuditFlag: mapPepAuditFlagFromApi(row.pepAuditFlag),
    pepReturnReason: row.pepReturnReason ?? null,
    assignmentSource: source,
    evaluationFlow: (row.evaluationFlow || []).map(mapEvaluatorStepFromApi),
    evaluationStepIndex: row.evaluationStepIndex ?? 0,
  };
}

export function mapPepAuditRowFromApi(row: BscPepAuditRowApi): PepAuditRow {
  return {
    scorecardId: row.employeeScorecardId,
    targetId: row.kpiRowId,
    userId: row.userId,
    employeeName: row.employeeName || row.userId,
    cycleLabel: row.scorecardName || row.cycleLabel || '',
    departmentName: row.departmentName ?? null,
    kpiName: row.kpiName,
    perspective: row.perspectiveName,
    targetValue: toNum(row.targetValue),
    stretchTarget: toNullableNum(row.stretchTarget),
    actualValue: toNullableNum(row.actualValue),
    acceptableThreshold: toNullableNum(row.acceptableThreshold),
    dataSource: row.dataSource?.trim() ? row.dataSource.trim() : null,
    targetLogic: mapTargetLogicFromApi(row.targetDirection),
    measurementUnit: row.measurementUnit || '%',
    pepAuditFlag:
      mapPepAuditFlagFromApi(row.pepAuditFlag) || PepAuditFlag.PendingReview,
    approvalStatus: mapApprovalStatusFromApi(row.approvalStatus),
    rejectionReason: row.rejectionReason ?? null,
    pepReturnReason: row.pepReturnReason ?? null,
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
    // Never fall back to the raw UUID — callers resolve a display name from HRIS.
    userName: options?.userName || '',
    managerId: row.managerId || '',
    departmentId: row.departmentId ?? null,
    positionId: row.positionId ?? null,
    cycleId: row.scorecardId,
    cycleLabel: row.scorecard?.name || row.periodLabel || '',
    periodKey: row.periodKey || null,
    periodMonthName: row.periodLabel || null,
    periodYear: yearMatch ? Number(yearMatch[1]) : null,
    periodStart: row.periodStart ? toIso(row.periodStart) : null,
    periodEnd: row.periodEnd ? toIso(row.periodEnd) : null,
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

/**
 * Row from GET /bsc/check-ins/my-queue | review-queue.
 * BE sends a nested `employeeScorecard` plus flat card fields; older/newer
 * builds may send only one of them, so both are optional.
 */
export type BscCheckInQueueRowApi = {
  kpi: BscEmployeeScorecardKpiApi;
  employeeScorecard?: BscEmployeeScorecardApi | null;
  employeeScorecardId?: string;
  scorecardId?: string;
  userId?: string;
  managerId?: string | null;
  departmentId?: string | null;
  positionId?: string | null;
  status?: string;
  periodKey?: string;
  periodLabel?: string;
  periodStart?: string | Date;
  periodEnd?: string | Date;
};

function queueRowCard(
  row: BscCheckInQueueRowApi,
): BscEmployeeScorecardApi | null {
  if (row.employeeScorecard?.id) return row.employeeScorecard;
  const id = row.employeeScorecardId || row.kpi?.employeeScorecardId;
  if (!id) return null;
  return {
    id,
    scorecardId: row.scorecardId || '',
    userId: row.userId || '',
    managerId: row.managerId ?? null,
    departmentId: row.departmentId ?? null,
    positionId: row.positionId ?? null,
    periodKey: row.periodKey || '',
    periodLabel: row.periodLabel || '',
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    status: row.status || 'Active',
  };
}

/** Group queue KPI rows into FE employee scorecards for buildCheckinQueue. */
export function mapCheckInQueueToScorecards(
  rows: BscCheckInQueueRowApi[],
  options?: { userNameByUserId?: Record<string, string> },
): EmployeeScorecard[] {
  const byId = new Map<string, BscEmployeeScorecardApi>();

  for (const row of rows || []) {
    const card = row ? queueRowCard(row) : null;
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
