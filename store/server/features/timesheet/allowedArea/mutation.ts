import { AllowedArea } from '@/types/timesheet/settings';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';

const setAllowedArea = async (item: Partial<AllowedArea>) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/geofencing/allowed-area`,
    method: 'POST',
    headers: requestHeader(),
    data: { item },
  });
};

const deleteAllowedArea = async (id: string) => {
  return await crudRequest({
    url: `/${ORG_AND_EMP_URL}/geofencing/allowed-area`,
    method: 'DELETE',
    headers: requestHeader(),
    params: { id },
  });
};

export const useSetAllowedArea = () => {
  const queryClient = useQueryClient();
  return useMutation(setAllowedArea, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('allowed-areas');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteAllowedArea = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteAllowedArea, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('allowed-areas');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
