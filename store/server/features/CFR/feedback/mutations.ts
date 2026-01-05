import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';

const createPerspective = async (values: {
  name: string;
  departmentId: string;
  description: string;
}) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/perspectives`,
    method: 'post',
    data: values,
    headers,
  });
};

const deletePerspective = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/perspectives/${id}`,
    method: 'DELETE',
    headers,
  });
};

const updatePerspective = async (values: {
  id?: string;
  name: string;
  departmentId: string;
  description: string;
}) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/perspectives/${values?.id}`,
    method: 'patch',
    data: values,
    headers,
  });
};
export const useCreatePerspective = () => {
  const queryClient = useQueryClient();
  return useMutation(createPerspective, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('perspectives');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};

export const useUpdatePerspective = () => {
  const queryClient = useQueryClient();
  return useMutation(updatePerspective, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('perspectives');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
export const useDeletePerspective = () => {
  const queryClient = useQueryClient();
  return useMutation(deletePerspective, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('perspectives');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
