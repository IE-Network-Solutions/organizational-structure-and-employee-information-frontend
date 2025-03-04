import { crudRequest } from '@/utils/crudRequest';
import { TimeZoneDataType } from './interface';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';

const updateTimeZone = async (data: Partial<TimeZoneDataType>) => {
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/time-zone/${data.id}`,
    method: 'PATCH',
    headers: requestHeader(),
    data,
  });
};

export const useUpdateTimeZone = () => {
  const queryClient = useQueryClient();
  return useMutation(updateTimeZone, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('time-zone');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
