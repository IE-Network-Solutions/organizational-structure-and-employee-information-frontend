import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import {
  AttendanceSetShiftRequestBody,
  EditAttendance,
} from '@/store/server/features/timesheet/attendance/interface';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const attendanceImport = async (file: string) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/import`,
    method: 'POST',
    headers: requestHeader(),
    data: { file },
  });
};

const setEditAttendance = async (data: EditAttendance, id: string) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/${id}`,
    method: 'PATCH',
    headers: requestHeader(),
    data,
  });
};

const setCurrentAttendance = async (data: AttendanceSetShiftRequestBody) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/attendance/shift`,
    method: 'POST',
    headers: requestHeader(),
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
  });
};

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
