import { crudRequest } from '@/utils/crudRequest';
import { LOBSTER_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { AttendanceNotificationRule } from '@/types/timesheet/attendance';

const setAttendanceNotificationRule = async (
  data: Partial<AttendanceNotificationRule>,
) => {
  return await crudRequest({
    url: `${LOBSTER_URL}/attendance/attendance-notification-type`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

const deleteAttendanceNotificationRule = async (id: string) => {
  return await crudRequest({
    url: `${LOBSTER_URL}/attendance/attendance-notification-rule`,
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
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
