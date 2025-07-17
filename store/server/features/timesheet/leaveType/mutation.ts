import { LeaveType } from '@/types/timesheet/settings';
import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';

const createLeaveType = async (item: Partial<LeaveType>) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-type`,
    method: 'POST',
    headers: requestHeaders,
    data: { item },
  });
};
const updateLeaveType = async (id: string, values: Partial<LeaveType>) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-type/${id}`,
    method: 'PATCH',
    headers: requestHeaders,
    data: values,
  });
};

const deleteLeaveType = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-type`,
    method: 'DELETE',
    headers: requestHeaders,
    params: { id },
  });
};

const updateLeaveTypeActive = async (data: {
  id: string;
  isActive: boolean;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/leave-type/active`,
    method: 'POST',
    headers: requestHeaders,
    params: { id: data.id },
    data: { isActive: data.isActive },
  });
};

export const useCreateLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation(createLeaveType, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('leave-types');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
export const useUpdateLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, values }: { id: string; values: Partial<LeaveType> }) =>
      updateLeaveType(id, values),
    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      onSuccess: (_, variables: any) => {
        queryClient.invalidateQueries('leave-types');
        const method = variables?.method?.toUpperCase();
        handleSuccessMessage(method);
      },
    },
  );
};

export const useDeleteLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteLeaveType, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('leave-types');
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
      queryClient.invalidateQueries('leave-types');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
