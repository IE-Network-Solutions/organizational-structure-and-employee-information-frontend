import { LeaveRequest } from '@/types/timesheet/settings';
import { crudRequest } from '@/utils/crudRequest';
import { localUserID, LOBSTER_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { requestHeader } from '@/helpers/requestHeader';
import { LeaveRequestStatusBody } from '@/store/server/features/timesheet/leaveRequest/interface';

const setLeaveRequest = async (item: Partial<LeaveRequest>) => {
  return await crudRequest({
    url: `${LOBSTER_URL}/leave-request/make`,
    method: 'POST',
    headers: requestHeader(),
    data: { item: { ...item, user: localUserID } },
  });
};

const deleteLeaveRequest = async (id: string) => {
  return await crudRequest({
    url: `${LOBSTER_URL}/leave-request/make`,
    method: 'DELETE',
    headers: requestHeader(),
    params: { id },
  });
};

const setStatusToLeaveRequest = async (data: LeaveRequestStatusBody) => {
  return await crudRequest({
    url: `${LOBSTER_URL}/leave-request/escalate`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

export const useSetLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(setLeaveRequest, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('leave-request');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteLeaveRequest, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('leave-request');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useSetStatusToLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(setStatusToLeaveRequest, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('leave-request');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
