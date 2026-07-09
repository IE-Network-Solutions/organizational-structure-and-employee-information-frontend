import { JobChatMessagesResponse, JobMessage } from './interface';

const emptyResponse = (page = 1, limit = 50): JobChatMessagesResponse => ({
  items: [],
  total: 0,
  page,
  limit,
});

export const normalizeJobChatMessagesResponse = (
  response: unknown,
  page = 1,
  limit = 50,
): JobChatMessagesResponse => {
  if (!response || typeof response !== 'object') {
    return emptyResponse(page, limit);
  }

  const candidate = response as Record<string, any>;

  if (Array.isArray(candidate.items)) {
    return {
      items: candidate.items as JobMessage[],
      total: Number(candidate.total ?? candidate.items.length),
      page: Number(candidate.page ?? page),
      limit: Number(candidate.limit ?? limit),
    };
  }

  if (Array.isArray(candidate.data?.items)) {
    return {
      items: candidate.data.items as JobMessage[],
      total: Number(candidate.data.total ?? candidate.data.items.length),
      page: Number(candidate.data.page ?? page),
      limit: Number(candidate.data.limit ?? limit),
    };
  }

  if (Array.isArray(candidate.data)) {
    const items = candidate.data as JobMessage[];
    return {
      items,
      total: items.length,
      page,
      limit,
    };
  }

  if (Array.isArray(candidate.messages)) {
    const items = candidate.messages as JobMessage[];
    return {
      items,
      total: Number(candidate.total ?? items.length),
      page: Number(candidate.page ?? page),
      limit: Number(candidate.limit ?? limit),
    };
  }

  return emptyResponse(page, limit);
};
