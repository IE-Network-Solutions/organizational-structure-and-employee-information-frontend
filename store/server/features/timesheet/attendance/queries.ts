import { RequestCommonQueryData } from '@/types/commons/requesTypes';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import {
  AttendanceImportLogsBody,
  AttendanceRequestBody,
} from '@/store/server/features/timesheet/attendance/interface';
import { useQuery } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import { AttendanceRecord } from '@/types/timesheet/attendance';

const getAttendances = async (
  query: RequestCommonQueryData,
  data: Partial<AttendanceRequestBody>,
) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/attendance`,
    method: 'POST',
    headers: requestHeader(),
    data,
    params: query,
  });
};

const getCurrentAttendance = async () => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/attendance/shift`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const getAttendanceImportLogs = async (
  query: RequestCommonQueryData,
  data: Partial<AttendanceImportLogsBody>,
) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/attendance/import-logs`,
    method: 'POST',
    headers: requestHeader(),
    data,
    params: query,
  });
};

export const useGetAttendances = (
  query: RequestCommonQueryData,
  data: Partial<AttendanceRequestBody>,
) => {
  return useQuery<ApiResponse<AttendanceRecord>>(
    ['attendance', query],
    () => getAttendances(query, data),
    {
      keepPreviousData: true,
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
  return useQuery<ApiResponse<AttendanceRecord>>(
    ['attendance-import-logs', query],
    () => getAttendanceImportLogs(query, data),
    { keepPreviousData: true },
  );
};
