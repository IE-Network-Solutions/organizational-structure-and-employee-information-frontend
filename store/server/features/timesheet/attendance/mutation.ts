import { crudRequest } from '@/utils/crudRequest';
import { PAYROLL_URL, TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
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
  return useMutation(setCurrentAttendance, {
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
  });
};

/**
 * Get today's date formatted as YYYY-MM-DD
 */
const getTodayDate = (): string => {
  return dayjs().format('YYYY-MM-DD');
};

/**
 * Fetch ZKT attendance data
 */
const fetchZKTAttendance = async (filter?: {
  date: { from: string; to: string };
}): Promise<any> => {
  // Default to today's date if no filter is provided
  const today = getTodayDate();
  const requestHeaders = await requestHeader();
  const { zktToken, passUrl } = await getZktCredentials();
  const dateFilter = filter || {
    date: {
      from: today,
      to: today,
    },
  };
  const requestData = {
    passUrl,
    ZKTToken: zktToken,
    filter: dateFilter,
  };

  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance`,
    method: 'POST',
    headers: requestHeaders,
    data: requestData,

    // skipEncryption: true,
  });
};

export const useFetchZKTAttendance = () => {
  return useMutation(
    (filter?: { date: { from: string; to: string } }) =>
      fetchZKTAttendance(filter),
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
