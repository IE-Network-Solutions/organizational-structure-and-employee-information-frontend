import {
  AppendIndividualKpisInput,
  AdjustReportedKpiInput,
  BscPerspectiveDefinition,
  CreateKpiLibraryInput,
  CreatePerspectiveInput,
  EmployeeScorecard,
  EvaluationCycle,
  KpiImportBatchResult,
  KpiImportRowInput,
  KpiLibraryItem,
  PepAuditRow,
  ReportKpiInput,
  ScorecardStatus,
  TargetLogic,
} from '@/types/bsc';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { toBscError } from './errors';
import {
  BscCheckInQueueRowApi,
  BscEmployeeScorecardApi,
  BscEmployeeScorecardKpiApi,
  BscPepAuditRowApi,
  mapCheckInQueueToScorecards,
  mapEmployeeScorecardFromApi,
  mapMyScorecardDetailToEmployee,
  mapPepAuditRowFromApi,
} from './employee-scorecard.mappers';
import {
  BscKpiApi,
  BscPerspectiveApi,
  mapEvaluatorStepToApi,
  mapKpiCreateToApi,
  mapKpiFromApi,
  mapKpiUpdateToApi,
  mapPerspectiveFromApi,
  mapTargetLogicToApi,
} from './mappers';
import {
  BscScorecardApi,
  CreateBscCycleApiInput,
  UpdateBscCycleApiInput,
  mapCadenceToApi,
  mapCycleCreateToApi,
  mapCycleUpdateToApi,
  mapScorecardToCycle,
} from './scorecard.mappers';

const BSC_BASE = `${OKR_AND_PLANNING_URL}/bsc`;

async function bscAuthHeaders(): Promise<Record<string, string>> {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return {
    Authorization: `Bearer ${token}`,
    tenantId: String(tenantId ?? ''),
  };
}

/** Org user UUID from auth store — same identity OKR passes on /objective/:userId. */
function authStoreUserId(): string {
  return String(useAuthenticationStore.getState().userId || '').trim();
}

function withAuthUserId(
  params: Record<string, string> = {},
): Record<string, string> {
  const userId = authStoreUserId();
  if (userId) params.userId = userId;
  return params;
}

/** Resolve FE perspective name or id to BE perspective UUID. */
async function resolvePerspectiveId(perspective: string): Promise<string> {
  const key = perspective?.trim();
  if (!key) {
    throw new Error('Select a perspective');
  }

  const perspectives = await listBscPerspectives();
  const byId = perspectives.find((p) => p.id === key);
  if (byId) return byId.id;

  const byName = perspectives.find(
    (p) => p.name.toLowerCase() === key.toLowerCase(),
  );
  if (byName) return byName.id;

  throw new Error(`Perspective "${key}" was not found`);
}

export async function listBscPerspectives(
  search?: string,
): Promise<BscPerspectiveDefinition[]> {
  try {
    const headers = await bscAuthHeaders();
    const data = (await crudRequest({
      url: `${BSC_BASE}/perspectives`,
      method: 'GET',
      headers,
      params: search ? { search } : undefined,
    })) as BscPerspectiveApi[];

    return (Array.isArray(data) ? data : []).map(mapPerspectiveFromApi);
  } catch (error) {
    throw toBscError(error, 'Failed to load perspectives');
  }
}

export async function getBscPerspective(
  id: string,
): Promise<BscPerspectiveDefinition> {
  try {
    const headers = await bscAuthHeaders();
    const data = (await crudRequest({
      url: `${BSC_BASE}/perspectives/${id}`,
      method: 'GET',
      headers,
    })) as BscPerspectiveApi;

    return mapPerspectiveFromApi(data);
  } catch (error) {
    throw toBscError(error, 'Failed to load perspective');
  }
}

export async function createBscPerspective(
  input: CreatePerspectiveInput,
): Promise<BscPerspectiveDefinition> {
  try {
    const headers = await bscAuthHeaders();
    const data = (await crudRequest({
      url: `${BSC_BASE}/perspectives`,
      method: 'POST',
      headers,
      data: {
        name: input.name?.trim(),
        ...(input.description != null && input.description !== ''
          ? { description: input.description }
          : {}),
      },
    })) as BscPerspectiveApi;

    return mapPerspectiveFromApi(data);
  } catch (error) {
    throw toBscError(error, 'Failed to create perspective');
  }
}

