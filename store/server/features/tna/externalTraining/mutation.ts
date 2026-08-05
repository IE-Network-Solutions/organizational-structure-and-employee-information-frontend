import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  ManagerDecisionPayload,
  SaveExternalTrainingRequestPayload,
  TnaOfficerDecisionPayload,
} from './interface';

const setExternalTraining = async (
  items: SaveExternalTrainingRequestPayload[],
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/external-training`,
    method: 'PUT',
    headers: requestHeaders,
    data: { items },
  });
};

const deleteExternalTraining = async (id: string[]) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/external-training`,
    method: 'DELETE',
    headers: requestHeaders,
    data: { id },
  });
};

const setManagerDecision = async ({ id, ...data }: ManagerDecisionPayload) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/external-training/${id}/manager-decision`,
    method: 'PATCH',
    headers: requestHeaders,
    data,
  });
};

const setTnaOfficerDecision = async ({
  id,
  ...data
}: TnaOfficerDecisionPayload) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/external-training/${id}/tna-officer-decision`,
    method: 'PATCH',
    headers: requestHeaders,
    data,
  });
};

const cancelExternalTraining = async ({
  id,
  remark,
}: {
  id: string;
  remark?: string;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/external-training/${id}/cancel`,
    method: 'PATCH',
    headers: requestHeaders,
    data: { remark },
  });
};

/** Every external-training list/detail cache key shares this prefix set. */
const invalidateExternalTrainingCaches = (queryClient: any) => {
  [
    'external-training',
    'external-training-by-user',
    'external-training-detail',
    'external-training-approvals',
    'external-training-pending-manager',
    'external-training-pending-officer',
    'external-training-employee-summary',
    'external-training-report',
    'training-commitment',
    'training-commitment-by-user',
    'training-commitment-detail',
  ].forEach((key) => queryClient.invalidateQueries(key));
};

export const useSetExternalTraining = () => {
  const queryClient = useQueryClient();
  return useMutation(setExternalTraining, {
    onSuccess: () => {
      invalidateExternalTrainingCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'External training request saved.',
      });
    },
  });
};

export const useDeleteExternalTraining = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteExternalTraining, {
    onSuccess: () => {
      invalidateExternalTrainingCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'External training request deleted.',
      });
    },
  });
};

export const useSetManagerDecision = () => {
  const queryClient = useQueryClient();
  return useMutation(setManagerDecision, {
    onSuccess: (unusedData, variables) => {
      void unusedData;
      invalidateExternalTrainingCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description:
          variables.decision === 'approve'
            ? 'Request approved and forwarded to the TNA Officer.'
            : 'Request rejected.',
      });
    },
  });
};

export const useSetTnaOfficerDecision = () => {
  const queryClient = useQueryClient();
  return useMutation(setTnaOfficerDecision, {
    onSuccess: (unusedData, variables) => {
      void unusedData;
      invalidateExternalTrainingCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description:
          variables.decision === 'approve'
            ? 'Request approved, payment confirmed and commitment activated.'
            : 'Request rejected.',
      });
    },
  });
};

export const useCancelExternalTraining = () => {
  const queryClient = useQueryClient();
  return useMutation(cancelExternalTraining, {
    onSuccess: () => {
      invalidateExternalTrainingCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'External training request cancelled.',
      });
    },
  });
};
