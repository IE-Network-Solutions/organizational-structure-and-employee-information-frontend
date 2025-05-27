import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';
const createMeetingAgenda = async (values: {
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
    url: `${ORG_DEV_URL}/meeting-agenda`,
    method: 'post',
    data: values,
    headers,
  });
};
const createMeetingAgendaBulk = async (values: {
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
    url: `${ORG_DEV_URL}/meeting-agenda/bulk`,
    method: 'post',
    data: values,
    headers,
  });
};

const deleteMeetingAgenda = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-agenda/${id}`,
    method: 'DELETE',
    headers,
  });
};

const updateMeetingAgenda = async (values: { id?: string; name: string }) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-agenda/${values?.id}`,
    method: 'patch',
    data: values,
    headers,
  });
};

export const useCreateMeetingAgenda = () => {
  const queryClient = useQueryClient();
  return useMutation(createMeetingAgenda, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-agenda');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
export const useCreateMeetingAgendaBulk = () => {
  const queryClient = useQueryClient();
  return useMutation(createMeetingAgendaBulk, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries(['meeting-agenda']);
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};

export const useUpdateMeetingAgenda = () => {
  const queryClient = useQueryClient();
  return useMutation(updateMeetingAgenda, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-agenda');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
export const useDeleteMeetingAgenda = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteMeetingAgenda, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-agenda');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};