export async function updateBscPerspective(
  id: string,
  input: Partial<CreatePerspectiveInput>,
): Promise<BscPerspectiveDefinition> {
  try {
    const headers = await bscAuthHeaders();
    const body: Record<string, string> = {};
    if (input.name !== undefined) body.name = input.name.trim();
    if (input.description !== undefined) {
      body.description = input.description ?? '';
    }

    const data = (await crudRequest({
      url: `${BSC_BASE}/perspectives/${id}`,
      method: 'PATCH',
      headers,
      data: body,
    })) as BscPerspectiveApi;

    return mapPerspectiveFromApi(data);
  } catch (error) {
    throw toBscError(error, 'Failed to update perspective');
  }
}

export async function deleteBscPerspective(id: string): Promise<void> {
  try {
    const headers = await bscAuthHeaders();
    await crudRequest({
      url: `${BSC_BASE}/perspectives/${id}`,
      method: 'DELETE',
      headers,
    });
  } catch (error) {
    throw toBscError(error, 'Failed to delete perspective');
  }
}

export async function listBscKpis(filters?: {
  perspectiveId?: string;
  search?: string;
}): Promise<KpiLibraryItem[]> {
  try {
    const headers = await bscAuthHeaders();
    const params: Record<string, string> = {};
    if (filters?.perspectiveId) params.perspectiveId = filters.perspectiveId;
    if (filters?.search?.trim()) params.search = filters.search.trim();

    const data = (await crudRequest({
      url: `${BSC_BASE}/kpis`,
      method: 'GET',
      headers,
      params: Object.keys(params).length ? params : undefined,
    })) as BscKpiApi[];

    return (Array.isArray(data) ? data : []).map(mapKpiFromApi);
  } catch (error) {
    throw toBscError(error, 'Failed to load KPIs');
  }
}

export async function getBscKpi(id: string): Promise<KpiLibraryItem> {
  try {
    const headers = await bscAuthHeaders();
    const data = (await crudRequest({
      url: `${BSC_BASE}/kpis/${id}`,
      method: 'GET',
      headers,
    })) as BscKpiApi;

    return mapKpiFromApi(data);
  } catch (error) {
    throw toBscError(error, 'Failed to load KPI');
  }
}

export async function createBscKpi(
  input: CreateKpiLibraryInput,
): Promise<KpiLibraryItem> {
  try {
    const perspectiveId = await resolvePerspectiveId(input.perspective);
    const headers = await bscAuthHeaders();
    const data = (await crudRequest({
      url: `${BSC_BASE}/kpis`,
      method: 'POST',
      headers,
      data: mapKpiCreateToApi(input, perspectiveId),
    })) as BscKpiApi;

    // List/create may omit nested perspective; re-fetch for a complete FE shape.
    if (!data.perspective?.name) {
      return getBscKpi(data.id);
    }
    return mapKpiFromApi(data);
  } catch (error) {
    throw toBscError(error, 'Failed to create KPI');
  }
}

export async function updateBscKpi(
  id: string,
  input: Partial<CreateKpiLibraryInput>,
): Promise<KpiLibraryItem> {
  try {
    let perspectiveId: string | undefined;
    if (input.perspective !== undefined) {
      perspectiveId = await resolvePerspectiveId(input.perspective);
    }

    const headers = await bscAuthHeaders();
    const data = (await crudRequest({
      url: `${BSC_BASE}/kpis/${id}`,
      method: 'PATCH',
      headers,
      data: mapKpiUpdateToApi(input, perspectiveId),
    })) as BscKpiApi;

    if (!data.perspective?.name) {
      return getBscKpi(data.id);
    }
    return mapKpiFromApi(data);
  } catch (error) {
    throw toBscError(error, 'Failed to update KPI');
  }
}

export async function deleteBscKpi(id: string): Promise<void> {
  try {
    const headers = await bscAuthHeaders();
    await crudRequest({
      url: `${BSC_BASE}/kpis/${id}`,
      method: 'DELETE',
      headers,
    });
  } catch (error) {
    throw toBscError(error, 'Failed to delete KPI');
  }
}

