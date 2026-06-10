import NotificationMessage from '@/components/common/notification/notificationMessage';
import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { getJobChatHeaders } from './auth';
import { SendJobMessagePayload } from './interface';

const sendJobChatMessage = async (
  payload: SendJobMessagePayload & { tenantId?: string },
) => {
  const { jobId, tenantId, ...data } = payload;
  const headers = await getJobChatHeaders(tenantId);

  return crudRequest({
    url: `${RECRUITMENT_URL}/job-chat/${jobId}/messages`,
    method: 'POST',
    data,
    headers,
  });
};

const markJobChatRead = async (jobId: string, tenantId?: string) => {
  const headers = await getJobChatHeaders(tenantId);

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
    onSuccess: (notUsed, variables) => {
      void notUsed;
      queryClient.invalidateQueries(['job-chat-unread-counts']);
      if (variables?.jobId) {
        queryClient.invalidateQueries(['job-chat-messages', variables.jobId]);
      }
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
  return useMutation(
    ({ jobId, tenantId }: { jobId: string; tenantId?: string }) =>
      markJobChatRead(jobId, tenantId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['job-chat-unread-counts']);
      },
    },
  );
};
