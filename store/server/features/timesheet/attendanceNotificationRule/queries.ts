import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { AttendanceNotificationRule } from '@/types/timesheet/attendance';

const getAttendanceNotificationRules = async () => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/attendance/attendance-notification-rule`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const getAttendanceNotificationRule = async (id: string) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/attendance/attendance-notification-rule`,
    method: 'GET',
    headers: requestHeader(),
    params: { id },
  });
};

export const useGetAttendanceNotificationRules = async () => {
  return useQuery<ApiResponse<AttendanceNotificationRule>>(
    'attendance-notification-rules',
    () => getAttendanceNotificationRules(),
    {
      keepPreviousData: true,
    },
  );
};

export const useGetAttendanceNotificationRule = async (id: string) => {
  return useQuery<ApiResponse<AttendanceNotificationRule>>(
    ['attendance-notification-rule', id],
    () => getAttendanceNotificationRule(id),
    {
      keepPreviousData: true,
    },
  );
};
