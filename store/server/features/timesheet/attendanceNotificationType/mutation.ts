import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { AttendanceNotificationType } from '@/types/timesheet/attendance';

const setAttendanceNotificationType = async (
  item: Partial<AttendanceNotificationType>,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/attendance-notification-type`,
    method: 'POST',
    headers: requestHeaders,
    data: { item },
  });
};

const deleteAttendanceNotificationType = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/attendance-notification-type`,
    method: 'DELETE',
    headers: requestHeaders,
    params: { id },
  });
};

export const useSetAttendanceNotificationType = () => {
  const queryClient = useQueryClient();
  return useMutation(setAttendanceNotificationType, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('attendance-notification-types');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteAttendanceNotificationType = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteAttendanceNotificationType, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('attendance-notification-types');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
