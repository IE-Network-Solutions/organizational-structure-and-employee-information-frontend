import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import {
  DEFAULT_GROWTH_PLAN_CONFIG,
  GrowthPlan,
  GrowthPlanCategory,
  GrowthPlanConfig,
  GrowthPlanProgress,
  GrowthPlanTeamMemberProgress,
} from '@/types/tna/growthPlan';
import { GROWTH_PLAN_TAXONOMY_SEED } from '@/store/server/features/tna/growthPlan/taxonomySeed';
import { GrowthPlanListParams } from '@/store/server/features/tna/growthPlan/interface';
import {
  USE_GROWTH_PLAN_MOCK,
  mockGetConfig,
  mockGetMyProgress,
  mockGetPendingApprovals,
  mockGetPlanById,
  mockGetPlans,
  mockGetTaxonomy,
  mockGetTeamProgress,
} from '@/store/server/features/tna/growthPlan/mockStore';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const getGrowthPlanConfig = async (): Promise<GrowthPlanConfig> => {
  if (USE_GROWTH_PLAN_MOCK) return mockGetConfig();
  try {
    const requestHeaders = await requestHeader();
    const data = await crudRequest({
      url: `${TNA_URL}/growth-plan/config`,
      method: 'GET',
      headers: requestHeaders,
    });
    return {
      ...DEFAULT_GROWTH_PLAN_CONFIG,
      ...(data ?? {}),
    };
  } catch {
    return DEFAULT_GROWTH_PLAN_CONFIG;
  }
};

const getGrowthPlanTaxonomy = async (): Promise<GrowthPlanCategory[]> => {
  if (USE_GROWTH_PLAN_MOCK) return mockGetTaxonomy();
  try {
    const requestHeaders = await requestHeader();
    const data = await crudRequest({
      url: `${TNA_URL}/growth-plan/taxonomy`,
      method: 'GET',
      headers: requestHeaders,
    });
    if (Array.isArray(data) && data.length > 0) return data;
    if (Array.isArray(data?.items) && data.items.length > 0) return data.items;
    return GROWTH_PLAN_TAXONOMY_SEED;
  } catch {
    return GROWTH_PLAN_TAXONOMY_SEED;
  }
};

const getGrowthPlans = async (
  params: GrowthPlanListParams = {},
): Promise<GrowthPlan[]> => {
  if (USE_GROWTH_PLAN_MOCK) return mockGetPlans(params);
  try {
    const requestHeaders = await requestHeader();
    const data = await crudRequest({
      url: `${TNA_URL}/growth-plan`,
      method: 'GET',
      headers: requestHeaders,
      params,
    });
    if (Array.isArray(data)) return data;
    return data?.items ?? [];
  } catch {
    return [];
  }
};

const getGrowthPlanById = async (id: string): Promise<GrowthPlan | null> => {
  if (!id) return null;
  if (USE_GROWTH_PLAN_MOCK) return mockGetPlanById(id);
  try {
    const requestHeaders = await requestHeader();
    return await crudRequest({
      url: `${TNA_URL}/growth-plan/${id}`,
      method: 'GET',
      headers: requestHeaders,
    });
  } catch {
    return null;
  }
};

const getPendingApprovals = async (): Promise<GrowthPlan[]> => {
  if (USE_GROWTH_PLAN_MOCK) return mockGetPendingApprovals();
  try {
    const requestHeaders = await requestHeader();
    const data = await crudRequest({
      url: `${TNA_URL}/growth-plan/pending-approvals`,
      method: 'GET',
      headers: requestHeaders,
    });
    if (Array.isArray(data)) return data;
    return data?.items ?? [];
  } catch {
    return [];
  }
};

const getMyProgress = async (
  fiscalYearId?: string,
  userId?: string,
): Promise<GrowthPlanProgress | null> => {
  if (USE_GROWTH_PLAN_MOCK) return mockGetMyProgress(userId);
  try {
    const requestHeaders = await requestHeader();
    return await crudRequest({
      url: `${TNA_URL}/growth-plan/my-progress`,
      method: 'GET',
      headers: requestHeaders,
      params: fiscalYearId ? { fiscalYearId } : undefined,
    });
  } catch {
    return null;
  }
};

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
) =>
  useQuery(['growth-plans', params], () => getGrowthPlans(params), {
    enabled,
    keepPreviousData: true,
  });

export const useGetGrowthPlanById = (id: string, enabled = true) =>
  useQuery(['growth-plan-detail', id], () => getGrowthPlanById(id), {
    enabled: enabled && !!id,
  });

export const useGetPendingGrowthPlanApprovals = (enabled = true) =>
  useQuery(['growth-plan-pending-approvals'], getPendingApprovals, {
    enabled,
    keepPreviousData: true,
  });

export const useGetMyGrowthProgress = (
  fiscalYearId?: string,
  enabled = true,
) => {
  const userId = useAuthenticationStore((s) => s.userId);
  return useQuery(
    ['growth-plan-my-progress', fiscalYearId, userId],
    () => getMyProgress(fiscalYearId, userId ?? undefined),
    { enabled, keepPreviousData: true },
  );
};

const getTeamProgress = async (): Promise<GrowthPlanTeamMemberProgress[]> => {
  if (USE_GROWTH_PLAN_MOCK) return mockGetTeamProgress();
  try {
    const requestHeaders = await requestHeader();
    const data = await crudRequest({
      url: `${TNA_URL}/growth-plan/team-progress`,
      method: 'GET',
      headers: requestHeaders,
    });
    return Array.isArray(data) ? data : (data?.items ?? []);
  } catch {
    return [];
  }
};

export const useGetTeamGrowthProgress = (enabled = true) =>
  useQuery(['growth-plan-team-progress'], getTeamProgress, {
    enabled,
    keepPreviousData: true,
  });
