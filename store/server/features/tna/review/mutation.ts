import { TrainingNeedAssessment } from '@/types/tna/tna';
import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';

const setTna = async (items: Partial<TrainingNeedAssessment>[]) => {
  return await crudRequest({
    url: `${TNA_URL}/tna`,
    method: 'PUT',
    headers: requestHeader(),
    data: { items },
  });
};

const deleteTna = async (id: string[]) => {
  return await crudRequest({
    url: `${TNA_URL}/tna`,
    method: 'DELETE',
    headers: requestHeader(),
    data: { id },
  });
};
const setFinalApproveTnaRequest = async (data: any) => {
  return await crudRequest({
    url: `${TNA_URL}/tna`,
    method: 'PATCH',
    headers: requestHeader(),
    data,
  });
};

export const useSetTna = () => {
  return useMutation(setTna, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteTna = () => {
  return useMutation(deleteTna, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useSetFinalApproveTnaRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(setFinalApproveTnaRequest, {
    onSuccess: (data, variables: any) => {
      queryClient.invalidateQueries([
        'tna-current_approval',
        data?.approvedUserId,
      ]);
      queryClient.invalidateQueries(['tna']);
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
