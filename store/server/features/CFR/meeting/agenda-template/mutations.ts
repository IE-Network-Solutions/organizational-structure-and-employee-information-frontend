import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';
const createMeetingAgendaTemplate = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-agenda-templates`,
    method: 'post',
    data: values,
    headers,
  });
};

const deleteMeetingAgendaTemplate = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-agenda-templates/${id}`,
    method: 'DELETE',
    headers,
  });
};

const updateMeetingAgendaTemplate = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-agenda-templates/${values?.id}`,
    method: 'patch',
    data: values,
    headers,
  });
};
export const useCreateMeetingAgendaTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(createMeetingAgendaTemplate, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-agenda-template');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};

export const useUpdateMeetingAgendaTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(updateMeetingAgendaTemplate, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-agenda-template');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
export const useDeleteMeetingAgendaTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteMeetingAgendaTemplate, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-agenda-template');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
