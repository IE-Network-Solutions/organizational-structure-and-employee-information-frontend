import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId ? tenantId : '179055e7-a27c-4d9d-9538-2b2a115661bd',
  Authorization: `Bearer ${token}`,
};

const fetchDynamicForms = async (formId: string) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/forms/public/${formId}`,
    method: 'GET',
    headers,
  });
};

export const useFetchDynamicForms = (formId: string) => {
  return useQuery(['dynamicForms', formId], () => fetchDynamicForms(formId));
};
