import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import {
  DEFAULT_GROWTH_PLAN_CONFIG,
  GrowthPlan,
  GrowthPlanCategory,
  GrowthPlanConfig,
  GrowthPlanTeamMemberProgress,
} from '@/types/tna/growthPlan';
import { GrowthPlanListParams } from '@/store/server/features/tna/growthPlan/interface';
import {
  ApiCategory,
  ApiLimits,
  ApiPlan,
  ApiSkill,
  ApiWorkspace,
  GrowthPlanNameLookup,
  toCategory,
  toConfig,
  toPlan,
  toWorkspace,
  unwrapItem,
  unwrapItems,
} from '@/store/server/features/tna/growthPlan/adapters';
import {
  useGetActiveFiscalYears,
  useGetAllFiscalYears,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { FiscalYear } from '@/store/server/features/organizationStructure/fiscalYear/interface';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

/** Large enough to load a tenant's whole catalogue / own plans in one page. */
const ALL = { page: 1, limit: 500 };

// ---------------------------------------------------------------------------
// Name lookups (fiscal years and quarters live in the org service)
// ---------------------------------------------------------------------------

export const useGrowthPlanNameLookup = (): GrowthPlanNameLookup => {
  const { data: fiscalYears } = useGetAllFiscalYears(50, 1);
  const { data: activeFy } = useGetActiveFiscalYears();

  return useMemo(() => {
    const years = new Map<string, string>();
    const quarters = new Map<string, string>();

    const add = (fy?: FiscalYear | null) => {
      if (!fy?.id) return;
      years.set(fy.id, fy.name);
      (fy.sessions ?? []).forEach((session, index) => {
        if (session?.id) {
          quarters.set(session.id, session.name || `Q${index + 1}`);
        }
      });
    };

    (fiscalYears?.items ?? []).forEach(add);
    add(activeFy);

    return {
      fiscalYearName: (id) => (id ? years.get(id) : undefined),
      quarterLabel: (id) => (id ? quarters.get(id) : undefined),
    };
  }, [fiscalYears, activeFy]);
};

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

const getGrowthPlanConfig = async (): Promise<GrowthPlanConfig> => {
  try {
    const requestHeaders = await requestHeader();
    const data = await crudRequest({
      url: `${TNA_URL}/growth-plan-setting`,
      method: 'GET',
      headers: requestHeaders,
    });
    return toConfig(unwrapItem<ApiLimits>(data));
  } catch {
    return DEFAULT_GROWTH_PLAN_CONFIG;
  }
};

/**
 * Every category with its skills and recommended learning. The wizard keeps
 * only selectable ones (`isMapped`); Skill Settings shows them all.
 */
const getGrowthPlanTaxonomy = async (): Promise<GrowthPlanCategory[]> => {
  const requestHeaders = await requestHeader();
  const [categoryData, skillData] = await Promise.all([
    crudRequest({
      url: `${TNA_URL}/growth-skill-category`,
      method: 'POST',
      headers: requestHeaders,
      params: { ...ALL, orderBy: 'name', orderDirection: 'ASC' },
      data: {},
    }),
    crudRequest({
      url: `${TNA_URL}/growth-skill`,
      method: 'POST',
      headers: requestHeaders,
      params: { page: 1, limit: 2000, orderBy: 'order', orderDirection: 'ASC' },
      data: {},
    }),
  ]);

  const skills = unwrapItems<ApiSkill>(skillData);
  return unwrapItems<ApiCategory>(categoryData).map((category) =>
    toCategory(category, skills),
  );
};

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

/** The caller's own plans (owner comes from the request's userId header). */
const getMyGrowthPlans = async (
  params: GrowthPlanListParams = {},
): Promise<ApiPlan[]> => {
  const requestHeaders = await requestHeader();
  const data = await crudRequest({
    url: `${TNA_URL}/growth-plan/my`,
    method: 'POST',
    headers: requestHeaders,
    params: ALL,
    data: {
      filter: {
        ...(params.fiscalYearId ? { fiscalYearId: [params.fiscalYearId] } : {}),
        ...(params.status ? { status: [params.status] } : {}),
      },
    },
  });
  return unwrapItems<ApiPlan>(data);
};

const getGrowthPlanById = async (id: string): Promise<ApiPlan | null> => {
  if (!id) return null;
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan/${id}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getGrowthPlanSkill = async (goalId: string): Promise<ApiWorkspace> => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${TNA_URL}/growth-plan-skill/${goalId}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

const getTeamPlans = async (): Promise<ApiPlan[]> => {
  const requestHeaders = await requestHeader();
  const data = await crudRequest({
    url: `${TNA_URL}/growth-plan-team`,
    method: 'POST',
    headers: requestHeaders,
    params: ALL,
    data: {},
  });
  return unwrapItems<ApiPlan>(data);
};

const fullName = (user: any): string =>
  [user?.firstName, user?.middleName, user?.lastName]
    .filter(Boolean)
    .join(' ') ||
  user?.email ||
  '';

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export const useGetGrowthPlanConfig = (enabled = true) =>
  useQuery(['growth-plan-config'], getGrowthPlanConfig, {
    enabled,
    keepPreviousData: true,
  });

export const useGetGrowthPlanTaxonomy = (enabled = true) =>
  useQuery(['growth-plan-taxonomy'], getGrowthPlanTaxonomy, {
    enabled,
    keepPreviousData: true,
  });

export const useGetGrowthPlans = (
  params: GrowthPlanListParams = {},
  enabled = true,
) => {
  const lookup = useGrowthPlanNameLookup();
  const query = useQuery(
    ['growth-plans', params],
    () => getMyGrowthPlans(params),
    { enabled, keepPreviousData: true },
  );
  const data = useMemo<GrowthPlan[] | undefined>(
    () => query.data?.map((plan) => toPlan(plan, lookup)),
    [query.data, lookup],
  );
  return { ...query, data };
};

export const useGetGrowthPlanById = (id: string, enabled = true) => {
  const lookup = useGrowthPlanNameLookup();
  const query = useQuery(
    ['growth-plan-detail', id],
    () => getGrowthPlanById(id),
    { enabled: enabled && !!id },
  );
  const data = useMemo<GrowthPlan | null | undefined>(
    () => (query.data ? toPlan(query.data, lookup) : query.data),
    [query.data, lookup],
  );
  return { ...query, data };
};

/** Skill page: the goal with its checklist, notes, materials and learning. */
export const useGetGrowthPlanSkill = (goalId: string, enabled = true) => {
  const lookup = useGrowthPlanNameLookup();
  const query = useQuery(
    ['growth-plan-skill', goalId],
    () => getGrowthPlanSkill(goalId),
    { enabled: enabled && !!goalId },
  );
  const data = useMemo(
    () => (query.data ? toWorkspace(query.data, lookup) : undefined),
    [query.data, lookup],
  );
  return { ...query, data };
};

export const useGetTeamGrowthProgress = (enabled = true) => {
  const { data: usersData } = useGetAllUsers();
  const query = useQuery(['growth-plan-team-progress'], getTeamPlans, {
    enabled,
    keepPreviousData: true,
  });

  const data = useMemo<GrowthPlanTeamMemberProgress[] | undefined>(() => {
    if (!query.data) return undefined;

    const names = new Map<string, string>();
    for (const user of usersData?.items ?? []) {
      if (user?.id) names.set(user.id, fullName(user));
    }
    const now = Date.now();

    return query.data.map((plan) => {
      const skills = plan.planSkills ?? [];
      return {
        userId: plan.userId,
        userName: names.get(plan.userId) || 'Team member',
        planId: plan.id,
        categoryName: plan.category?.name,
        status: plan.status,
        completedGoals: plan.completedSkills,
        totalGoals: plan.totalSkills,
        percent: Math.round(Number(plan.progressPercent) || 0),
        overdueGoals: skills.filter(
          (skill) =>
            skill.status !== 'completed' &&
            new Date(skill.deadline).getTime() < now,
        ).length,
      };
    });
  }, [query.data, usersData]);

  return { ...query, data };
};
