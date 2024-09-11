import { LeaveType } from '@/types/timesheet/settings';
import { crudRequest } from '@/utils/crudRequest';
import { NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';

const createLeaveType = async (item: Partial<LeaveType>) => {
  return await crudRequest({
    url: `${NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL}/leave-type`,
    method: 'POST',
    headers: requestHeader(),
    data: { item },
  });
};

const deleteLeaveType = async (id: string) => {
  return await crudRequest({
    url: `${NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL}/leave-type`,
    method: 'DELETE',
    headers: requestHeader(),
    params: { id },
  });
};

const updateLeaveTypeActive = async (data: {
  id: string;
  isActive: boolean;
}) => {
  return await crudRequest({
    url: `${NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL}/leave-type/active`,
    method: 'POST',
    headers: requestHeader(),
    params: { id: data.id },
    data: { isActive: data.isActive },
  });
};

export const useCreateLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation(createLeaveType, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('leave-type');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteLeaveType, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('leave-type');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useUpdateLeaveTypeActive = () => {
  const queryClient = useQueryClient();
  return useMutation(updateLeaveTypeActive, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('leave-type');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
