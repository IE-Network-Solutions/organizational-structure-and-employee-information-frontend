import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { OKR_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { getCurrentToken } from '@/utils/getCurrentToken';
import type { AxiosError } from 'axios';
import { invalidateOkrPlanningCaches } from '@/utils/invalidateOkrPlanningCaches';
import { rememberReopenedPlanningTargets } from '@/utils/recentlyAchievedMilestones';

const tenantId = useAuthenticationStore.getState().tenantId;

const WEEKLY_PLAN_PREREQUISITE_MESSAGE =
  'Before plan, you must report the Weekly plan first';

function getPlanTasksErrorDescription(error: unknown): string {
  const e = error as
    | AxiosError<{ message?: string; error?: string }>
    | undefined;
  const raw = (
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.message ||
    ''
  ).trim();
  if (raw && /report the Weekly plan/i.test(raw)) {
    return WEEKLY_PLAN_PREREQUISITE_MESSAGE;
  }
  if (raw) return raw;
  return 'Something went wrong. Please try again.';
}

const createPlanTasks = async (values: any) => {
  const token = await getCurrentToken();
  const updatedData = {
    ...values,
    tasks: values.tasks.map((task: any) => ({
      ...task,
      targetValue: task.targetValue ?? 0, // Add targetValue if it doesn't exist, default to 0
    })),
  };

  return crudRequest({
    url: `${OKR_URL}/plan-tasks`,
    method: 'POST',
    data: updatedData,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useCreatePlanTasks = () => {
  const queryClient = useQueryClient();
  return useMutation(createPlanTasks, {
    onSuccess: (data, variables: any) => {
      void data;
      rememberReopenedPlanningTargets({
        milestoneIds:
          variables?.tasks
            ?.filter(
              (task: any) => !task?.achieveMK && task?.milestoneId != null,
            )
            .map((task: any) => task.milestoneId) ?? [],
      });
      void invalidateOkrPlanningCaches(queryClient);
      NotificationMessage.success({
        message: 'Successfully Created ',
        description: ' ',
      });
    },
    onError: (error) => {
      NotificationMessage.error({
        message: 'Creating Failed',
        description: getPlanTasksErrorDescription(error),
      });
    },
  });
};

const updatePlanTasks = async (values: any) => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${OKR_URL}/plan-tasks`,
    method: 'PATCH',
    data: values,
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useUpdatePlanTasks = () => {
  const queryClient = useQueryClient();
  return useMutation(updatePlanTasks, {
    onSuccess: (data, variables: any) => {
      void data;
      rememberReopenedPlanningTargets({
        milestoneIds:
          variables?.tasks
            ?.filter(
              (task: any) => !task?.achieveMK && task?.milestoneId != null,
            )
            .map((task: any) => task.milestoneId) ?? [],
      });
      void invalidateOkrPlanningCaches(queryClient);
      NotificationMessage.success({
        message: 'Successfully Updated ',
        description: ' ',
      });
    },
    onError: (error) => {
      NotificationMessage.error({
        message: 'Updating Failed',
        description: getPlanTasksErrorDescription(error),
      });
    },
  });
};
