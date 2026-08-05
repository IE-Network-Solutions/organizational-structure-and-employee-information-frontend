import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { TrainingCommitmentStatus } from '@/types/tna/externalTna';

const completeTrainingCommitment = async ({
  id,
  remark,
}: {
  id: string;
  remark?: string;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-commitment/${id}/complete`,
    method: 'PATCH',
    headers: requestHeaders,
    data: { remark },
  });
};

const updateTrainingCommitmentStatus = async ({
  id,
  status,
  remark,
}: {
  id: string;
  status: TrainingCommitmentStatus;
  remark?: string;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-commitment/${id}/status`,
    method: 'PATCH',
    headers: requestHeaders,
    data: { status, remark },
  });
};

const refreshTrainingCommitmentStatuses = async () => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-commitment/refresh-statuses`,
    method: 'POST',
    headers: requestHeaders,
    data: {},
  });
};

const invalidateCommitmentCaches = (queryClient: any) => {
  [
    'training-commitment',
    'training-commitment-by-user',
    'training-commitment-detail',
    'external-training',
    'external-training-detail',
    'external-training-employee-summary',
    'external-training-report',
  ].forEach((key) => queryClient.invalidateQueries(key));
};

export const useCompleteTrainingCommitment = () => {
  const queryClient = useQueryClient();
  return useMutation(completeTrainingCommitment, {
    onSuccess: () => {
      invalidateCommitmentCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Commitment marked as completed.',
      });
    },
  });
};

export const useUpdateTrainingCommitmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(updateTrainingCommitmentStatus, {
    onSuccess: () => {
      invalidateCommitmentCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Commitment status updated.',
      });
    },
  });
};

export const useRefreshTrainingCommitmentStatuses = () => {
  const queryClient = useQueryClient();
  return useMutation(refreshTrainingCommitmentStatuses, {
    onSuccess: () => {
      invalidateCommitmentCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Elapsed commitments have been reconciled.',
      });
    },
  });
};
