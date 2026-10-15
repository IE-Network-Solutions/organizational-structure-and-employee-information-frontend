import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { useQuery, UseQueryOptions } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { crudRequest } from '@/utils/crudRequest';
import { OkrObjectiveType } from './interface';

export * from './interface';

export const getOkrObjectiveTypes = async (
  activeOnly?: boolean,
): Promise<OkrObjectiveType[]> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const queryParam =
    activeOnly !== undefined ? `?activeOnly=${activeOnly}` : '';

  const response = (await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/okr-objective-types${queryParam}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  })) as OkrObjectiveType[];

  return response;
};

export const getOkrObjectiveTypeById = async (
  id: string,
): Promise<OkrObjectiveType> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const response = (await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/okr-objective-types/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  })) as OkrObjectiveType;

  return response;
};

export const useGetOkrObjectiveTypes = (
  params?: { activeOnly?: boolean },
  options?: UseQueryOptions<OkrObjectiveType[]>,
) => {
  return useQuery<OkrObjectiveType[]>(
    ['okrObjectiveTypes', params?.activeOnly],
    () => getOkrObjectiveTypes(params?.activeOnly),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60_000,
      ...options,
    },
  );
};

export const useGetOkrObjectiveTypeById = (
  id: string,
  options?: UseQueryOptions<OkrObjectiveType>,
) => {
  return useQuery<OkrObjectiveType>(
    ['okrObjectiveType', id],
    () => getOkrObjectiveTypeById(id),
    {
      enabled: Boolean(id),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60_000,
      ...options,
    },
  );
};
