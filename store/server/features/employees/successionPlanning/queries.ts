import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import type { CriticalRole } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/criticalRoleModal';
import { mapCriticalRole, type RoleMapContext } from './mappers';
import type {
  ApiCriticalRole,
  ApiCriticalRoleKpis,
  ApiCriticalRoleSuccessor,
  ApiDevelopmentPlan,
  ApiEvaluatorAssignmentRow,
  ApiEvaluatorKpis,
  ApiFieldOfStudy,
  ApiIdpActivityType,
  ApiSuccessorAssessment,
  ApiSuccessorGap,
} from './types';

/** Shared react-query key namespace for every succession-planning read. */
export const SUCCESSION_KEYS = {
  roles: 'succession-critical-roles',
  role: 'succession-critical-role',
  successor: 'succession-successor',
  assessment: 'succession-successor-assessment',
  gaps: 'succession-successor-gaps',
  developmentPlan: 'succession-development-plan',
  evaluatorAssignments: 'succession-evaluator-assignments',
  roleKpis: 'succession-role-kpis',
  evaluatorKpis: 'succession-evaluator-kpis',
  fieldsOfStudy: 'succession-fields-of-study',
  activityTypes: 'succession-idp-activity-types',
  reports: 'succession-reports',
} as const;

const authHeaders = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return {
    Authorization: `Bearer ${token}`,
    tenantId,
  };
};

const get = async <T>(path: string, params?: Record<string, any>): Promise<T> =>
  crudRequest({
    url: `${ORG_AND_EMP_URL}/succession-planning${path}`,
    method: 'GET',
    headers: await authHeaders(),
    params,
  });

// ── Critical roles ──────────────────────────────────────────────────────────

/**
 * Every critical role with competencies, successors, gaps and IDPs attached.
 *
 * Returns the raw API shape. Mapping happens in `useSuccessionPlanningData`,
 * where the positions catalog is also available — doing it inside the query
 * would capture a stale catalog, leaving departments blank whenever positions
 * resolve after roles.
 */
export const useCriticalRoles = () =>
  useQuery<ApiCriticalRole[], Error>(
    SUCCESSION_KEYS.roles,
    async () => get<ApiCriticalRole[]>('/critical-roles'),
    { keepPreviousData: true },
  );

export const useCriticalRole = (id?: string, context?: RoleMapContext) =>
  useQuery<CriticalRole | null, Error>(
    [SUCCESSION_KEYS.role, id],
    async () => {
      if (!id) return null;
      return mapCriticalRole(
        await get<ApiCriticalRole>(`/critical-roles/${id}`),
        context,
      );
    },
    { enabled: Boolean(id) },
  );

// ── Successors ──────────────────────────────────────────────────────────────

export const useSuccessor = (id?: string) =>
  useQuery<ApiCriticalRoleSuccessor | null, Error>(
    [SUCCESSION_KEYS.successor, id],
    async () => {
      if (!id) return null;
      return get<ApiCriticalRoleSuccessor>(`/successors/${id}`);
    },
    { enabled: Boolean(id) },
  );

/** Position / education / experience match plus the weighted score so far. */
export const useSuccessorAssessment = (id?: string) =>
  useQuery<ApiSuccessorAssessment | null, Error>(
    [SUCCESSION_KEYS.assessment, id],
    async () => {
      if (!id) return null;
      return get<ApiSuccessorAssessment>(`/successors/${id}/assessment`);
    },
    { enabled: Boolean(id) },
  );

export const useSuccessorGaps = (id?: string) =>
  useQuery<ApiSuccessorGap[], Error>(
    [SUCCESSION_KEYS.gaps, id],
    async () => {
      if (!id) return [];
      return get<ApiSuccessorGap[]>(`/successors/${id}/gaps`);
    },
    { enabled: Boolean(id) },
  );

export const useSuccessorDevelopmentPlan = (id?: string) =>
  useQuery<ApiDevelopmentPlan | null, Error>(
    [SUCCESSION_KEYS.developmentPlan, id],
    async () => {
      if (!id) return null;
      return get<ApiDevelopmentPlan>(`/successors/${id}/development-plan`);
    },
    { enabled: Boolean(id) },
  );

// ── Evaluators ──────────────────────────────────────────────────────────────

/**
 * Evaluator assignments.
 *
 * `scope: 'mine'` hits the session-scoped endpoint, so a user without the
 * tenant-wide permission cannot read another evaluator's queue by passing an
 * id. `scope: 'admin'` returns everything, optionally narrowed to one
 * evaluator for an admin inspecting a single person.
 */
export const useEvaluatorAssignments = (
  scope: 'admin' | 'mine' = 'admin',
  evaluatorId?: string,
) =>
  useQuery<ApiEvaluatorAssignmentRow[], Error>(
    [SUCCESSION_KEYS.evaluatorAssignments, scope, evaluatorId ?? 'all'],
    async () =>
      scope === 'mine'
        ? get<ApiEvaluatorAssignmentRow[]>('/evaluator-assignments/mine')
        : get<ApiEvaluatorAssignmentRow[]>(
            '/evaluator-assignments',
            evaluatorId ? { evaluatorId } : undefined,
          ),
  );

// ── KPIs ────────────────────────────────────────────────────────────────────

export const useCriticalRoleKpis = () =>
  useQuery<ApiCriticalRoleKpis, Error>(SUCCESSION_KEYS.roleKpis, async () =>
    get<ApiCriticalRoleKpis>('/kpis/critical-roles'),
  );

export const useEvaluatorKpis = (evaluatorId?: string) =>
  useQuery<ApiEvaluatorKpis, Error>(
    [SUCCESSION_KEYS.evaluatorKpis, evaluatorId ?? 'all'],
    async () =>
      get<ApiEvaluatorKpis>(
        '/kpis/evaluators',
        evaluatorId ? { evaluatorId } : undefined,
      ),
  );

// ── Catalogs ────────────────────────────────────────────────────────────────

export const useFieldsOfStudy = () =>
  useQuery<ApiFieldOfStudy[], Error>(
    SUCCESSION_KEYS.fieldsOfStudy,
    async () => get<ApiFieldOfStudy[]>('/fields-of-study'),
    { staleTime: 5 * 60 * 1000 },
  );

export const useIdpActivityTypes = () =>
  useQuery<ApiIdpActivityType[], Error>(
    SUCCESSION_KEYS.activityTypes,
    async () => get<ApiIdpActivityType[]>('/idp-activity-types'),
    { staleTime: 5 * 60 * 1000 },
  );

// ── Reports ─────────────────────────────────────────────────────────────────

export type SuccessionReportKind = 'readiness' | 'gaps' | 'development-plans';

/** Rows are shaped server-side so the table and the Excel export agree. */
export const useSuccessionReport = <T = Record<string, unknown>>(
  kind: SuccessionReportKind,
  enabled = true,
) =>
  useQuery<T[], Error>(
    [SUCCESSION_KEYS.reports, kind],
    async () => get<T[]>(`/reports/${kind}`),
    { enabled },
  );