export async function listBscScorecards(filters?: {
  status?: string;
  scopeType?: string;
  search?: string;
}): Promise<EvaluationCycle[]> {
  try {
    const headers = await bscAuthHeaders();
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.scopeType) params.scopeType = filters.scopeType;
    if (filters?.search?.trim()) params.search = filters.search.trim();

    const data = (await crudRequest({
      url: `${BSC_BASE}/scorecards`,
      method: 'GET',
      headers,
      params: Object.keys(params).length ? params : undefined,
    })) as BscScorecardApi[];

    return (Array.isArray(data) ? data : []).map(mapScorecardToCycle);
  } catch (error) {
    throw toBscError(error, 'Failed to load scorecards');
  }
}

export async function getBscScorecardTemplate(
  id: string,
): Promise<EvaluationCycle> {
  try {
    const headers = await bscAuthHeaders();
    const data = (await crudRequest({
      url: `${BSC_BASE}/scorecards/${id}`,
      method: 'GET',
      headers,
    })) as BscScorecardApi;

    return mapScorecardToCycle(data);
  } catch (error) {
    throw toBscError(error, 'Failed to load scorecard');
  }
}

export async function createBscScorecardTemplate(
  input: CreateBscCycleApiInput,
): Promise<EvaluationCycle> {
  try {
    const headers = await bscAuthHeaders();
    const created = (await crudRequest({
      url: `${BSC_BASE}/scorecards`,
      method: 'POST',
      headers,
      data: mapCycleCreateToApi(input),
    })) as BscScorecardApi;

    // FE create flow treats templates as active; activate Draft → Active.
    if (input.isActive !== false) {
      return activateBscScorecardTemplate(created.id);
    }

    return getBscScorecardTemplate(created.id);
  } catch (error) {
    throw toBscError(error, 'Failed to create scorecard');
  }
}

export async function updateBscScorecardTemplate(
  id: string,
  input: UpdateBscCycleApiInput,
): Promise<EvaluationCycle> {
  try {
    const headers = await bscAuthHeaders();
    await crudRequest({
      url: `${BSC_BASE}/scorecards/${id}`,
      method: 'PATCH',
      headers,
      data: mapCycleUpdateToApi(input),
    });

    if (input.isActive === true) {
      try {
        return await activateBscScorecardTemplate(id);
      } catch {
        // Already Active or not activatable — return latest
      }
    }

    return getBscScorecardTemplate(id);
  } catch (error) {
    throw toBscError(error, 'Failed to update scorecard');
  }
}

export async function deleteBscScorecardTemplate(id: string): Promise<void> {
  try {
    const headers = await bscAuthHeaders();
    await crudRequest({
      url: `${BSC_BASE}/scorecards/${id}`,
      method: 'DELETE',
      headers,
    });
  } catch (error) {
    throw toBscError(error, 'Failed to delete scorecard');
  }
}

export async function activateBscScorecardTemplate(
  id: string,
): Promise<EvaluationCycle> {
  try {
    const headers = await bscAuthHeaders();
    const data = (await crudRequest({
      url: `${BSC_BASE}/scorecards/${id}/activate`,
      method: 'POST',
      headers,
    })) as BscScorecardApi;

    return mapScorecardToCycle(data);
  } catch (error) {
    throw toBscError(error, 'Failed to activate scorecard');
  }
}

export async function lockBscScorecardTemplate(
  id: string,
): Promise<EvaluationCycle> {
  try {
    const headers = await bscAuthHeaders();
    const data = (await crudRequest({
      url: `${BSC_BASE}/scorecards/${id}/lock`,
      method: 'POST',
      headers,
    })) as BscScorecardApi;

    return mapScorecardToCycle(data);
  } catch (error) {
    throw toBscError(error, 'Failed to lock scorecard');
  }
}

export async function deactivateBscScorecardTemplate(
  id: string,
): Promise<EvaluationCycle> {
  try {
    const headers = await bscAuthHeaders();
    const data = (await crudRequest({
      url: `${BSC_BASE}/scorecards/${id}/deactivate`,
      method: 'POST',
      headers,
    })) as BscScorecardApi;

    return mapScorecardToCycle(data);
  } catch (error) {
    throw toBscError(error, 'Failed to deactivate scorecard');
  }
}

