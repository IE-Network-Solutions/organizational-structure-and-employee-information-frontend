import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { AttendanceNotificationType } from '@/types/timesheet/attendance';

const getAttendanceNotificationTypes = async () => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/attendance-notification-type`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const getAttendanceNotificationType = async (id: string) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/attendance-notification-type`,
    method: 'GET',
    headers: requestHeader(),
    params: { id },
  });
};

export const useGetAttendanceNotificationTypes = () => {
  return useQuery<ApiResponse<AttendanceNotificationType>>(
    'attendance-notification-types',
    () => getAttendanceNotificationTypes(),
    {
      keepPreviousData: true,
    },
  );
};

export const useGetAttendanceNotificationType = (id: string) => {
  return useQuery<ApiResponse<AttendanceNotificationType>>(
    ['attendance-notification-type', id],
    () => getAttendanceNotificationType(id),
    {
      keepPreviousData: false,
      enabled: false,
    },
  );
};
