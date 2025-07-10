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
// const logUserId = useAuthenticationStore.getState().userId;

const getAttendances = async (
  query: RequestCommonQueryData,
  data: Partial<AttendanceRequestBody>,
) => {
  const requestData = {
    ...data,
  };

  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance`,
    method: 'POST',
    headers: requestHeader(),
    data: requestData,
    params: query,
  });
};
const exportAttendanceData = async (data: any) => {
  try {
    // const payload = {
    //   ...data,
    //   updatedBy: logUserId,
    //   createdBy: logUserId,
    // };
    const response = await crudRequest({
      url: `${TIME_AND_ATTENDANCE_URL}/attendance`,
      method: 'POST',
      headers: {
        ...requestHeader(),
      },
      data,
      skipEncryption: true, // Skip encryption for file downloads
    });

    const blob = new Blob([response], {
      type:
        data.exportType === 'PDF'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    let fileName = `Attendance Data Export.${data.exportType === 'PDF' ? 'pdf' : 'xlsx'}`;

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
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/${id}`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const getCurrentAttendance = async (userId: string) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/shift/user`,
    method: 'GET',
    headers: requestHeader(),
    params: { userId: userId },
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
