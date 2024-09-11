import { RequestCommonQueryData } from '@/types/commons/requesTypes';
import { crudRequest } from '@/utils/crudRequest';
import { localUserID, TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import {
  AttendanceImportLogsBody,
  AttendanceRequestBody,
} from '@/store/server/features/timesheet/attendance/interface';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import {
  AttendanceImport,
  AttendanceRecord,
} from '@/types/timesheet/attendance';

const getAttendances = async (
  query: RequestCommonQueryData,
  data: Partial<AttendanceRequestBody>,
) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance`,
    method: 'POST',
    headers: requestHeader(),
    data,
    params: query,
  });
};

const getCurrentAttendance = async () => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/shift`,
    method: 'GET',
    headers: requestHeader(),
    params: { userId: localUserID },
  });
};

const getAttendanceImportLogs = async (
  query: RequestCommonQueryData,
  data: Partial<AttendanceImportLogsBody>,
) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/import-logs`,
    method: 'POST',
    headers: requestHeader(),
    data,
    params: query,
  });
};

export const useGetAttendances = (
  query: RequestCommonQueryData,
  data: Partial<AttendanceRequestBody>,
  isKeepData: boolean = true,
  isEnabled: boolean = true,
) => {
  return useQuery<ApiResponse<AttendanceRecord>>(
    ['attendance', query, data],
    () => getAttendances(query, data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
    },
  );
};

export const useGetCurrentAttendance = () => {
  return useQuery<ApiResponse<AttendanceRecord>>(
    'current-attendance',
    () => getCurrentAttendance(),
    {
      keepPreviousData: true,
    },
  );
};

export const useGetAttendanceImportLogs = (
  query: RequestCommonQueryData,
  data: Partial<AttendanceImportLogsBody>,
) => {
  return useQuery<ApiResponse<AttendanceImport>>(
    ['attendance-import-logs', query, data],
    () => getAttendanceImportLogs(query, data),
    { keepPreviousData: true },
  );
};
