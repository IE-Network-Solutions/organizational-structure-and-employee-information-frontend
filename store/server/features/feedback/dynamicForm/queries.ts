import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_BASE_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQuery, useQueryClient } from 'react-query';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId ? tenantId : '179055e7-a27c-4d9d-9538-2b2a115661bd',
  Authorization: `Bearer ${token}`,
};

const fetchDynamicForms = async () => {
  return await crudRequest({
    url: `${ORG_DEV_BASE_URL}/questions`,
    method: 'GET',
    headers,
  });
};

const fetchPublicForms = async (id: string) => {
  return await crudRequest({
    url: `${ORG_DEV_BASE_URL}/forms/public/${id}`,
    method: 'GET',
    headers,
  });
};

export const useFetchDynamicForms = () => {
  return useQuery('dynamicForms', fetchDynamicForms);
};

export const useFetchPublicForms = (empId: string) =>
  useQuery<any>('publicForms', () => fetchPublicForms(empId));
