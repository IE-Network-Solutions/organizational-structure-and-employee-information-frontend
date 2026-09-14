import {
  BscCadence,
  BscEvaluatorStep,
  BscSetupKind,
  BscScopeTarget,
  CreateEvaluationConfigInput,
  CycleStatus,
  EvaluationCycle,
  TargetLogic,
  UpdateEvaluationConfigInput,
} from '@/types/bsc';
import {
  mapEvaluatorStepFromApi,
  mapEvaluatorStepToApi,
  mapScopeTargetFromApi,
  mapScopeTargetToApi,
  mapTargetLogicFromApi,
} from './mappers';

/** KPI lines required by BE create/update (weights must sum to 100). */
export type BscTemplateKpiLineInput = {
  kpiLibraryId: string;
  weightPercentage: number;
  targetValue: number;
  worstCase?: number | null;
  bestCase?: number | null;
  cadence?: BscCadence | null;
  checkInDay?: number | null;
  evaluationFlow?: BscEvaluatorStep[];
};

export type CreateBscCycleApiInput = CreateEvaluationConfigInput & {
  templateKpis: BscTemplateKpiLineInput[];
};

export type UpdateBscCycleApiInput = UpdateEvaluationConfigInput & {
  templateKpis?: BscTemplateKpiLineInput[];
};

export type BscScorecardScopeItemApi = {
  scopeType?: string;
  departmentId?: string | null;
  positionId?: string | null;
  userId?: string | null;
  label?: string | null;
};

export type BscScorecardKpiApi = {
  kpiId: string;
  weight: number | string;
  targetValue: number | string;
  worstCase?: number | string | null;
  bestCase?: number | string | null;
  cadence: string;
  checkInDay?: number | null;
  horizon?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  effectiveFrom?: string | Date | null;
  evaluationFlow?: Array<{ kind: string; userId?: string | null }> | null;
  kpi?: {
    id?: string;
    name?: string;
    description?: string | null;
    measurementUnit?: string | null;
    targetDirection?: string | null;
    perspectiveId?: string | null;
    perspective?: { id?: string; name?: string } | null;
  } | null;
};

export type BscScorecardApi = {
  id: string;
  name: string;
  purpose?: string | null;
  scopeType: string;
  status: string;
  isActive?: boolean;
  effectiveFrom?: string | Date | null;
  defaultEvaluationFlow?: Array<{ kind: string; userId?: string | null }>;
  scopeItems?: BscScorecardScopeItemApi[];
  scorecardKpis?: BscScorecardKpiApi[];
  createdAt?: string | Date;
};

function toDateOnly(value?: string | Date | null): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

export function mapCadenceToApi(
  cadence?: BscCadence | null,
): 'Weekly' | 'BiWeekly' | 'Monthly' | 'Quarterly' | 'Yearly' {
  switch (cadence) {
    case BscCadence.Weekly:
    case BscCadence.BiWeekly:
    case BscCadence.Monthly:
    case BscCadence.Quarterly:
    case BscCadence.Yearly:
      return cadence;
    case BscCadence.Custom:
    default:
      return 'Monthly';
  }
}

export function mapCadenceFromApi(cadence?: string | null): BscCadence {
  switch (cadence) {
    case 'Weekly':
      return BscCadence.Weekly;
    case 'BiWeekly':
      return BscCadence.BiWeekly;
    case 'Monthly':
      return BscCadence.Monthly;
    case 'Quarterly':
      return BscCadence.Quarterly;
    case 'Yearly':
      return BscCadence.Yearly;
    default:
      return BscCadence.Monthly;
  }
}

export function mapCycleStatusFromApi(
  status: string,
  isActive?: boolean,
): CycleStatus {
  if (status === 'Locked') return CycleStatus.Locked;
  if (status === 'Closed') return CycleStatus.Closed;
  if (status === 'Active' || isActive) return CycleStatus.Open;
  // Draft stays Open in FE so catalogs can still select/edit it
  return CycleStatus.Open;
}

function buildScopeFromItems(
  scopeType: string,
  items: BscScorecardScopeItemApi[] = [],
): Pick<
  EvaluationCycle,
  | 'scopeTarget'
  | 'departmentIds'
  | 'departmentNames'
  | 'positionIds'
  | 'positionTitles'
  | 'employeeIds'
  | 'employeeNames'
