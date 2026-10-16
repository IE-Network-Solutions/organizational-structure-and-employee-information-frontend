import { QueryClient, useMutation, useQueryClient } from 'react-query';
import { OKR_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import {
  invalidateOkrPlanningCaches,
  scheduleDashboardAndVpRefetch,
  scheduleOkrMilestoneStatusRefetch,
} from '@/utils/invalidateOkrPlanningCaches';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  DEADLINE_KEY_RESULTS_QUERY_KEY,
  DEADLINE_TASKS_QUERY_KEY,
  deadlinePlanHeaders,
  searchDeadlineTasks,
} from './queries';
import {
  DeadlineTask,
  DeadlineTaskApprovalPayload,
  DeadlineTaskPayload,
  DeadlineTaskReportPayload,
  DeadlineTaskSearchFilter,
} from './interface';

const BASE_URL = `${OKR_URL}/deadline-tasks`;

const showError = (error: any, fallback: string) => {
  const message = error?.response?.data?.message;
  NotificationMessage.error({
    message: fallback,
    description: Array.isArray(message) ? message.join(', ') : message,
  });
};

const refreshTasks = (queryClient: QueryClient) =>
  queryClient.invalidateQueries(DEADLINE_TASKS_QUERY_KEY);

/** A report moves key result progress, so the OKR caches are stale too. */
const refreshTasksAndProgress = (queryClient: QueryClient) => {
  refreshTasks(queryClient);
  queryClient.invalidateQueries(DEADLINE_KEY_RESULTS_QUERY_KEY);
  void invalidateOkrPlanningCaches(queryClient);
  scheduleOkrMilestoneStatusRefetch(queryClient);
  scheduleDashboardAndVpRefetch(queryClient);
};

const createDeadlineTasks = async (tasks: DeadlineTaskPayload[]) =>
  crudRequest({
    url: BASE_URL,
    method: 'post',
    data: { tasks },
    headers: await deadlinePlanHeaders(),
  });

const updateDeadlineTask = async ({
  id,
  task,
}: {
  id: string;
  task: Partial<DeadlineTaskPayload>;
}) =>
  crudRequest({
    url: `${BASE_URL}/${id}`,
    method: 'patch',
    data: task,
    headers: await deadlinePlanHeaders(),
  });

const deleteDeadlineTask = async (id: string) =>
  crudRequest({
    url: `${BASE_URL}/${id}`,
    method: 'delete',
    headers: await deadlinePlanHeaders(),
  });

const lockDeadlineTasks = async (data: {
  taskIds: string[];
  isLocked: boolean;
}) =>
  crudRequest({
    url: `${BASE_URL}/lock`,
    method: 'patch',
    data,
    headers: await deadlinePlanHeaders(),
  });

/** Apply a plan lock to every matching active parent, including later pages. */
const lockDeadlinePlans = async ({
  filter,
  isLocked,
}: {
  filter: DeadlineTaskSearchFilter;
  isLocked: boolean;
}) => {
  if (!filter.assigneeIds.length || filter.status === 'reported')
    return { affected: 0 };
  const activeFilter = { ...filter, status: 'active' as const };
  const ids = new Set<string>();
  let totalPages = 1;
  const batchSize = 100;
  for (let page = 1; page <= totalPages; page++) {
    const result = await searchDeadlineTasks(activeFilter, page, batchSize);
    totalPages = result.meta?.totalPages ?? 1;
    for (const task of result.items ?? []) {
      if (
        filter.assigneeIds.includes(task.assigneeId) &&
        !task.parentTaskId &&
        task.status === 'active' &&
        task.approvalStatus !== 'closed' &&
        Boolean(task.isLocked) !== isLocked
      )
        ids.add(task.id);
    }
  }
  const taskIds = Array.from(ids);
  let affected = 0;
  for (let index = 0; index < taskIds.length; index += batchSize) {
    const result = await lockDeadlineTasks({
      taskIds: taskIds.slice(index, index + batchSize),
      isLocked,
    });
    affected += result.affected;
  }
  return { affected };
};

const reportDeadlineTasks = async (reports: DeadlineTaskReportPayload[]) =>
  crudRequest({
    url: `${BASE_URL}/report`,
    method: 'post',
    data: { reports },
    headers: await deadlinePlanHeaders(),
  });

