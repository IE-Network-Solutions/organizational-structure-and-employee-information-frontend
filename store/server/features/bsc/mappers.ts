import {
  BscEvaluatorStep,
  BscEvaluatorStepKind,
  BscPerspectiveDefinition,
  BscScopeTarget,
  CreateKpiLibraryInput,
  KpiLibraryItem,
  TargetLogic,
} from '@/types/bsc';

/** Raw perspective row from GET/POST/PATCH /bsc/perspectives */
export type BscPerspectiveApi = {
  id: string;
  name: string;
  description?: string | null;
  isSystem?: boolean;
  sortOrder?: number;
  createdAt?: string | Date;
};

/** Raw KPI row from /bsc/kpis (perspective relation may be joined) */
export type BscKpiApi = {
  id: string;
  perspectiveId: string;
  name: string;
  description?: string | null;
  targetDirection: string;
  worstCase?: number | string | null;
  bestCase?: number | string | null;
  measurementUnit: string;
  defaultTarget?: number | string | null;
  createdAt?: string | Date;
  perspective?: { id: string; name: string } | null;
};

function toIso(value?: string | Date | null): string {
  if (value instanceof Date) return value.toISOString();
  if (value) return String(value);
  return new Date().toISOString();
}

function toNullableNumber(value: number | string | null | undefined): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function mapPerspectiveFromApi(
  row: BscPerspectiveApi,
): BscPerspectiveDefinition {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    isSystem: Boolean(row.isSystem),
    createdAt: toIso(row.createdAt),
  };
}

export function mapKpiFromApi(row: BscKpiApi): KpiLibraryItem {
  return {
    id: row.id,
    /** Tenant KPI library is not tied to a scorecard template on the BE */
    evaluationConfigId: 'library',
    name: row.name,
    description: row.description ?? null,
    perspective: row.perspective?.name || row.perspectiveId,
    targetLogic: mapTargetLogicFromApi(row.targetDirection),
    measurementUnit: row.measurementUnit || '%',
    defaultTarget: toNullableNumber(row.defaultTarget),
    weight: 0,
    suggestedWeight: null,
    worstCase: toNullableNumber(row.worstCase),
    bestCase: toNullableNumber(row.bestCase),
    cadence: null,
    checkInDay: null,
    createdAt: toIso(row.createdAt),
  };
}

/** Payload for POST /bsc/kpis (perspectiveId already resolved) */
export function mapKpiCreateToApi(
  input: CreateKpiLibraryInput,
  perspectiveId: string,
): Record<string, unknown> {
  const targetDirection = mapTargetLogicToApi(
    input.targetLogic ?? TargetLogic.HigherBetter,
  );
  const body: Record<string, unknown> = {
    perspectiveId,
    name: input.name.trim(),
    targetDirection,
    measurementUnit: (input.measurementUnit || '%').trim(),
  };

  if (input.description != null && input.description !== '') {
    body.description = input.description;
  }
  if (input.defaultTarget != null) {
    body.defaultTarget = Number(input.defaultTarget);
  }
  if (targetDirection === 'Bounded') {
    body.worstCase = Number(input.worstCase);
    body.bestCase = Number(input.bestCase);
  }

  return body;
}

/** Payload for PATCH /bsc/kpis/:id */
export function mapKpiUpdateToApi(
  input: Partial<CreateKpiLibraryInput>,
  perspectiveId?: string,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (perspectiveId) body.perspectiveId = perspectiveId;
  if (input.name !== undefined) body.name = input.name.trim();
  if (input.description !== undefined) {
    body.description = input.description ?? '';
  }
  if (input.measurementUnit !== undefined) {
    body.measurementUnit = String(input.measurementUnit || '%').trim();
  }
  if (input.defaultTarget !== undefined) {
    body.defaultTarget =
      input.defaultTarget == null ? null : Number(input.defaultTarget);
  }
  if (input.targetLogic !== undefined) {
    const targetDirection = mapTargetLogicToApi(input.targetLogic);
    body.targetDirection = targetDirection;
    if (targetDirection === 'Bounded') {
      if (input.worstCase !== undefined) {
        body.worstCase =
          input.worstCase == null ? null : Number(input.worstCase);
      }
      if (input.bestCase !== undefined) {
        body.bestCase = input.bestCase == null ? null : Number(input.bestCase);
      }
    }
  } else {
    if (input.worstCase !== undefined) {
      body.worstCase =
        input.worstCase == null ? null : Number(input.worstCase);
    }
    if (input.bestCase !== undefined) {
      body.bestCase = input.bestCase == null ? null : Number(input.bestCase);
    }
  }

  return body;
}

/** FE TargetLogic ↔ BE targetDirection */
export function mapTargetLogicToApi(
  logic: TargetLogic,
): 'HigherIsBetter' | 'LowerIsBetter' | 'Bounded' {
  switch (logic) {
    case TargetLogic.HigherBetter:
      return 'HigherIsBetter';
    case TargetLogic.LowerBetter:
      return 'LowerIsBetter';
    case TargetLogic.Bounded:
      return 'Bounded';
    default:
      return 'HigherIsBetter';
  }
}

export function mapTargetLogicFromApi(
  direction: string | null | undefined,
): TargetLogic {
  switch (direction) {
    case 'HigherIsBetter':
      return TargetLogic.HigherBetter;
    case 'LowerIsBetter':
      return TargetLogic.LowerBetter;
    case 'Bounded':
      return TargetLogic.Bounded;
    default:
      return TargetLogic.HigherBetter;
  }
}

/** FE BscScopeTarget.Individual ↔ BE User */
export function mapScopeTargetToApi(
  scope: BscScopeTarget,
): 'Company' | 'Department' | 'Role' | 'User' {
  if (scope === BscScopeTarget.Individual) return 'User';
  return scope;
}

export function mapScopeTargetFromApi(
  scope: string | null | undefined,
): BscScopeTarget {
  switch (scope) {
    case 'User':
      return BscScopeTarget.Individual;
    case 'Company':
      return BscScopeTarget.Company;
    case 'Department':
      return BscScopeTarget.Department;
    case 'Role':
      return BscScopeTarget.Role;
    default:
      return BscScopeTarget.Company;
  }
}

export function mapEvaluatorStepToApi(step: BscEvaluatorStep): {
  kind: 'Self' | 'DirectManager' | 'User';
  userId?: string;
} {
  const kindMap: Record<
    BscEvaluatorStepKind,
    'Self' | 'DirectManager' | 'User'
  > = {
    self: 'Self',
    directManager: 'DirectManager',
    user: 'User',
  };
  return {
    kind: kindMap[step.kind],
    ...(step.userId ? { userId: step.userId } : {}),
  };
}

export function mapEvaluatorStepFromApi(step: {
  kind: string;
  userId?: string | null;
}): BscEvaluatorStep {
  const kindMap: Record<string, BscEvaluatorStepKind> = {
    Self: 'self',
    self: 'self',
    DirectManager: 'directManager',
    directManager: 'directManager',
    User: 'user',
    user: 'user',
  };
  const normalized = String(step.kind || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, '');
  const fromNormalized =
    normalized === 'self'
      ? 'self'
      : normalized === 'directmanager'
        ? 'directManager'
        : normalized === 'user'
          ? 'user'
          : null;
  return {
    kind: fromNormalized ?? kindMap[step.kind] ?? 'directManager',
    userId: step.userId ?? null,
  };
}
