import { RequestCommonQueryData } from '@/types/commons/requesTypes';
import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import {
  AttendanceImportLogsBody,
  AttendanceRequestBody,
  RuleViolationQueryParams,
} from '@/store/server/features/timesheet/attendance/interface';
import { toRuleViolationApiParams } from '@/store/server/features/timesheet/attendance/ruleViolationParams';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import {
  AttendanceImport,
  AttendanceRecord,
  AttendanceRuleViolation,
} from '@/types/timesheet/attendance';
// const logUserId = useAuthenticationStore.getState().userId;

const buildAttendanceQueryParams = (
  query: RequestCommonQueryData,
): RequestCommonQueryData => ({
  page: query.page ?? 1,
  limit: query.limit ?? 10,
  ...(query.orderBy ? { orderBy: query.orderBy } : {}),
  ...(query.orderDirection ? { orderDirection: query.orderDirection } : {}),
});

const getAttendances = async (
  query: RequestCommonQueryData,
  data: Partial<AttendanceRequestBody>,
) => {
  const params = {
    ...buildAttendanceQueryParams(query),
    ...(data.filter ? { filter: JSON.stringify(data.filter) } : {}),
  };
  const requestHeaders = await requestHeader();

  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance`,
    method: 'GET',
    headers: requestHeaders,
    params,
  });
};

const getRuleViolations = async (query: RuleViolationQueryParams) => {
  const requestHeaders = await requestHeader();
  const params = toRuleViolationApiParams(query, {
    includePagination: true,
    includeSort: true,
  });

  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance-rule-violations`,
    method: 'GET',
    headers: requestHeaders,
    params,
  });
};

export const useGetRuleViolations = (query: RuleViolationQueryParams) => {
  return useQuery<ApiResponse<AttendanceRuleViolation>>(
    ['attendance-rule-violations', query],
    () => getRuleViolations(query),
    { keepPreviousData: true },
  );
};

const exportRuleViolationsExcel = async (
  query: Partial<RuleViolationQueryParams>,
) => {
  const requestHeaders = await requestHeader();
  const params = toRuleViolationApiParams(query);

  try {
    const response = await crudRequest({
      url: `${TIME_AND_ATTENDANCE_URL}/attendance-rule-violations/export/excel`,
      method: 'GET',
      headers: requestHeaders,
      params,
      skipEncryption: true,
      responseType: 'blob',
    });

    const blob =
      response instanceof Blob
        ? response
        : new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Rule Violation List Export.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
};

export const useExportRuleViolationsExcel = () => {
  return useMutation(exportRuleViolationsExcel);
};

const exportAttendanceData = async (data: any) => {
  const requestHeaders = await requestHeader();
  try {
    const response = await crudRequest({
      url: `${TIME_AND_ATTENDANCE_URL}/attendance`,
      method: 'POST',
      data,
      headers: requestHeaders,
      skipEncryption: true, // Skip encryption for file downloads
      responseType: 'blob', // Tell axios to handle binary data
    });

    // Response is already a blob from the API
    const blob =
      response instanceof Blob
        ? response
        : new Blob([response], {
            type:
              data.exportType === 'PDF'
                ? 'application/pdf'
                : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `Attendance Data Export.${data.exportType === 'PDF' ? 'pdf' : 'xlsx'}`;

    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
};

const getSingleAttendances = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/${id}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const getCurrentAttendance = async (userId: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/shift/user`,
    method: 'GET',
    headers: requestHeaders,
    params: { userId: userId },
  });
};

const getAttendanceImportLogs = async (
  query: RequestCommonQueryData,
  data: Partial<AttendanceImportLogsBody>,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/import-logs`,
    method: 'POST',
    headers: requestHeaders,
    data,
    params: query,
  });
};

export const useGetAttendances = (
  query: RequestCommonQueryData,
  data: Partial<AttendanceRequestBody> = {},
  isKeepData: boolean = true,
  isEnabled: boolean = true,
  refetchInterval?: number | false,
) => {
  return useQuery<ApiResponse<AttendanceRecord>>(
    ['attendance', query, data],
    () => getAttendances(query, data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
      staleTime: 3 * 60 * 1000,
      refetchInterval,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      select: (data) => {
        // You can transform the data here if needed
        return data;
      },
    },
  );
};

export const UseExportAttendanceData = () => {
  const queryClient = useQueryClient();
  return useMutation(exportAttendanceData, {
    onSuccess: () => {
      queryClient.invalidateQueries('exportData');
    },
  });
};

export const useGetSingleAttendances = (id: string) => {
  return useQuery<AttendanceRecord>(
    ['current-attendance', id],
    () => getSingleAttendances(id),
    {
      // Ensure id is a non-empty, non-null string
      enabled: id !== null && id !== undefined && id.trim() !== '',
    },
  );
};

export const useGetCurrentAttendance = (userId: string) => {
  return useQuery<ApiResponse<AttendanceRecord>>(
    ['current-attendance', userId],
    () => getCurrentAttendance(userId),
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
