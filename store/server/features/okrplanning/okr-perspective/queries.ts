import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { useQuery, UseQueryOptions } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { crudRequest } from '@/utils/crudRequest';
import { OkrPerspective } from './interface';

export * from './interface';

export const getOkrPerspectives = async (
  search?: string,
): Promise<OkrPerspective[]> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const queryParam = search ? `?search=${encodeURIComponent(search)}` : '';

  const response = (await crudRequest({
    url: `${OKR_AND_PLANNING_URL}/okr-perspectives${queryParam}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  })) as OkrPerspective[];

  return response;
};

export const useGetOkrPerspectives = (
  search?: string,
  options?: UseQueryOptions<OkrPerspective[]>,
) => {
  return useQuery<OkrPerspective[]>(
    ['okrPerspectives', search],
    () => getOkrPerspectives(search),
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60_000,
      ...options,
    },
  );
};
