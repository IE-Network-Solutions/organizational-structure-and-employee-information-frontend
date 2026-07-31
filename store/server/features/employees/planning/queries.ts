import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useQuery, UseQueryOptions } from 'react-query';
import { OKR_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';

const tenantId = useAuthenticationStore.getState().tenantId;

const fetchObjectives = async (id: string) => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${OKR_URL}/objective/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

type FetchObjectivesQueryOptions = Pick<
  UseQueryOptions<any>,
  'refetchOnMount' | 'staleTime' | 'keepPreviousData' | 'refetchOnWindowFocus'
>;

export const useFetchObjectives = (
  id: string,
  queryOptions?: FetchObjectivesQueryOptions,
) =>
  useQuery<any>(['fetchObjectives', id], () => fetchObjectives(id), {
    enabled: !!id,
    ...queryOptions,
  });
