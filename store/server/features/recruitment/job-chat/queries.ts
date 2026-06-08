import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';
import { JobChatMessagesResponse, JobChatUnreadCounts } from './interface';

const getAuthHeaders = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return {
    Authorization: `Bearer ${token}`,
    tenantId,
  };
};

const getJobChatMessages = async (
  jobId: string,
  page = 1,
  limit = 50,
): Promise<JobChatMessagesResponse> => {
  const headers = await getAuthHeaders();
  return crudRequest({
    url: `${RECRUITMENT_URL}/job-chat/${jobId}/messages?page=${page}&limit=${limit}`,
    method: 'GET',
    headers,
  });
};

const getJobChatUnreadCounts = async (): Promise<JobChatUnreadCounts> => {
  const headers = await getAuthHeaders();
  return crudRequest({
    url: `${RECRUITMENT_URL}/job-chat/unread-counts`,
    method: 'GET',
    headers,
  });
};

export const useGetJobChatMessages = (
  jobId: string,
  page = 1,
  limit = 50,
  options?: any,
) =>
  useQuery(
    ['job-chat-messages', jobId, page, limit],
    () => getJobChatMessages(jobId, page, limit),
    {
      enabled: !!jobId,
      refetchOnWindowFocus: false,
      ...options,
    },
  );

export const useGetJobChatUnreadCounts = (options?: any) =>
  useQuery(['job-chat-unread-counts'], getJobChatUnreadCounts, {
    refetchOnWindowFocus: false,
    ...options,
  });
