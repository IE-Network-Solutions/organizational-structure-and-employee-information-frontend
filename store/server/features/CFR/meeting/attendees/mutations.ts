import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';
const createMeetingAttendeesBulk = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/attendees/bulk`,
    method: 'post',
    data: values,
    headers,
  });
};
export const useCreateMeetingAttendeesBulk = () => {
  const queryClient = useQueryClient();
  return useMutation(createMeetingAttendeesBulk, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-attendees');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
const updateMeetingAttendees = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/attendees/${values?.id}`,
    method: 'patch',
    data: values,
    headers,
  });
};
export const useUpdateMeetingAttendees = () => {
  const queryClient = useQueryClient();
  return useMutation(updateMeetingAttendees, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-attendees');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
const deleteMeetingAttendees = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/attendees/${id}`,
    method: 'DELETE',
    headers,
  });
};
export const useDeleteMeetingAttendees = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteMeetingAttendees, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meeting-attendees');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};