const unreportDeadlineTasks = async (taskIds: string[]) =>
  crudRequest({
    url: `${BASE_URL}/unreport`,
    method: 'post',
    data: { taskIds },
    headers: await deadlinePlanHeaders(),
  });

const approveDeadlineTasks = async (approval: DeadlineTaskApprovalPayload) =>
  crudRequest({
    url: `${BASE_URL}/approve`,
    method: 'patch',
    data: approval,
    headers: await deadlinePlanHeaders(),
  });

const commentOnDeadlineTask = async ({
  id,
  comment,
}: {
  id: string;
  comment: string;
}): Promise<DeadlineTask> =>
  crudRequest({
    url: `${BASE_URL}/${id}/comment`,
    method: 'patch',
    data: { comment },
    headers: await deadlinePlanHeaders(),
  });

export const useCommentOnDeadlineTask = () => {
  const queryClient = useQueryClient();
  return useMutation(commentOnDeadlineTask, {
    onSuccess: () => {
      refreshTasks(queryClient);
      NotificationMessage.success({ message: 'Comment saved' });
    },
    onError: (error) => showError(error, 'Could not save the comment'),
  });
};

export const useCreateDeadlineTasks = () => {
  const queryClient = useQueryClient();
  return useMutation(createDeadlineTasks, {
    onSuccess: (unused, tasks) => {
      refreshTasks(queryClient);
      NotificationMessage.success({
        message:
          tasks.length === 1 ? 'Task added' : `${tasks.length} tasks added`,
      });
    },
    onError: (error) => showError(error, 'Could not add the tasks'),
  });
};

export const useUpdateDeadlineTask = () => {
  const queryClient = useQueryClient();
  return useMutation(updateDeadlineTask, {
    onSuccess: () => {
      refreshTasks(queryClient);
      NotificationMessage.success({ message: 'Task updated' });
    },
    onError: (error) => showError(error, 'Could not update the task'),
  });
};

export const useDeleteDeadlineTask = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteDeadlineTask, {
    onSuccess: () => {
      refreshTasks(queryClient);
      NotificationMessage.success({ message: 'Task deleted' });
    },
    onError: (error) => showError(error, 'Could not delete the task'),
  });
};

export const useLockDeadlineTasks = () => {
  const queryClient = useQueryClient();
  return useMutation(lockDeadlineTasks, {
    onSuccess: () => refreshTasks(queryClient),
    onError: (error) => showError(error, 'Could not change the lock'),
  });
};

export const useLockDeadlinePlans = () => {
  const queryClient = useQueryClient();
  return useMutation(lockDeadlinePlans, {
    onSuccess: (result, { isLocked }) => {
      refreshTasks(queryClient);
      NotificationMessage.success({
        message: result.affected
          ? isLocked
            ? 'Plans locked'
            : 'Plans unlocked'
          : isLocked
            ? 'No active tasks need locking'
            : 'No active tasks need unlocking',
      });
    },
    onError: (error) => {
      refreshTasks(queryClient);
      showError(error, 'Could not change the plan locks');
    },
  });
};

export const useReportDeadlineTasks = () => {
  const queryClient = useQueryClient();
  return useMutation(reportDeadlineTasks, {
    onSuccess: () => refreshTasksAndProgress(queryClient),
    onError: (error) => showError(error, 'Could not report the task'),
  });
};

export const useUnreportDeadlineTasks = () => {
  const queryClient = useQueryClient();
  return useMutation(unreportDeadlineTasks, {
    onSuccess: (tasks: DeadlineTask[]) => {
      const updated = new Map(tasks.map((task) => [task.id, task]));
      queryClient.setQueriesData(DEADLINE_TASKS_QUERY_KEY, (cached: any) => {
        if (!cached?.pages) return cached;
        return {
          ...cached,
          pages: cached.pages.map((page: any) => ({
            ...page,
            items: page.items.map(
              (task: DeadlineTask) => updated.get(task.id) ?? task,
            ),
          })),
        };
      });
      refreshTasksAndProgress(queryClient);
    },
    onError: (error) => showError(error, 'Could not undo the report'),
  });
};

export const useApproveDeadlineTasks = () => {
  const queryClient = useQueryClient();
  return useMutation(approveDeadlineTasks, {
    onSuccess: () => {
      refreshTasks(queryClient);
      NotificationMessage.success({ message: 'Task closed' });
    },
    onError: (error) => showError(error, 'Could not close the task'),
  });
};
