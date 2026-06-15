import { QueryClient } from 'react-query';
import { JobChatMessagesResponse } from './interface';

export const getJobChatMessagesQueryKey = (
  jobId: string,
  page = 1,
  limit = 50,
  search = '',
  tenantId = '',
) => ['job-chat-messages', jobId, page, limit, search, tenantId] as const;

export const createEmptyJobChatResponse = (
  page = 1,
  limit = 50,
): JobChatMessagesResponse => ({
  items: [],
  total: 0,
  page,
  limit,
});

export const upsertJobChatCache = (
  queryClient: QueryClient,
  queryKey: ReturnType<typeof getJobChatMessagesQueryKey>,
  updater: (current: JobChatMessagesResponse) => JobChatMessagesResponse,
) => {
  queryClient.setQueryData<JobChatMessagesResponse>(queryKey, (old) =>
    updater(old ?? createEmptyJobChatResponse()),
  );
};
