import { crudRequest } from '@/utils/crudRequest';
import { LOBSTER_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { AttendanceSetShiftRequestBody } from '@/store/server/features/timesheet/attendance/interface';

const attendanceImport = async (file: string) => {
  return await crudRequest({
    url: `${LOBSTER_URL}/attendance/import`,
    method: 'POST',
    headers: requestHeader(),
    data: { file },
  });
};

const setCurrentAttendance = async (data: AttendanceSetShiftRequestBody) => {
  return await crudRequest({
    url: `${LOBSTER_URL}/attendance/shift`,
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
