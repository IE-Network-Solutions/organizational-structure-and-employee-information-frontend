import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { SaveCommitmentConfigurationPayload } from '@/store/server/features/tna/externalTraining/interface';

const setCommitmentConfiguration = async (
  data: SaveCommitmentConfigurationPayload,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/commitment-configuration`,
    method: 'PUT',
    headers: requestHeaders,
    data,
  });
};

const deleteCommitmentConfiguration = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/commitment-configuration/${id}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
};

const invalidateConfigurationCaches = (queryClient: any) => {
  ['commitment-configuration', 'commitment-configuration-detail'].forEach(
    (key) => queryClient.invalidateQueries(key),
  );
};

export const useSetCommitmentConfiguration = () => {
  const queryClient = useQueryClient();
  return useMutation(setCommitmentConfiguration, {
    onSuccess: () => {
      invalidateConfigurationCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Commitment configuration saved.',
      });
    },
  });
};

export const useDeleteCommitmentConfiguration = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCommitmentConfiguration, {
    onSuccess: () => {
      invalidateConfigurationCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Commitment configuration deleted.',
      });
    },
  });
};
