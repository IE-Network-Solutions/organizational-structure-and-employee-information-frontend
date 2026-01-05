/* eslint-disable @typescript-eslint/naming-convention */
import { useMutation, useQueryClient } from 'react-query';
import { Schedule } from './interface';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const tenantId = useAuthenticationStore.getState().tenantId;

const createSchedule = async (schedule: Schedule) => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/work-schedules`,
    method: 'POST',
    data: schedule,
    headers,
  });
};

interface updateData {
  id: string;
  schedule: Schedule;
}
const updateSchedule = async (data: updateData) => {
  const { id, schedule } = data;
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/work-schedules/${id}`,
    method: 'PATCH',
    data: schedule,
    headers,
  });
};

const deleteSchedule = async (id: string) => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/work-schedules/${id}`,
    method: 'DELETE',
    headers,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation(createSchedule, {
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries(['schedule']);
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation(updateSchedule, {
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries(['schedule']);
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation((id: string) => deleteSchedule(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(['schedule']);
      NotificationMessage.success({
        message: 'Successfully Deleted',
        description: 'Work Schedule successfully deleted.',
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || '';
      const isAssignedUsersError =
        errorMessage.toLowerCase().includes('user') ||
        errorMessage.toLowerCase().includes('assigned') ||
        error?.response?.status === 400 ||
        error?.response?.status === 409;

      if (!isAssignedUsersError) {
        NotificationMessage.error({
          message: 'Deletion Failed',
          description:
            errorMessage || 'Failed to delete work schedule. Please try again.',
        });
      }
    },
  });
};
/* eslint-enable @typescript-eslint/naming-convention */
