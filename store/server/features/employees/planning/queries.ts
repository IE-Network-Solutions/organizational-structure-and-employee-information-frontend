import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useQuery } from 'react-query';
import { OKR_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';

const token = await getCurrentToken();
const tenantId = useAuthenticationStore.getState().tenantId;

const fetchObjectives = async (id: string) => {
  return crudRequest({
    url: `${OKR_URL}/objective/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useFetchObjectives = (id: string) =>
  useQuery<any>(['fetchObjectives', id], () => fetchObjectives(id));
