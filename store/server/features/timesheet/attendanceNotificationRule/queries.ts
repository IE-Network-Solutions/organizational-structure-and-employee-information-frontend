import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { AttendanceNotificationRule } from '@/types/timesheet/attendance';

const getAttendanceNotificationRules = async () => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/attendance-notification-rule`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getAttendanceNotificationRule = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/attendance-notification-rule`,
    method: 'GET',
    headers: requestHeaders,
    params: { id },
  });
};

export const useGetAttendanceNotificationRules = () => {
  return useQuery<ApiResponse<AttendanceNotificationRule>>(
    'attendance-notification-rules',
    () => getAttendanceNotificationRules(),
    {
      keepPreviousData: true,
    },
  );
};

export const useGetAttendanceNotificationRule = (id: string) => {
  return useQuery<ApiResponse<AttendanceNotificationRule>>(
    ['attendance-notification-rule', id],
    () => getAttendanceNotificationRule(id),
    {
      keepPreviousData: false,
      enabled: false,
    },
  );
};
