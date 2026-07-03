import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { AttendanceRule } from '@/types/timesheet/attendance';

const createAttendanceRule = async (data: Partial<AttendanceRule>) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance-rules`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

const updateAttendanceRule = async ({
  id,
  ...data
}: Partial<AttendanceRule> & { id: string }) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance-rules/${id}`,
    method: 'PATCH',
    headers: requestHeaders,
    data,
  });
};

const deleteAttendanceRule = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance-rules`,
    method: 'DELETE',
    headers: requestHeaders,
    params: { id },
  });
};

export const useCreateAttendanceRule = () => {
  const queryClient = useQueryClient();
  return useMutation(createAttendanceRule, {
    // eslint-disable-next-line
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries('attendance-rules');
      if (variables.backtrackEnabled) {
        queryClient.invalidateQueries('attendance-rule-violations');
      }
      handleSuccessMessage('POST');
    },
  });
};

export const useUpdateAttendanceRule = () => {
  const queryClient = useQueryClient();
  return useMutation(updateAttendanceRule, {
    // eslint-disable-next-line
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries('attendance-rules');
      if (variables.backtrackEnabled) {
        queryClient.invalidateQueries('attendance-rule-violations');
      }
      handleSuccessMessage('PATCH');
    },
  });
};

export const useDeleteAttendanceRule = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteAttendanceRule, {
    onSuccess: () => {
      queryClient.invalidateQueries('attendance-rules');
      handleSuccessMessage('DELETE');
    },
  });
};

/** @deprecated Use useDeleteAttendanceRule */
export const useDeleteAttendanceNotificationRule = useDeleteAttendanceRule;
