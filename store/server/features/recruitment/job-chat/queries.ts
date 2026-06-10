import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery, UseQueryResult } from 'react-query';
import { getJobChatHeaders } from './auth';
import { JobChatMessagesResponse, JobChatUnreadCounts } from './interface';
import { normalizeJobChatMessagesResponse } from './normalize';

export const getJobChatMessages = async (
  jobId: string,
  page = 1,
  limit = 50,
  search = '',
  tenantId?: string,
): Promise<JobChatMessagesResponse> => {
  const headers = await getJobChatHeaders(tenantId);
  const searchParam = search.trim()
    ? `&search=${encodeURIComponent(search.trim())}`
    : '';

  const raw = await crudRequest({
    url: `${RECRUITMENT_URL}/job-chat/${jobId}/messages?page=${page}&limit=${limit}${searchParam}`,
    method: 'GET',
    headers,
  });

  return normalizeJobChatMessagesResponse(raw, page, limit);
};

const getJobChatUnreadCounts = async (): Promise<JobChatUnreadCounts> => {
  const headers = await getJobChatHeaders();

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
  search = '',
  options?: {
    tenantId?: string;
    enabled?: boolean;
    refetchInterval?: number | false;
  },
): UseQueryResult<JobChatMessagesResponse> => {
  const tenantId = options?.tenantId?.trim() || '';
  const queryEnabled = !!jobId && !!tenantId && options?.enabled !== false;

  return useQuery<JobChatMessagesResponse>(
    ['job-chat-messages', jobId, page, limit, search, tenantId],
    () => getJobChatMessages(jobId, page, limit, search, tenantId),
    {
      enabled: queryEnabled,
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
      refetchInterval: queryEnabled
        ? (options?.refetchInterval ?? false)
        : false,
      staleTime: 0,
      retry: 1,
    },
  );
};

export const useGetJobChatUnreadCounts = (options?: any) =>
  useQuery(['job-chat-unread-counts'], getJobChatUnreadCounts, {
    refetchOnWindowFocus: false,
    ...options,
  });