export type BscAssignResult = {
  scorecardId: string;
  period: {
    periodKey: string;
    periodLabel: string;
    periodStart: string;
    periodEnd: string;
  };
  userCount: number;
  created: number;
  updated: number;
  employeeScorecardIds: string[];
  assignees?: Array<{
    userId: string;
    employeeScorecardId: string;
    managerId?: string | null;
    departmentId?: string | null;
    positionId?: string | null;
  }>;
};

function unwrapListPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const row = data as { data?: unknown; items?: unknown; results?: unknown };
    if (Array.isArray(row.data)) return row.data;
    if (Array.isArray(row.items)) return row.items;
    if (Array.isArray(row.results)) return row.results;
  }
  return [];
}

/**
 * Materialize employee scorecards for all users in the template scope.
 * Company scope can take a while — callers should show a loading state.
 */
export async function assignBscScorecard(
  scorecardId: string,
  asOf?: string | null,
): Promise<BscAssignResult> {
  try {
    const headers = await bscAuthHeaders();
    const params: Record<string, string> = {};
    if (asOf?.trim()) params.asOf = asOf.trim().slice(0, 10);

    const data = (await crudRequest({
      url: `${BSC_BASE}/scorecards/${scorecardId}/assign`,
      method: 'POST',
      headers,
      params: Object.keys(params).length ? params : undefined,
    })) as BscAssignResult;

    return data;
  } catch (error) {
    throw toBscError(error, 'Failed to assign scorecard');
  }
}

/**
 * Admin list: employee scorecards created for a template (one latest row per user).
 */
export async function listBscScorecardAssignments(
  scorecardId: string,
  options?: { userNameByUserId?: Record<string, string> },
): Promise<EmployeeScorecard[]> {
  try {
    const headers = await bscAuthHeaders();
    const data = await crudRequest({
      url: `${BSC_BASE}/scorecards/${scorecardId}/employee-scorecards`,
      method: 'GET',
      headers,
    });

    return unwrapListPayload(data).map((row) =>
      mapEmployeeScorecardFromApi(row as BscEmployeeScorecardApi, {
        userName: options?.userNameByUserId?.[(row as BscEmployeeScorecardApi).userId],
      }),
    );
  } catch (error) {
    throw toBscError(error, 'Failed to load assigned people');
  }
}

