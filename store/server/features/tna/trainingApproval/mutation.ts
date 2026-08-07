import { crudRequest } from '@/utils/crudRequest';
import { APPROVER_URL, TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  TrainingRequestApprovalLogPayload,
  TrainingRequestBulkApprovalPayload,
  TrainingRequestFinalStatusPayload,
} from '@/store/server/features/tna/externalTraining/interface';

/**
 * Records one approver's decision on a workflow step. The response carries
 * `last: true` when this was the final step, which is the caller's cue to push
 * the final status back to the training service.
 */
const setTrainingRequestApprovalLog = async (
  data: TrainingRequestApprovalLogPayload,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${APPROVER_URL}/approver/approvalLog`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

const setTrainingRequestFinalStatus = async (
  data: TrainingRequestFinalStatusPayload,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-request`,
    method: 'PATCH',
    headers: requestHeaders,
    data,
  });
};

const setAllTrainingRequestsApproved = async (
  data: TrainingRequestBulkApprovalPayload,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-request/tna-currentApproved/${data.userId}?page=${data.page}&limit=${data.limit}`,
    method: 'POST',
    headers: requestHeaders,
    data: { roleId: data.roleId },
  });
};

const setAllTrainingRequestsRejected = async (
  data: TrainingRequestBulkApprovalPayload,
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-request/tna-currentRejected/${data.userId}?page=${data.page}&limit=${data.limit}`,
    method: 'POST',
    headers: requestHeaders,
    data: { roleId: data.roleId },
  });
};

const setAllTrainingRequestFinalStatuses = async (
  data: TrainingRequestFinalStatusPayload[],
) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/training-request/updateAllApprovedOrRejected`,
    method: 'PATCH',
    headers: requestHeaders,
    data,
  });
};

const invalidateApprovalCaches = (queryClient: any) => {
  [
    'training-request-approvals',
    'training-request',
    'training-request-by-user',
    'training-request-detail',
  ].forEach((key) => queryClient.invalidateQueries(key));
};

export const useSetTrainingRequestApprovalLog = () => {
  const queryClient = useQueryClient();
  return useMutation(setTrainingRequestApprovalLog, {
    onSuccess: () => invalidateApprovalCaches(queryClient),
  });
};

export const useSetTrainingRequestFinalStatus = () => {
  const queryClient = useQueryClient();
  return useMutation(setTrainingRequestFinalStatus, {
    onSuccess: (unusedData, variables) => {
      void unusedData;
      invalidateApprovalCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description:
          variables.status === 'approved'
            ? 'Training request approved.'
            : 'Training request rejected.',
      });
    },
  });
};

export const useSetAllTrainingRequestsApproved = () => {
  const queryClient = useQueryClient();
  return useMutation(setAllTrainingRequestsApproved, {
    onSuccess: () => invalidateApprovalCaches(queryClient),
  });
};

export const useSetAllTrainingRequestsRejected = () => {
  const queryClient = useQueryClient();
  return useMutation(setAllTrainingRequestsRejected, {
    onSuccess: () => invalidateApprovalCaches(queryClient),
  });
};

export const useSetAllTrainingRequestFinalStatuses = () => {
  const queryClient = useQueryClient();
  return useMutation(setAllTrainingRequestFinalStatuses, {
    onSuccess: () => {
      invalidateApprovalCaches(queryClient);
      NotificationMessage.success({
        message: 'Success',
        description: 'All pending training requests have been actioned.',
      });
    },
  });
};
