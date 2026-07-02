import { useQuery, useQueries } from 'react-query';
import { useMemo } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';

const getCriteriaTargets = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_AND_PLANNING_URL}/vp-criteria`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetCriteriaTargets = () =>
  useQuery('criteriaTarget', getCriteriaTargets);

const fetchVpScoring = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_AND_PLANNING_URL}/vp-scoring`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useFetchVpScoring = () =>
  useQuery('VpScoringInformation', fetchVpScoring, {
    keepPreviousData: true,
  });

const fetchVpScoringById = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_AND_PLANNING_URL}/vp-scoring/${id}`, // Added the ID to the URL
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export { fetchVpScoringById };
export const useFetchVpScoringById = (id: string) =>
  useQuery(['VpScoringInformation', id], () => fetchVpScoringById(id), {
    enabled: !!id,
  });

export type VpScoringUserAssignment = {
  vpScoringId: string;
  vpScoringName: string;
};

/** Map userId → VP scoring config they are assigned to (all configurations). */
export function buildVpScoringAssignedUsersMap(
  configs: Array<{
    id?: string;
    name?: string;
    userVpScoring?: Array<{ userId?: string }>;
  }>,
): Map<string, VpScoringUserAssignment> {
  const map = new Map<string, VpScoringUserAssignment>();
  for (const config of configs) {
    if (!config?.id) continue;
    for (const assignment of config.userVpScoring ?? []) {
      if (!assignment?.userId) continue;
      map.set(String(assignment.userId), {
        vpScoringId: String(config.id),
        vpScoringName: config.name?.trim() || 'Unknown configuration',
      });
    }
  }
  return map;
}

/**
 * Loads all VP scoring user assignments for duplicate-assignment prevention.
 * Fetches per-config details when the list endpoint omits userVpScoring.
 */
export function useVpScoringAssignedUsers(enabled: boolean) {
  const { data: listData, isLoading: listLoading } = useFetchVpScoring();
  const items = listData?.items ?? [];
  const listIncludesUsers =
    items.length === 0 ||
    items.every((item: { userVpScoring?: unknown }) =>
      Array.isArray(item.userVpScoring),
    );

  const idsNeedingFetch = useMemo(
    () =>
      listIncludesUsers
        ? []
        : items
            .map((item: { id?: string }) => item.id)
            .filter((id): id is string => Boolean(id)),
    [items, listIncludesUsers],
  );

  const detailQueries = useQueries(
    idsNeedingFetch.map((id) => ({
      queryKey: ['VpScoringInformation', id],
      queryFn: () => fetchVpScoringById(id),
      enabled: enabled && idsNeedingFetch.length > 0,
      staleTime: 60_000,
    })),
  );

  const configs = useMemo(() => {
    if (listIncludesUsers) return items;
    return detailQueries.map((query) => query.data).filter(Boolean);
  }, [items, listIncludesUsers, detailQueries]);

  const assignedMap = useMemo(
    () => buildVpScoringAssignedUsersMap(configs),
    [configs],
  );

  const detailsLoading =
    enabled && idsNeedingFetch.length > 0 && detailQueries.some((q) => q.isLoading);

  return {
    assignedMap,
    isLoading: listLoading || detailsLoading,
  };
}
