import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_MODE_ULR } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { AttendanceNotificationType } from '@/types/timesheet/attendance';

const getAttendanceNotificationTypes = async () => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_MODE_ULR}/attendance/attendance-notification-type`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const getAttendanceNotificationType = async (id: string) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_MODE_ULR}/attendance/attendance-notification-type`,
    method: 'GET',
    headers: requestHeader(),
    params: { id },
  });
};

export const useGetAttendanceNotificationTypes = async () => {
  return useQuery<ApiResponse<AttendanceNotificationType>>(
    'attendance-notification-types',
    () => getAttendanceNotificationTypes(),
    {
      keepPreviousData: true,
    },
  );
};

export const useGetAttendanceNotificationType = async (id: string) => {
  return useQuery<ApiResponse<AttendanceNotificationType>>(
    ['attendance-notification-type', id],
    () => getAttendanceNotificationType(id),
    {
      keepPreviousData: true,
    },
  );
};
