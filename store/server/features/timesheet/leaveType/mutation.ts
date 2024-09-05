import { LeaveType } from '@/types/timesheet/settings';
import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_MODE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';

const createLeaveType = async (item: Partial<LeaveType>) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_MODE_URL}/leave-type`,
    method: 'POST',
    headers: requestHeader(),
    data: { ...item },
  });
};

const deleteLeaveType = async (id: string) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_MODE_URL}/leave-type`,
    method: 'DELETE',
    headers: requestHeader(),
    params: { id },
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
