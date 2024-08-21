import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useQuery } from 'react-query';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;

const fetchOffboardItems = async () => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useFetchOffboardItems = () => {
  return useQuery<any>('offboardItems', fetchOffboardItems);
};
