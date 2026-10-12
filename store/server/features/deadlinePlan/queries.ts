import { useInfiniteQuery, useQueries, useQuery } from 'react-query';
import { OKR_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  DeadlineKeyResult,
  DeadlineTaskPage,
  DeadlineTaskSearchFilter,
  DeadlineTaskSummaryRow,
} from './interface';

export const DEADLINE_TASKS_QUERY_KEY = 'deadlineTasks';
export const DEADLINE_KEY_RESULTS_QUERY_KEY = 'deadlinePlanKeyResults';
export const DEADLINE_TASK_PAGE_SIZE = 20;

export const deadlinePlanHeaders = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return {
    tenantId,
    Authorization: `Bearer ${token}`,
  };
};

const searchDeadlineTasks = async (
  filter: DeadlineTaskSearchFilter,
  page: number,
  pageSize: number,
): Promise<DeadlineTaskPage> => {
  return await crudRequest({
    url: `${OKR_URL}/deadline-tasks/search?page=${page}&limit=${pageSize}`,
    method: 'post',
    data: filter,
    headers: await deadlinePlanHeaders(),
  });
};

const getKeyResultsForUser = async (
  userId: string,
): Promise<DeadlineKeyResult[]> => {
  const response = await crudRequest({
    url: `${OKR_URL}/deadline-tasks/key-results`,
    method: 'post',
    data: { userIds: [userId] },
    headers: await deadlinePlanHeaders(),
  });
  return Array.isArray(response) ? response : [];
};

/** Paged task list; each page holds parent tasks with their subtasks. */
export const useDeadlineTasks = (
  filter: DeadlineTaskSearchFilter,
  options?: { enabled?: boolean; pageSize?: number },
) => {
  const pageSize = options?.pageSize ?? DEADLINE_TASK_PAGE_SIZE;
  return useInfiniteQuery<DeadlineTaskPage>(
    [DEADLINE_TASKS_QUERY_KEY, filter, pageSize],
    ({ pageParam = 1 }) => searchDeadlineTasks(filter, pageParam, pageSize),
    {
      enabled: options?.enabled ?? true,
      keepPreviousData: true,
      getNextPageParam: (lastPage) =>
        lastPage?.meta && lastPage.meta.currentPage < lastPage.meta.totalPages
          ? lastPage.meta.currentPage + 1
          : undefined,
    },
  );
};

/** One cached query per owner, so the panel and the task form share results. */
export const useDeadlineKeyResults = (userIds: string[]) =>
  useQueries(
    userIds.map((userId) => ({
      queryKey: [DEADLINE_KEY_RESULTS_QUERY_KEY, userId],
      queryFn: () => getKeyResultsForUser(userId),
      staleTime: 60_000,
      enabled: !!userId,
    })),
  );

const getDeadlineTaskSummary = async (
  filter: DeadlineTaskSearchFilter,
): Promise<DeadlineTaskSummaryRow[]> => {
  const response = await crudRequest({
    url: `${OKR_URL}/deadline-tasks/summary`,
    method: 'post',
    data: filter,
    headers: await deadlinePlanHeaders(),
  });
  return Array.isArray(response) ? response : [];
};

/**
 * Task counts per assignee and key result for the current filters. Shares the
 * task list's key prefix so it refreshes whenever tasks change.
 */
export const useDeadlineTaskSummary = (filter: DeadlineTaskSearchFilter) =>
  useQuery<DeadlineTaskSummaryRow[]>(
    [DEADLINE_TASKS_QUERY_KEY, 'summary', filter],
    () => getDeadlineTaskSummary(filter),
    { keepPreviousData: true, enabled: filter.assigneeIds.length > 0 },
  );