> {
  const scopeTarget = mapScopeTargetFromApi(
    scopeType === 'User' ? 'User' : scopeType,
  );

  if (scopeTarget === BscScopeTarget.Department) {
    return {
      scopeTarget,
      departmentIds: items
        .map((i) => i.departmentId)
        .filter((id): id is string => Boolean(id)),
      departmentNames: items.map((i) => i.label || ''),
      positionIds: [],
      positionTitles: [],
      employeeIds: [],
      employeeNames: [],
    };
  }

  if (scopeTarget === BscScopeTarget.Role) {
    return {
      scopeTarget,
      departmentIds: [],
      departmentNames: [],
      positionIds: items
        .map((i) => i.positionId)
        .filter((id): id is string => Boolean(id)),
      positionTitles: items.map((i) => i.label || ''),
      employeeIds: [],
      employeeNames: [],
    };
  }

  if (scopeTarget === BscScopeTarget.Individual) {
    return {
      scopeTarget,
      departmentIds: [],
      departmentNames: [],
      positionIds: [],
      positionTitles: [],
      employeeIds: items
        .map((i) => i.userId)
        .filter((id): id is string => Boolean(id)),
      employeeNames: items.map((i) => i.label || ''),
    };
  }

  return {
    scopeTarget: BscScopeTarget.Company,
    departmentIds: [],
    departmentNames: [],
    positionIds: [],
    positionTitles: [],
    employeeIds: [],
    employeeNames: [],
  };
}

