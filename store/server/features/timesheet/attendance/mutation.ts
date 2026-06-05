import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import {
  AttendanceSetShiftRequestBody,
  EditAttendance,
} from '@/store/server/features/timesheet/attendance/interface';
import { getZktCredentials } from '@/store/server/features/timesheet/zkt/queries';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import useAttendanceImportErrorModalStore from '@/store/uistate/features/timesheet/employeeAttendanceImport';
import dayjs from 'dayjs';

const attendanceImport = async (file: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/import`,
    method: 'POST',
    headers: requestHeaders,
    data: { file },
    // skipEncryption: true,
  });
};

const breakAttendanceImport = async (file: string, breakTypeId: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/break-import`,
    method: 'POST',
    headers: requestHeaders,
    data: { file, breakTypeId },
  });
};

const setEditAttendance = async (data: EditAttendance, id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/${id}`,
    method: 'PATCH',
    headers: requestHeaders,
    data,
  });
};

const setCurrentAttendance = async (data: AttendanceSetShiftRequestBody) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/shift`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

export const useAttendanceImport = () => {
  return useMutation(attendanceImport, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    onError(error: any) {
      if (
        error?.response?.data?.errors &&
        error?.response?.data?.errors.length > 0
      ) {
        useAttendanceImportErrorModalStore
          .getState()
          .showModal(error.response.data.errors || []);
      }

      if (error?.response?.data?.message) {
        NotificationMessage.error({
          message: 'Error',
          description: error.response.data.message,
        });
      }
    },
  });
};

export const useBreakAttendanceImport = () => {
  return useMutation(
    ({ file, breakTypeId }: { file: string; breakTypeId: string }) =>
      breakAttendanceImport(file, breakTypeId),

    {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      onSuccess: (_, variables: any) => {
        const method = variables?.method?.toUpperCase();
        handleSuccessMessage(method);
      },
      onError(error: any) {
        if (
          error?.response?.data?.errors &&
          error?.response?.data?.errors.length > 0
        ) {
          useAttendanceImportErrorModalStore
            .getState()
            .showModal(error.response.data.errors || []);
        }
        if (error?.response?.data?.message) {
          NotificationMessage.error({
            message: 'Error',
            description: error.response.data.message,
          });
        }
      },
    },
  );
};

// eslint-enable-next-line @typescript-eslint/naming-convention

export const useSetEditAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, data }: { id: string; data: EditAttendance }) =>
      setEditAttendance(data, id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('attendance');
        NotificationMessage.success({
          message: 'Successfully Edit',
          description: 'Attendance successfully Edit.',
        });
      },
    },
  );
};

export const useSetCurrentAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation(setCurrentAttendance, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('current-attendance');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

/**
 * Get today's date formatted as YYYY-MM-DD
 */
const getTodayDate = (): string => {
  return dayjs().format('YYYY-MM-DD');
};

const buildZktSyncRequestData = async (filter?: {
  date: { from: string; to: string };
}) => {
  const today = getTodayDate();
  const { zktToken, passUrl } = await getZktCredentials();
  return {
    passUrl,
    ZKTToken: zktToken,
    filter: filter || {
      date: {
        from: today,
        to: today,
      },
    },
  };
};

type ZktImportWarning = {
  line?: number;
  warning?: string;
  userId?: string;
};

const showZktImportWarnings = (importWarnings: ZktImportWarning[]) => {
  if (!importWarnings.length) return;

  const warningLines = importWarnings
    .slice(0, 5)
    .map((warning) => {
      const lineText = `Line ${warning?.line ?? '-'}`;
      const warningText = warning?.warning || 'Warning';
      const userText = warning?.userId ? ` (User: ${warning.userId})` : '';
      return `${lineText} - ${warningText}${userText}`;
    })
    .join('\n');

  const remainingCount = importWarnings.length - 5;
  const remainingText =
    remainingCount > 0 ? `\n...and ${remainingCount} more warning(s)` : '';

  NotificationMessage.warning({
    message: `Sync Warnings (${importWarnings.length})`,
    description: `${warningLines}${remainingText}`,
  });
};

const syncZktAttendance = async (filter?: {
  date: { from: string; to: string };
}) => {
  const requestHeaders = await requestHeader();
  const requestData = await buildZktSyncRequestData(filter);
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/sync-zkt`,
    method: 'POST',
    headers: requestHeaders,
    data: requestData,
  });
};

export const useFetchZKTAttendance = () => {
  return useMutation(
    (filter?: { date: { from: string; to: string } }) =>
      syncZktAttendance(filter),
    {
      onError(error: any) {
        NotificationMessage.error({
          message: 'Error',
          description:
            error?.response?.data?.message ||
            error?.message ||
            'Failed to fetch ZKT attendance data.',
        });
      },
    },
  );
};

export const useSyncZktAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (filter?: { date: { from: string; to: string } }) =>
      syncZktAttendance(filter),
    {
      onSuccess: (response: any) => {
        queryClient.invalidateQueries('attendance');

        const item = response?.item ?? response?.data?.item;
        const importWarnings: ZktImportWarning[] = item?.importWarnings ?? [];

        if (importWarnings.length > 0) {
          showZktImportWarnings(importWarnings);
        }

        handleSuccessMessage(
          'POST',
          item?.message || 'Attendance synced from ZK successfully.',
        );
      },
      onError(error: any) {
        NotificationMessage.error({
          message: 'Error',
          description:
            error?.response?.data?.message ||
            error?.message ||
            'Failed to sync attendance from ZK.',
        });
      },
    },
  );
};
