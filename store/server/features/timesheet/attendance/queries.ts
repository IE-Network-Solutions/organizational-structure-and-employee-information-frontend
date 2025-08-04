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
import axios from 'axios';
// const logUserId = useAuthenticationStore.getState().userId;

const getAttendances = async (
  query: RequestCommonQueryData,
  data: Partial<AttendanceRequestBody>,
) => {
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
    // const payload = {
    //   ...data,
    //   updatedBy: logUserId,
    //   createdBy: logUserId,
    // };
    const response = await axios.post(
      `${TIME_AND_ATTENDANCE_URL}/attendance`,
      data,
      {
        headers: requestHeaders,
        responseType: 'blob',
      },
    );

    const blob = new Blob([response.data], {
      type:
        data.exportType === 'PDF'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const disposition = response.headers['content-disposition'];
    let fileName = `Attendance Data Export.${data.exportType === 'PDF' ? 'pdf' : 'xlsx'}`;

    if (disposition && disposition.includes('filename=')) {
      fileName = disposition.split('filename=')[1].replace(/"/g, '');
    }

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
