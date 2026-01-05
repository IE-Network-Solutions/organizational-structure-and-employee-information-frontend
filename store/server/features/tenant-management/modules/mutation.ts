import { crudRequest } from '@/utils/crudRequest';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { Module } from '@/types/tenant-management';

const setModules = async (items: Partial<Module>[]) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/modules`,
    method: 'PUT',
    headers: requestHeaders,
    data: { items },
  });
};

const deleteModules = async (id: string[]) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/subscription/rest/modules`,
    method: 'DELETE',
    headers: requestHeaders,
    data: { id },
  });
};

export const useSetModules = () => {
  const queryClient = useQueryClient();
  return useMutation(setModules, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('modules');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteModules = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteModules, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('modules');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
