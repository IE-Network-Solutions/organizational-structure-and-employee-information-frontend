import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  CloseTrainingRequestPayload,
  SaveTrainingRequestPayload,
  TrainingRequestDecisionPayload,
  TrainingRequestPaymentPayload,
} from './interface';
import { TrainingRequestApprovalStatus } from '@/types/tna/externalTna';

const setTrainingRequest = async (data: SaveTrainingRequestPayload) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-request`,
    method: 'PUT',
    headers: requestHeaders,
    data,
  });
};

const deleteTrainingRequest = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-request/${id}`,
    method: 'DELETE',
    headers: requestHeaders,
  });
};

const setTrainingRequestDecision = async ({
  id,
  ...data
}: TrainingRequestDecisionPayload) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-request/${id}/decision`,
    method: 'PATCH',
    headers: requestHeaders,
    data,
  });
};

const setTrainingRequestPayment = async ({
  id,
  isPaid = true,
}: TrainingRequestPaymentPayload) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-request/${id}/payment`,
    method: 'PATCH',
    headers: requestHeaders,
    data: { isPaid },
  });
};

/**
 * Closes a request as passed or failed. The proof goes up as multipart so the
 * backend can push it to the file server, which means encryption must be
 * skipped or the body would be rewritten into JSON.
 */
const closeTrainingRequest = async (
  outcome: 'complete' | 'fail',
  { id, endDate, description, file }: CloseTrainingRequestPayload,
) => {
  const requestHeaders = await requestHeader();
  const formData = new FormData();

  formData.append('file', file);
  formData.append('endDate', endDate);
  if (description) {
    formData.append('description', description);
  }

  return await crudRequest({
    url: `${TNA_URL}/training-request/${id}/${outcome}`,
    method: 'PATCH',
    headers: { ...requestHeaders, 'Content-Type': 'multipart/form-data' },
    data: formData,
    skipEncryption: true,
  });
};

const confirmTrainingRequest = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-request/${id}/confirm`,
    method: 'PATCH',
    headers: requestHeaders,
  });
};

/** Confirmation writes a commitment, so both caches have to be dropped. */
const invalidateTrainingCaches = (queryClient: any) => {
  [
    'training-request',
    'training-request-by-user',
    'training-request-detail',
    'user-training-commitment',
    'user-training-commitment-detail',
    'user-training-commitment-active',
  ].forEach((key) => queryClient.invalidateQueries(key));
};

export const useSetTrainingRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(setTrainingRequest, {
    onSuccess: () => {
      invalidateTrainingCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Training request saved.',
      });
    },
  });
};

export const useDeleteTrainingRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteTrainingRequest, {
    onSuccess: () => {
      invalidateTrainingCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Training request deleted.',
      });
    },
  });
};

export const useSetTrainingRequestDecision = () => {
  const queryClient = useQueryClient();
  return useMutation(setTrainingRequestDecision, {
    onSuccess: (unusedData, variables) => {
      void unusedData;
      invalidateTrainingCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description:
          variables.approvalStatus === TrainingRequestApprovalStatus.APPROVED
            ? 'Training request approved.'
            : `Training request ${variables.approvalStatus}.`,
      });
    },
  });
};

export const useSetTrainingRequestPayment = () => {
  const queryClient = useQueryClient();
  return useMutation(setTrainingRequestPayment, {
    onSuccess: (unusedData, variables) => {
      void unusedData;
      invalidateTrainingCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description:
          variables.isPaid === false
            ? 'Payment mark removed.'
            : 'Payment recorded.',
      });
    },
  });
};

export const useCompleteTrainingRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (payload: CloseTrainingRequestPayload) =>
      closeTrainingRequest('complete', payload),
    {
      onSuccess: () => {
        invalidateTrainingCaches(queryClient);
        NotificationMessage.success({
          message: 'Success',
          description: 'Certificate uploaded and training marked as completed.',
        });
      },
    },
  );
};

export const useFailTrainingRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (payload: CloseTrainingRequestPayload) =>
      closeTrainingRequest('fail', payload),
    {
      onSuccess: () => {
        invalidateTrainingCaches(queryClient);
        NotificationMessage.success({
          message: 'Success',
          description: 'Failure proof uploaded and training marked as failed.',
        });
      },
    },
  );
};

export const useConfirmTrainingRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(confirmTrainingRequest, {
    onSuccess: () => {
      invalidateTrainingCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'Request confirmed — the commitment has started.',
      });
    },
  });
};
