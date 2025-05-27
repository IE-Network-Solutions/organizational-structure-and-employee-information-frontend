import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';
//meetings
const createMeetings = async (values: {
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
    url: `${ORG_DEV_URL}/meetings`,
    method: 'post',
    data: values,
    headers,
  });
};

const deleteMeetings = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meetings/${id}`,
    method: 'DELETE',
    headers,
  });
};

const updateMeetings = async (values: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meetings/${values?.id}`,
    method: 'patch',
    data: values,
    headers,
  });
};
const updateMeetingAttachment = async (values: FormData | any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const isFormData = values instanceof FormData;

  const headers: Record<string, string> = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  if (isFormData) {
    // Let the browser set the correct multipart/form-data boundary
    // Do NOT set Content-Type manually here
  } else {
    headers['Content-Type'] = 'application/json';
  }

  return await crudRequest({
    url: `${ORG_DEV_URL}/meetings/${isFormData ? values.get('meetingId') : values?.id}`,
    method: 'patch',
    data: values,
    headers,
  });
};
export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation(createMeetings, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meetings');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};

export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation(updateMeetings, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meetings');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
export const useUpdateMeetingAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation(updateMeetingAttachment, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meetings');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
export const useDeleteMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteMeetings, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries('meetings');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
