import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useQuery } from 'react-query';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;

const fetchOffboardItems = async () => {
  return crudRequest({
    url: 'https://mocki.io/v1/83642422-0148-4378-9213-ff7625c1157d',
    // url: `${ORG_AND_EMP_URL}/`,
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