/** Map assign API assignees into FE employee scorecard stubs for the People card. */
export function mapAssignAssigneesToScorecards(
  result: BscAssignResult,
): EmployeeScorecard[] {
  if (!result.assignees?.length) return [];

  const period = result.period;
  const yearMatch = String(period?.periodKey || '').match(/^(\d{4})/);

  return result.assignees.map((assignee) => ({
    id: assignee.employeeScorecardId,
    userId: assignee.userId,
    userName: assignee.userId,
    managerId: assignee.managerId || '',
    departmentId: assignee.departmentId ?? null,
    positionId: assignee.positionId ?? null,
    cycleId: result.scorecardId,
    cycleLabel: period?.periodLabel || '',
    periodKey: period?.periodKey || null,
    periodMonthName: period?.periodLabel || null,
    periodYear: yearMatch ? Number(yearMatch[1]) : null,
    periodStart: period?.periodStart || null,
    periodEnd: period?.periodEnd || null,
    status: ScorecardStatus.Active,
    targets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

function currentUserDisplayName(): string {
  const { userId, userData } = useAuthenticationStore.getState();
  const first = userData?.firstName || userData?.first_name || '';
  const last = userData?.lastName || userData?.last_name || '';
  const full = `${first} ${last}`.replace(/\s+/g, ' ').trim();
  return full || userData?.email || userId || 'Me';
}

export async function listMyBscScorecards(filters?: {
  periodKey?: string;
  status?: string;
}): Promise<EmployeeScorecard[]> {
  try {
    const headers = await bscAuthHeaders();
    const params = withAuthUserId();
    if (filters?.periodKey) params.periodKey = filters.periodKey;
    if (filters?.status) params.status = filters.status;

    const data = await crudRequest({
      url: `${BSC_BASE}/my-scorecard`,
      method: 'GET',
      headers,
      params,
    });

    const userName = currentUserDisplayName();
    const actorUserId = authStoreUserId();
    return unwrapListPayload(data)
      .map((row) =>
        mapEmployeeScorecardFromApi(row as BscEmployeeScorecardApi, {
          userName,
        }),
      )
      .filter((card) => !actorUserId || card.userId === actorUserId);
  } catch (error) {
    throw toBscError(error, 'Failed to load my scorecards');
  }
}

/** Results tab: mine / team / all employee scorecards. */
export async function listBscResultsScorecards(
  scope: 'mine' | 'team' | 'all',
  filters?: { periodKey?: string; status?: string },
): Promise<EmployeeScorecard[]> {
  try {
    const headers = await bscAuthHeaders();
    const params = withAuthUserId({ scope });
    if (filters?.periodKey) params.periodKey = filters.periodKey;
    if (filters?.status) params.status = filters.status;

    const data = await crudRequest({
      url: `${BSC_BASE}/employee-scorecards`,
      method: 'GET',
      headers,
      params,
    });

    const userName =
      scope === 'mine' ? currentUserDisplayName() : undefined;
    const actorUserId = authStoreUserId();
    return unwrapListPayload(data)
      .map((row) =>
        mapEmployeeScorecardFromApi(row as BscEmployeeScorecardApi, {
          userName: scope === 'mine' ? userName : undefined,
        }),
      )
      .filter(
        (card) =>
          scope !== 'mine' || !actorUserId || card.userId === actorUserId,
      );
  } catch (error) {
    throw toBscError(error, 'Failed to load results scorecards');
  }
}

export async function getMyBscScorecardDetail(
  id: string,
): Promise<EmployeeScorecard> {
  try {
    const headers = await bscAuthHeaders();
    const data = (await crudRequest({
      url: `${BSC_BASE}/my-scorecard/${id}`,
      method: 'GET',
      headers,
      params: withAuthUserId(),
    })) as {
      scorecard: BscEmployeeScorecardApi;
      sharedKpis: BscEmployeeScorecardKpiApi[];
      individualKpis: BscEmployeeScorecardKpiApi[];
    };

    return mapMyScorecardDetailToEmployee(data, {
      userName: currentUserDisplayName(),
    });
  } catch (error) {
    throw toBscError(error, 'Failed to load scorecard');
  }
}

export async function getMyBscScorecardResults(id: string) {
  try {
    const headers = await bscAuthHeaders();
    return await crudRequest({
      url: `${BSC_BASE}/my-scorecard/${id}/results`,
      method: 'GET',
      headers,
      params: withAuthUserId(),
    });
  } catch (error) {
    throw toBscError(error, 'Failed to load scorecard results');
  }
}

export async function appendIndividualBscKpis(
  input: AppendIndividualKpisInput,
): Promise<EmployeeScorecard> {
  try {
    const headers = await bscAuthHeaders();
    const body: Record<string, unknown> = {
      kpis: input.kpis.map((kpi) => {
        const line: Record<string, unknown> = {
          kpiId: kpi.kpiLibraryId,
          weight: Number(kpi.weightPercentage),
          targetValue: Number(kpi.targetValue),
        };
        if (kpi.worstCase != null) line.worstCase = Number(kpi.worstCase);
        if (kpi.bestCase != null) line.bestCase = Number(kpi.bestCase);
        if (kpi.stretchTarget != null) {
          line.stretchTarget = Number(kpi.stretchTarget);
        }
        if (kpi.dataSource != null && kpi.dataSource !== '') {
          line.dataSource = String(kpi.dataSource).trim();
        }
        if (kpi.acceptableThreshold != null) {
          line.acceptableThreshold = Number(kpi.acceptableThreshold);
        }
        if (kpi.cadence) line.cadence = mapCadenceToApi(kpi.cadence);
        if (kpi.checkInDay != null) line.checkInDay = Number(kpi.checkInDay);
        if (kpi.evaluationFlow?.length) {
          line.evaluationFlow = kpi.evaluationFlow.map(mapEvaluatorStepToApi);
        }
        return line;
      }),
    };

    if (input.existingWeights?.length) {
      body.existingWeights = Object.fromEntries(
        input.existingWeights.map((row) => [
          row.targetId,
          Number(row.weightPercentage),
        ]),
      );
    }

    const data = (await crudRequest({
      url: `${BSC_BASE}/employee-scorecards/${input.scorecardId}/kpis/individual`,
      method: 'POST',
      headers,
      data: body,
    })) as BscEmployeeScorecardApi;

    // Prefer a full detail reload for Shared/Individual grouping.
    try {
      return await getMyBscScorecardDetail(input.scorecardId);
    } catch {
      return mapEmployeeScorecardFromApi(data, {
        userName: currentUserDisplayName(),
      });
    }
  } catch (error) {
    throw toBscError(error, 'Failed to add individual KPIs');
  }
}

export async function removeIndividualBscKpi(
  scorecardId: string,
  kpiRowId: string,
): Promise<EmployeeScorecard> {
  try {
    const headers = await bscAuthHeaders();
    await crudRequest({
      url: `${BSC_BASE}/employee-scorecards/${scorecardId}/kpis/${kpiRowId}`,
      method: 'DELETE',
      headers,
    });

    try {
      return await getMyBscScorecardDetail(scorecardId);
    } catch {
      // Manager may add/remove but cannot read via my-scorecard — return minimal stub.
      return {
        id: scorecardId,
        userId: '',
        userName: '',
        managerId: '',
        cycleId: '',
        cycleLabel: '',
        status: ScorecardStatus.Active,
        targets: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    throw toBscError(error, 'Failed to remove individual KPI');
  }
}

export async function listMyBscCheckInQueue(): Promise<EmployeeScorecard[]> {
  try {
    const headers = await bscAuthHeaders();
    const data = await crudRequest({
      url: `${BSC_BASE}/check-ins/my-queue`,
      method: 'GET',
      headers,
      params: withAuthUserId(),
    });

    return mapCheckInQueueToScorecards(
      unwrapListPayload(data) as BscCheckInQueueRowApi[],
      {
        userNameByUserId: {
          [useAuthenticationStore.getState().userId]: currentUserDisplayName(),
        },
      },
    );
  } catch (error) {
    throw toBscError(error, 'Failed to load check-in queue');
  }
}

export async function listBscReviewCheckInQueue(): Promise<EmployeeScorecard[]> {
  try {
    const headers = await bscAuthHeaders();
    const data = await crudRequest({
      url: `${BSC_BASE}/check-ins/review-queue`,
      method: 'GET',
      headers,
      params: withAuthUserId(),
    });

    return mapCheckInQueueToScorecards(
      unwrapListPayload(data) as BscCheckInQueueRowApi[],
    );
  } catch (error) {
    throw toBscError(error, 'Failed to load review queue');
  }
}

/**
 * BE submit both saves actuals and advances to PendingEval
 * (FE historically split report + submitFinal).
 */
export async function submitBscCheckIn(
  employeeScorecardId: string,
  reports: ReportKpiInput[],
): Promise<EmployeeScorecard> {
  try {
    const headers = await bscAuthHeaders();
    const data = (await crudRequest({
      url: `${BSC_BASE}/check-ins/${employeeScorecardId}/submit`,
      method: 'POST',
      headers,
      params: withAuthUserId(),
      data: {
        reports: reports.map((r) => {
          const row: Record<string, unknown> = {
            employeeScorecardKpiId: r.targetId,
            actualValue: Number(r.actualValue),
          };
          if (r.dataSource !== undefined) {
            row.dataSource =
              r.dataSource == null || r.dataSource === ''
                ? null
                : String(r.dataSource).trim();
          }
          return row;
        }),
      },
    })) as BscEmployeeScorecardApi;

    try {
      return await getMyBscScorecardDetail(employeeScorecardId);
    } catch {
      return mapEmployeeScorecardFromApi(data, {
        userName: currentUserDisplayName(),
      });
    }
  } catch (error) {
    throw toBscError(error, 'Failed to submit check-in');
  }
}

export async function adjustBscCheckInKpis(
  employeeScorecardId: string,
  adjustments: AdjustReportedKpiInput[],
): Promise<EmployeeScorecard> {
  try {
    const headers = await bscAuthHeaders();
    for (const row of adjustments) {
      const body: Record<string, unknown> = {
        actualValue: Number(row.actualValue),
      };
      if (row.dataSource !== undefined) {
        body.dataSource =
          row.dataSource == null || row.dataSource === ''
            ? null
            : String(row.dataSource).trim();
      }
      await crudRequest({
        url: `${BSC_BASE}/check-ins/${employeeScorecardId}/kpis/${row.targetId}/adjust`,
        method: 'POST',
        headers,
        params: withAuthUserId(),
        data: body,
      });
    }

    try {
      return await getMyBscScorecardDetail(employeeScorecardId);
    } catch {
      return listBscReviewCheckInQueue().then(
        (cards) =>
          cards.find((c) => c.id === employeeScorecardId) || {
            id: employeeScorecardId,
            userId: '',
            userName: '',
            managerId: '',
            cycleId: '',
            cycleLabel: '',
            status: ScorecardStatus.PendingEval,
            targets: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
      );
    }
  } catch (error) {
    throw toBscError(error, 'Failed to adjust reported KPIs');
  }
}

export async function approveBscCheckInKpi(
  employeeScorecardId: string,
  kpiRowId: string,
): Promise<void> {
  try {
    const headers = await bscAuthHeaders();
    await crudRequest({
      url: `${BSC_BASE}/check-ins/${employeeScorecardId}/kpis/${kpiRowId}/approve`,
      method: 'POST',
      headers,
      params: withAuthUserId(),
    });
  } catch (error) {
    throw toBscError(error, 'Failed to approve KPI');
  }
}

export async function rejectBscCheckInKpi(
  employeeScorecardId: string,
  kpiRowId: string,
  reason: string,
): Promise<void> {
  try {
    const headers = await bscAuthHeaders();
    await crudRequest({
      url: `${BSC_BASE}/check-ins/${employeeScorecardId}/kpis/${kpiRowId}/reject`,
      method: 'POST',
      headers,
      params: withAuthUserId(),
      data: { reason: reason || 'Rejected' },
    });
  } catch (error) {
    throw toBscError(error, 'Failed to reject KPI');
  }
}

export async function finalizeBscCheckIn(
  employeeScorecardId: string,
): Promise<EmployeeScorecard> {
  try {
    const headers = await bscAuthHeaders();
    const data = (await crudRequest({
      url: `${BSC_BASE}/check-ins/${employeeScorecardId}/finalize`,
      method: 'POST',
      headers,
      params: withAuthUserId(),
    })) as BscEmployeeScorecardApi;

    try {
      return await getMyBscScorecardDetail(employeeScorecardId);
    } catch {
      return mapEmployeeScorecardFromApi(data);
    }
  } catch (error) {
    throw toBscError(error, 'Failed to finalize scorecard');
  }
}

function mapKpiImportRowToApi(row: KpiImportRowInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: row.name.trim(),
    perspective: row.perspective.trim(),
    measurementUnit: (row.measurementUnit || '%').trim(),
  };
  if (row.description != null && row.description !== '') {
    body.description = row.description;
  }
  if (row.weight != null) body.weight = Number(row.weight);
  if (row.defaultTarget != null) body.defaultTarget = Number(row.defaultTarget);
  if (row.targetLogic) {
    body.targetLogic = row.targetLogic;
    body.targetDirection = mapTargetLogicToApi(row.targetLogic);
  }
  if (row.cadence) body.cadence = mapCadenceToApi(row.cadence);
  return body;
}

export async function importBscKpis(
  rows: KpiImportRowInput[],
): Promise<KpiImportBatchResult> {
  try {
    const headers = await bscAuthHeaders();
    const data = (await crudRequest({
      url: `${BSC_BASE}/kpis/import`,
      method: 'POST',
      headers,
      data: { rows: rows.map(mapKpiImportRowToApi) },
    })) as { created?: BscKpiApi[]; errors?: Array<{ row: number; error?: string; input?: KpiImportRowInput }> };

    return {
      created: (data.created || []).map(mapKpiFromApi),
      errors: (data.errors || []).map((err) => ({
        row: err.row,
        error: err.error,
        input: err.input,
      })),
    };
  } catch (error) {
    throw toBscError(error, 'Failed to import KPIs');
  }
}

export async function listBscPepAuditRows(filters?: {
  managerId?: string;
  userId?: string;
}): Promise<PepAuditRow[]> {
  try {
    const headers = await bscAuthHeaders();
    const params: Record<string, string> = {};
    if (filters?.managerId) params.managerId = filters.managerId;
    if (filters?.userId) params.userId = filters.userId;

    const data = await crudRequest({
      url: `${BSC_BASE}/pep-audit`,
      method: 'GET',
      headers,
      params: Object.keys(params).length ? params : undefined,
    });

    const rows = Array.isArray(data)
      ? data
      : Array.isArray((data as { items?: unknown })?.items)
        ? ((data as { items: BscPepAuditRowApi[] }).items)
        : [];

    return rows.map((row) => mapPepAuditRowFromApi(row as BscPepAuditRowApi));
  } catch (error) {
    throw toBscError(error, 'Failed to load PEP audit rows');
  }
}

export async function approveBscPepAuditKpi(
  employeeScorecardId: string,
  kpiRowId: string,
): Promise<void> {
  try {
    const headers = await bscAuthHeaders();
    await crudRequest({
      url: `${BSC_BASE}/pep-audit/${employeeScorecardId}/kpis/${kpiRowId}/approve`,
      method: 'POST',
      headers,
      params: withAuthUserId(),
    });
  } catch (error) {
    throw toBscError(error, 'Failed to approve KPI for PEP audit');
  }
}

export async function markUnrealisticBscPepAuditKpi(
  employeeScorecardId: string,
  kpiRowId: string,
  reason: string,
): Promise<void> {
  try {
    const headers = await bscAuthHeaders();
    await crudRequest({
      url: `${BSC_BASE}/pep-audit/${employeeScorecardId}/kpis/${kpiRowId}/mark-unrealistic`,
      method: 'POST',
      headers,
      params: withAuthUserId(),
      data: { reason: reason || 'Unrealistic' },
    });
  } catch (error) {
    throw toBscError(error, 'Failed to return KPI for PEP audit');
  }
}

export async function rejectBscPepAuditKpi(
  employeeScorecardId: string,
  kpiRowId: string,
  reason: string,
): Promise<void> {
  try {
    const headers = await bscAuthHeaders();
    await crudRequest({
      url: `${BSC_BASE}/pep-audit/${employeeScorecardId}/kpis/${kpiRowId}/reject`,
      method: 'POST',
      headers,
      params: withAuthUserId(),
      data: { reason: reason || 'Rejected' },
    });
  } catch (error) {
    throw toBscError(error, 'Failed to reject KPI for PEP audit');
  }
}

export async function bulkApproveBscPepAuditKpis(
  items: Array<{ scorecardId: string; targetId: string }>,
): Promise<{
  approved: number;
  failed: Array<{ scorecardId: string; targetId: string; reason: string }>;
}> {
  try {
    const headers = await bscAuthHeaders();
    const data = (await crudRequest({
      url: `${BSC_BASE}/pep-audit/bulk-approve`,
      method: 'POST',
      headers,
      params: withAuthUserId(),
      data: {
        items: items.map((item) => ({
          employeeScorecardId: item.scorecardId,
          kpiRowId: item.targetId,
        })),
      },
    })) as {
      approved?: number;
      failed?: Array<{
        employeeScorecardId?: string;
        kpiRowId?: string;
        scorecardId?: string;
        targetId?: string;
        reason?: string;
      }>;
    };

    return {
      approved: Number(data.approved || 0),
      failed: (data.failed || []).map((row) => ({
        scorecardId: row.employeeScorecardId || row.scorecardId || '',
        targetId: row.kpiRowId || row.targetId || '',
        reason: row.reason || 'Failed',
      })),
    };
  } catch (error) {
    throw toBscError(error, 'Failed to bulk approve PEP audit KPIs');
  }
}
