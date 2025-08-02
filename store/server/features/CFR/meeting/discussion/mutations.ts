import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';
const createMeetingDiscussion = async (values: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-discussions`,
    method: 'post',
    data: values,
    headers,
  });
};
export const useCreateMeetingDiscussion = () => {
  const queryClient = useQueryClient();
  return useMutation(createMeetingDiscussion, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries(['meeting-discussion']);
      queryClient.invalidateQueries(['meetings']);
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
const updateMeetingDiscussion = async (values: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/meeting-discussions/${values?.id}`,
    method: 'patch',
    data: values,
    headers,
  });
};
export const useUpdateMeetingDiscussion = () => {
  const queryClient = useQueryClient();
  return useMutation(updateMeetingDiscussion, {
    onSuccess: (notused, variables: any) => {
      queryClient.invalidateQueries(['meeting-discussion']);
      queryClient.invalidateQueries(['meetings']);
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    // enabled: value !== '1' && value !== '' && value !== null && value !== undefined,
  });
};
