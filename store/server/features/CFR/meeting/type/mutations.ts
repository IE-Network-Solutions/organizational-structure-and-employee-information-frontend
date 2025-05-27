import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';

const createMeetingType = async (values: {
  name: string;
  description: string;
}) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-type`,
    method: 'post',
    data: values,
    headers,
  });
};

const deleteMeetingType = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-type/${id}`,
    method: 'DELETE',
    headers,
  });
};

const updateMeetingType = async (values: {
  id?: string;
  name: string;
  description: string;
}) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-type/${values?.id}`,
    method: 'patch',
    data: values,
    headers,
  });
};
export const useCreateMeetingType = () => {
  const queryClient = useQueryClient();
  return useMutation(createMeetingType, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-types');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};

export const useUpdateMeetingType = () => {
  const queryClient = useQueryClient();
  return useMutation(updateMeetingType, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-types');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
export const useDeleteMeetingType = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteMeetingType, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-types');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};