function toNum(value: number | string | null | undefined, fallback = 0): number {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function mapScorecardToCycle(row: BscScorecardApi): EvaluationCycle {
  const kpis = row.scorecardKpis || [];
  const firstKpi = kpis[0];
  const cadence = mapCadenceFromApi(firstKpi?.cadence);
  const horizon = firstKpi?.horizon === 'Temporary'
    ? BscSetupKind.Temporary
    : BscSetupKind.Permanent;
  const effectiveFrom =
    toDateOnly(row.effectiveFrom) ||
    toDateOnly(firstKpi?.effectiveFrom) ||
    toDateOnly(firstKpi?.startDate) ||
    new Date().toISOString().slice(0, 10);
  const endDate =
    toDateOnly(firstKpi?.endDate) ||
    (horizon === BscSetupKind.Temporary
      ? effectiveFrom
      : '2099-12-31');

  const kpiEvaluationFlows: Record<string, BscEvaluatorStep[]> = {};
  for (const line of kpis) {
    if (line.evaluationFlow?.length) {
      kpiEvaluationFlows[line.kpiId] = line.evaluationFlow.map(
        mapEvaluatorStepFromApi,
      );
    }
  }

  const defaultFlow = (row.defaultEvaluationFlow || []).map(
    mapEvaluatorStepFromApi,
  );
  const managerStep = defaultFlow.find(
    (s) => s.kind === 'directManager' || s.kind === 'user',
  );

  const scope = buildScopeFromItems(row.scopeType, row.scopeItems || []);

  const templateKpis = kpis.map((line) => ({
    kpiLibraryId: line.kpiId,
    weightPercentage: toNum(line.weight),
    targetValue: toNum(line.targetValue),
    worstCase:
      line.worstCase === undefined || line.worstCase === null
        ? null
        : toNum(line.worstCase),
    bestCase:
      line.bestCase === undefined || line.bestCase === null
        ? null
        : toNum(line.bestCase),
    cadence: mapCadenceFromApi(line.cadence),
    checkInDay: line.checkInDay ?? null,
    name: line.kpi?.name ?? null,
    description: line.kpi?.description ?? null,
    // Never fall back to perspectiveId — detail UI would show a UUID.
    perspective: line.kpi?.perspective?.name ?? null,
    measurementUnit: line.kpi?.measurementUnit ?? null,
    targetLogic: line.kpi?.targetDirection
      ? mapTargetLogicFromApi(line.kpi.targetDirection)
      : (null as TargetLogic | null),
  }));

  return {
    id: row.id,
    label: row.name,
    description: row.purpose ?? null,
    status: mapCycleStatusFromApi(row.status, row.isActive),
    cadence,
    setupKind: horizon,
    fiscalYearId:
      horizon === BscSetupKind.Temporary ? 'temporary' : 'permanent',
    fiscalYearName:
      horizon === BscSetupKind.Temporary ? 'Temporary' : 'Permanent',
    isActive: Boolean(row.isActive),
    effectiveFrom,
    periodIds: [],
    periodLabels: [
      horizon === BscSetupKind.Temporary
        ? `${effectiveFrom} – ${endDate}`
        : 'Ongoing',
    ],
    startDate: effectiveFrom,
    endDate,
    isRecurring: horizon !== BscSetupKind.Temporary,
    useCustomDates: horizon === BscSetupKind.Temporary,
    ...scope,
    evaluatorMode: managerStep?.kind === 'user' ? 'user' : 'directManager',
    evaluatorUserId: managerStep?.kind === 'user' ? managerStep.userId ?? null : null,
    kpiEvaluationFlows,
    templateKpis,
  };
}

function resolveScopeIds(input: CreateEvaluationConfigInput): {
  scopeType: 'Company' | 'Department' | 'Role' | 'User';
  scopeIds: string[];
  scopeLabels: string[];
} {
  const target =
    input.scopeTarget ||
    (input.employeeIds?.length
      ? BscScopeTarget.Individual
      : input.positionIds?.length
        ? BscScopeTarget.Role
        : input.departmentIds?.length
          ? BscScopeTarget.Department
          : BscScopeTarget.Company);

  const scopeType = mapScopeTargetToApi(target);

  if (scopeType === 'Company') {
    return { scopeType, scopeIds: [], scopeLabels: [] };
  }
  if (scopeType === 'Department') {
    return {
      scopeType,
      scopeIds: input.departmentIds || [],
      scopeLabels: input.departmentNames || [],
    };
  }
  if (scopeType === 'Role') {
    return {
      scopeType,
      scopeIds: input.positionIds || [],
      scopeLabels: input.positionTitles || [],
    };
  }
  return {
    scopeType: 'User',
    scopeIds: input.employeeIds || [],
    scopeLabels: input.employeeNames || [],
  };
}

function mapTemplateKpisToApi(
  lines: BscTemplateKpiLineInput[],
  input: CreateEvaluationConfigInput,
): Record<string, unknown>[] {
  const horizon =
    input.setupKind === BscSetupKind.Temporary || input.useCustomDates
      ? 'Temporary'
      : 'Permanent';
  const fallbackCadence = mapCadenceToApi(
    lines.find((l) => l.cadence)?.cadence || input.cadence,
  );

  return lines.map((line) => {
    const cadence = mapCadenceToApi(line.cadence || fallbackCadence);
    const flow = line.evaluationFlow?.length
      ? line.evaluationFlow.map(mapEvaluatorStepToApi)
      : undefined;

    const body: Record<string, unknown> = {
      kpiId: line.kpiLibraryId,
      weight: Number(line.weightPercentage),
      targetValue: Number(line.targetValue),
      cadence,
      horizon,
    };

    if (line.worstCase != null) body.worstCase = Number(line.worstCase);
    if (line.bestCase != null) body.bestCase = Number(line.bestCase);
    if (line.checkInDay != null) body.checkInDay = Number(line.checkInDay);
    if (flow?.length) body.evaluationFlow = flow;
    if (horizon === 'Temporary') {
      body.startDate = input.startDate || input.effectiveFrom;
      body.endDate = input.endDate;
    }
    if (input.effectiveFrom) {
      body.effectiveFrom = input.effectiveFrom;
    }

    return body;
  });
}

function defaultEvaluationFlowFromInput(
  input: CreateEvaluationConfigInput,
): Array<{ kind: string; userId?: string }> {
  const flows = Object.values(input.kpiEvaluationFlows || {});
  if (flows[0]?.length) {
    return flows[0].map(mapEvaluatorStepToApi);
  }
  if (input.evaluatorMode === 'user' && input.evaluatorUserId) {
    return [
      { kind: 'Self' },
      { kind: 'User', userId: input.evaluatorUserId },
    ];
  }
  return [{ kind: 'Self' }, { kind: 'DirectManager' }];
}

export function mapCycleCreateToApi(
  input: CreateBscCycleApiInput,
): Record<string, unknown> {
  if (!input.templateKpis?.length) {
    throw new Error('Add at least one KPI');
  }

  const scope = resolveScopeIds(input);
  return {
    name: input.label?.trim() || 'Scorecard',
    ...(input.description
      ? { purpose: input.description }
      : {}),
    scopeType: scope.scopeType,
    scopeIds: scope.scopeIds,
    ...(scope.scopeLabels.length ? { scopeLabels: scope.scopeLabels } : {}),
    ...(input.effectiveFrom ? { effectiveFrom: input.effectiveFrom } : {}),
    defaultEvaluationFlow: defaultEvaluationFlowFromInput(input),
    kpis: mapTemplateKpisToApi(input.templateKpis, input),
  };
}

export function mapCycleUpdateToApi(
  input: UpdateBscCycleApiInput,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (input.label !== undefined) body.name = input.label.trim();
  if (input.description !== undefined) {
    body.purpose = input.description ?? '';
  }
  if (input.effectiveFrom !== undefined) {
    body.effectiveFrom = input.effectiveFrom;
  }

  if (
    input.scopeTarget !== undefined ||
    input.departmentIds !== undefined ||
    input.positionIds !== undefined ||
    input.employeeIds !== undefined
  ) {
    const scope = resolveScopeIds(input as CreateEvaluationConfigInput);
    body.scopeType = scope.scopeType;
    body.scopeIds = scope.scopeIds;
    if (scope.scopeLabels.length) body.scopeLabels = scope.scopeLabels;
  }

  if (input.kpiEvaluationFlows || input.evaluatorMode !== undefined) {
    body.defaultEvaluationFlow = defaultEvaluationFlowFromInput(
      input as CreateEvaluationConfigInput,
    );
  }

  if (input.templateKpis?.length) {
    body.kpis = mapTemplateKpisToApi(
      input.templateKpis,
      input as CreateEvaluationConfigInput,
    );
  }

  return body;
}
