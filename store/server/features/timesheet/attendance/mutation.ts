import { crudRequest } from '@/utils/crudRequest';
import { PAYROLL_URL, TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { QueryClient, useMutation, useQueryClient } from 'react-query';
import { getEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import {
  AttendanceSetShiftRequestBody,
  EditAttendance,
  EditRuleViolation,
  ExportWarningLetterBody,
} from '@/store/server/features/timesheet/attendance/interface';
import { getZktCredentials } from '@/store/server/features/timesheet/zkt/queries';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import useAttendanceImportErrorModalStore from '@/store/uistate/features/timesheet/employeeAttendanceImport';
import { useRemoteAttendanceCameraStore } from '@/store/uistate/features/timesheet/remoteAttendanceCamera';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';
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
const editRuleViolation = async (
  data: EditRuleViolation,
  violationId: string,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance-rule-violations/${violationId}/action-types`,
    method: 'PATCH',
    headers: requestHeaders,
    data,
  });
};

const deleteRuleViolation = async (violationId: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance-rule-violations/${violationId}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
};

const addAttendanceViolationsToDeduction = async (data: {
  payPeriodId: string;
  violationIds: string[];
}) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const createdBy = useAuthenticationStore.getState().userId;

  return await crudRequest({
    url: `${PAYROLL_URL}/compensation-item-entitlement/attendance-deductions`,
    method: 'POST',
    headers: {
      tenantId,
      createdBy,
      Authorization: `Bearer ${token}`,
    },
    data,
  });
};

const exportWarningLetter = async ({
  violationId,
  format,
}: ExportWarningLetterBody) => {
  const requestHeaders = await requestHeader();
  const response = await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance-rule-violations/export/letter`,
    method: 'POST',
    headers: requestHeaders,
    data: { violationId, format },
    skipEncryption: true,
    responseType: 'blob',
  });

  const mimeType =
    format === 'PDF'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const extension = format === 'PDF' ? 'pdf' : 'docx';

  const blob =
    response instanceof Blob
      ? response
      : new Blob([response], { type: mimeType });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Warning Letter.${extension}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const resolveDepartmentIdFromEmployeeData = (
  employeeData: Record<string, unknown> | null | undefined,
): string | undefined => {
  if (!employeeData || typeof employeeData !== 'object') return undefined;

  const jobs = employeeData.employeeJobInformation;
  if (Array.isArray(jobs) && jobs.length > 0) {
    const activeJob =
      jobs.find(
        (job: { isPositionActive?: boolean }) => job?.isPositionActive,
      ) ?? jobs[0];
    const jobDepartmentId =
      activeJob?.departmentId ?? activeJob?.department?.id;
    if (jobDepartmentId) return String(jobDepartmentId);
  }

  const department = employeeData.department as { id?: string } | undefined;
  const fallbackId = employeeData.departmentId ?? department?.id;
  return fallbackId ? String(fallbackId) : undefined;
};

const resolveCurrentUserDepartmentId = async (
  queryClient?: QueryClient,
): Promise<string | undefined> => {
  const { userData, userId } = useAuthenticationStore.getState();

  const fromAuth = resolveDepartmentIdFromEmployeeData(userData);
  if (fromAuth) return fromAuth;

  if (!userId) return undefined;

  const cachedEmployee =
    queryClient?.getQueryData<Record<string, unknown>>(['employee', userId]) ??
    queryClient?.getQueryData<Record<string, unknown>>([
      'employeeItemData',
      userId,
    ]);
  const fromCache = resolveDepartmentIdFromEmployeeData(cachedEmployee);
  if (fromCache) return fromCache;

  try {
    const employee = await getEmployee(userId);
    return resolveDepartmentIdFromEmployeeData(employee);
  } catch {
    return undefined;
  }
};

const setCurrentAttendance = async (
  data: AttendanceSetShiftRequestBody,
  queryClient?: QueryClient,
) => {
  const requestHeaders = await requestHeader();
  const departmentId =
    data.departmentId ?? (await resolveCurrentUserDepartmentId(queryClient));

  const payload: AttendanceSetShiftRequestBody = {
    ...data,
    ...(departmentId ? { departmentId } : {}),
  };

  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/shift`,
    method: 'POST',
    headers: requestHeaders,
    data: payload,
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

export const useEditRuleViolation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ data, violationId }: { data: EditRuleViolation; violationId: string }) =>
      editRuleViolation(data, violationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('attendance-rule-violations');
        handleSuccessMessage('PATCH', 'Rule Violation successfully edited.');
      },
    },
  );
};

export const useDeleteRuleViolation = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (violationId: string) => deleteRuleViolation(violationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('attendance-rule-violations');
        handleSuccessMessage('DELETE', 'Rule Violation successfully deleted.');
      },
    },
  );
};

export const useAddAttendanceViolationsToDeduction = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: { payPeriodId: string; violationIds: string[] }) =>
      addAttendanceViolationsToDeduction(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('attendance-rule-violations');
        handleSuccessMessage(
          'POST',
          'Attendance violations added to deduction successfully.',
        );
      },
      onError: (error: any) => {
        NotificationMessage.error({
          message: 'Error',
          description:
            error?.response?.data?.message ||
            'Failed to add attendance violations to deduction.',
        });
      },
    },
  );
};

export const useExportWarningLetter = () => {
  return useMutation(exportWarningLetter);
};

export const useSetCurrentAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: AttendanceSetShiftRequestBody) =>
      setCurrentAttendance(data, queryClient),
    {
    onMutate: () => {
      useRemoteAttendanceCameraStore.getState().setIsSubmitInProgress(true);
    },
    onSettled: () => {
      useRemoteAttendanceCameraStore.getState().setIsSubmitInProgress(false);
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('current-attendance');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  },
  );
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

type ZktBreakSyncParams = {
  breakTypeId: string;
  filter?: { date: { from: string; to: string } };
};

const syncZktBreak = async ({ breakTypeId, filter }: ZktBreakSyncParams) => {
  const requestHeaders = await requestHeader();
  const requestData = {
    ...(await buildZktSyncRequestData(filter)),
    breakTypeId,
  };
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/sync-zkt-break`,
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
          item?.message ||
            'Attendance synced from attendance machine successfully.',
        );
      },
      onError(error: any) {
        NotificationMessage.error({
          message: 'Error',
          description:
            error?.response?.data?.message ||
            error?.message ||
            'Failed to sync attendance from attendance machine.',
        });
      },
    },
  );
};

export const useSyncZktBreak = () => {
  const queryClient = useQueryClient();
  return useMutation((params: ZktBreakSyncParams) => syncZktBreak(params), {
    onSuccess: (response: any) => {
      queryClient.invalidateQueries('attendance');

      const item = response?.item ?? response?.data?.item;
      const importWarnings: ZktImportWarning[] = item?.importWarnings ?? [];

      if (importWarnings.length > 0) {
        showZktImportWarnings(importWarnings);
      }

      handleSuccessMessage(
        'POST',
        item?.message ||
          'Break attendance synced from attendance machine successfully.',
      );
    },
    onError(error: any) {
      NotificationMessage.error({
        message: 'Error',
        description:
          error?.response?.data?.message ||
          error?.message ||
          'Failed to sync break attendance from attendance machine.',
      });
    },
  });
};
