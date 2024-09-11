import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_MODE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { BreakType } from '@/types/timesheet/breakType';

const setBreakType = async (data: Partial<BreakType>) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_MODE_URL}/attendance/break-type`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

const deleteBreakType = async (id: string) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_MODE_URL}/attendance/break-type`,
    method: 'DELETE',
    headers: requestHeader(),
    params: { id },
  });
};

export const useSetBreakType = () => {
  const queryClient = useQueryClient();
  return useMutation(setBreakType, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('break-types');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteBreakType = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteBreakType, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('break-types');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
