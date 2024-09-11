import { crudRequest } from '@/utils/crudRequest';
import { NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { AttendanceNotificationRule } from '@/types/timesheet/attendance';

const setAttendanceNotificationRule = async (
  item: Partial<AttendanceNotificationRule>,
) => {
  return await crudRequest({
    url: `${NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL}/attendance/attendance-notification-rule`,
    method: 'POST',
    headers: requestHeader(),
    data: { item },
  });
};

const deleteAttendanceNotificationRule = async (id: string) => {
  return await crudRequest({
    url: `${NEXT_PUBLIC_TIME_AND_ATTENDANCE_URL}/attendance/attendance-notification-rule`,
    method: 'DELETE',
    headers: requestHeader(),
    params: { id },
  });
};

export const useSetAttendanceNotificationRule = () => {
  const queryClient = useQueryClient();
  return useMutation(setAttendanceNotificationRule, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('attendance-notification-rules');
      queryClient.invalidateQueries('attendance-notification-types');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteAttendanceNotificationRule = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteAttendanceNotificationRule, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('attendance-notification-rules');
      queryClient.invalidateQueries('attendance-notification-types');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
