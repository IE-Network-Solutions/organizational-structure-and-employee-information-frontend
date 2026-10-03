import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { useQuery, UseQueryOptions } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { crudRequest } from '@/utils/crudRequest';
import {
  EffectiveWeightsResponse,
  GetAssignmentsFilter,
  OkrObjectiveTypeWeightAssignment,
} from './interface';

export * from './interface';

export const getEffectiveObjectiveTypeWeights = async (
  userId: string,
): Promise<EffectiveWeightsResponse> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const response = (await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/okr-objective-type-weights/effective?userId=${encodeURIComponent(userId)}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  })) as EffectiveWeightsResponse;

  return response;
};

export const getObjectiveTypeWeightAssignments = async (
  filter?: GetAssignmentsFilter,
): Promise<OkrObjectiveTypeWeightAssignment[]> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const queryParams = new URLSearchParams();
  if (filter?.scopeType) {
    queryParams.append('scopeType', filter.scopeType);
  }
  if (filter?.scopeId !== undefined && filter?.scopeId !== null) {
    queryParams.append('scopeId', filter.scopeId);
  }
  const queryString = queryParams.toString()
    ? `?${queryParams.toString()}`
    : '';

  const response = (await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/okr-objective-type-weights${queryString}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  })) as OkrObjectiveTypeWeightAssignment[];

  return response;
};

export const useGetEffectiveObjectiveTypeWeights = (
  userId?: string,
  options?: UseQueryOptions<EffectiveWeightsResponse>,
) => {
  return useQuery<EffectiveWeightsResponse>(
    ['effectiveObjectiveTypeWeights', userId],
    () => getEffectiveObjectiveTypeWeights(userId as string),
    {
      enabled: Boolean(userId),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60_000,
      ...options,
    },
  );
};

export const useGetObjectiveTypeWeightAssignments = (
  filter?: GetAssignmentsFilter,
  options?: UseQueryOptions<OkrObjectiveTypeWeightAssignment[]>,
) => {
  return useQuery<OkrObjectiveTypeWeightAssignment[]>(
    ['objectiveTypeWeightAssignments', filter?.scopeType, filter?.scopeId],
    () => getObjectiveTypeWeightAssignments(filter),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60_000,
      ...options,
    },
  );
};
