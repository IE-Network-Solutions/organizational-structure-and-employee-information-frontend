import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};

const fetchDynamicForms = async () => {
  return await crudRequest({
    url: 'https://mocki.io/v1/51dcdb2a-999f-4ceb-b7e0-cc62964f4685',
    // url: `${ORG_AND_EMP_URL}/questions`,
    method: 'GET',
    headers,
  });
};

export const useFetchDynamicForms = () => {
  return useQuery('dynamicForms', fetchDynamicForms);
};
