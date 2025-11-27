import { RequestCommonQueryData } from '@/types/commons/requesTypes';
import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import {
  AttendanceImportLogsBody,
  AttendanceRequestBody,
} from '@/store/server/features/timesheet/attendance/interface';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ApiResponse } from '@/types/commons/responseTypes';
import {
  AttendanceImport,
  AttendanceRecord,
} from '@/types/timesheet/attendance';
import { getZktToken, getZktPassUrl } from '@/utils/zktToken';
import { useTimesheetSettingsStore } from '@/store/uistate/features/timesheet/settings';
import dayjs from 'dayjs';
// const logUserId = useAuthenticationStore.getState().userId;

/**
 * Get passUrl from localStorage or fallback to zustand store
 */
const getPassUrl = (): string | null => {
  const passUrlFromStorage = getZktPassUrl();
  if (passUrlFromStorage) {
    return passUrlFromStorage;
  }
  const zktSavedData = useTimesheetSettingsStore.getState().zktSavedData;
  return zktSavedData?.url || null;
};

/**
 * Get today's date formatted as YYYY-MM-DD
 */
const getTodayDate = (): string => {
  return dayjs().format('YYYY-MM-DD');
};

/**
 * Check if we should use ZKT endpoint for real-time data
 * Returns true if:
 * - No exportType is present (exports always use standard endpoint)
 * - No filter is present OR only today's date filter is present
 * - No other filter criteria (userIds, type, breakTypeId, locations, attendanceRecordIds)
 */
const shouldUseZKTEndpoint = (
  data: Partial<AttendanceRequestBody>,
): boolean => {
  // If exportType is present, always use standard endpoint
  if (data.exportType) {
    return false;
  }

  const filter = data.filter || {};

  // Check if filter has any criteria other than date
  const hasOtherFilters =
    (filter.userIds && filter.userIds.length > 0) ||
    (filter.attendanceRecordIds && filter.attendanceRecordIds.length > 0) ||
    filter.type ||
    filter.breakTypeId ||
    (filter.locations && filter.locations.length > 0);

  if (hasOtherFilters) {
    return false;
  }

  // If no date filter, use ZKT endpoint for real-time data (today)
  if (!filter.date) {
    return true;
  }

  // If date filter exists, check if it's only today's date
  const today = getTodayDate();
  const isTodayOnly = filter.date.from === today && filter.date.to === today;

  return isTodayOnly;
};

/**
 * Fetch ZKT attendance data (real-time) for today
 */
const fetchZKTAttendance = async (): Promise<ApiResponse<AttendanceRecord>> => {
  const passUrl = getPassUrl();
  const zktToken = getZktToken();

  if (!passUrl) {
    throw new Error('passUrl is not found in localStorage or store');
  }

  if (!zktToken) {
    throw new Error('ZKTToken is not found in localStorage');
  }

  // Always use today's date for real-time data
  const today = getTodayDate();

  const requestData = {
    passUrl,
    ZKTToken: zktToken,
    filter: {
      date: {
        from: today,
        to: today,
      },
    },
  };

  const response = await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: requestData,
  });

  // Transform ZKT response to match the expected format
  return response as ApiResponse<AttendanceRecord>;
};

const getAttendances = async (
  query: RequestCommonQueryData,
  data: Partial<AttendanceRequestBody>,
) => {
  // Check if we should use ZKT endpoint for real-time data (today only)
  if (shouldUseZKTEndpoint(data)) {
    try {
      const zktResponse = await fetchZKTAttendance();
      // Return ZKT response - it should match the expected ApiResponse format
      return zktResponse;
    } catch (error) {
      // If ZKT endpoint fails, fall back to standard endpoint
      console.warn(
        'ZKT endpoint failed, falling back to standard endpoint:',
        error,
      );
      // Continue to standard endpoint below
    }
  }

  // Use standard endpoint for:
  // - Filtered data (non-today dates, users, types, etc.)
  // - Exports
  // - When ZKT fails or credentials are not available
  const requestHeaders = await requestHeader();
  const requestData = {
    ...data,
  };

  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance`,
    method: 'POST',
    headers: requestHeaders,
    data: requestData,
    params: query,
  });
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
) => {
  return useQuery<ApiResponse<AttendanceRecord>>(
    ['attendance', query, data],
    () => getAttendances(query, data),
    {
      keepPreviousData: isKeepData,
      enabled: isEnabled,
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
