import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useMutation, useQueryClient } from 'react-query';
import { SendJobMessagePayload } from './interface';

const getAuthHeaders = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return {
    Authorization: `Bearer ${token}`,
    tenantId,
  };
};

const sendJobChatMessage = async (payload: SendJobMessagePayload) => {
  const headers = await getAuthHeaders();
  const { jobId, ...data } = payload;

  return crudRequest({
    url: `${RECRUITMENT_URL}/job-chat/${jobId}/messages`,
    method: 'POST',
    data,
    headers,
  });
};

const markJobChatRead = async (jobId: string) => {
  const headers = await getAuthHeaders();

  return crudRequest({
    url: `${RECRUITMENT_URL}/job-chat/${jobId}/read`,
    method: 'POST',
    data: {},
    headers,
  });
};

export const useSendJobChatMessage = () => {
  const queryClient = useQueryClient();
  return useMutation(sendJobChatMessage, {
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries(['job-chat-messages', variables.jobId]);
      queryClient.invalidateQueries(['job-chat-unread-counts']);
    },
    onError: () => {
      NotificationMessage.error({
        message: 'Message failed',
        description: 'Unable to send chat message. Please try again.',
      });
    },
  });
};

export const useMarkJobChatRead = () => {
  const queryClient = useQueryClient();
  return useMutation(markJobChatRead, {
    onSuccess: () => {
      queryClient.invalidateQueries(['job-chat-unread-counts']);
    },
  });
};
