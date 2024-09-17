import { CommitmentRule } from '@/types/tna';
import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';

const setTnaCommitment = async (items: Partial<CommitmentRule>[]) => {
  return await crudRequest({
    url: `${TNA_URL}/tna/commitment`,
    method: 'PUT',
    headers: requestHeader(),
    data: { items },
  });
};

const deleteTnaCommitment = async (id: string[]) => {
  return await crudRequest({
    url: `${TNA_URL}/tna/commitment`,
    method: 'DELETE',
    headers: requestHeader(),
    data: { id },
  });
};

export const useSetTnaCommitment = () => {
  const queryClient = useQueryClient();
  return useMutation(setTnaCommitment, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('commitment');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

export const useDeleteTnaCommitment = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteTnaCommitment, {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('commitment');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};
