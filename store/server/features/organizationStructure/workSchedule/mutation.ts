/* eslint-disable @typescript-eslint/naming-convention */
import { useMutation, useQueryClient } from 'react-query';
import { Schedule } from './interface';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};

const createSchedule = async (schedule: Schedule) => {
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
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/work-schedules/${id}`,
    method: 'PATCH',
    data: schedule,
    headers,
  });
};

const deleteSchedule = async (id: string) => {
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
      queryClient.invalidateQueries('schedule');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation(updateSchedule, {
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('schedule');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation((id: string) => deleteSchedule(id), {
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('schedule');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
/* eslint-enable @typescript-eslint/naming-convention */
