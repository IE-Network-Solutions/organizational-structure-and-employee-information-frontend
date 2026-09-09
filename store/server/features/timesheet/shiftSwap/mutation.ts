import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { requestHeader } from '@/helpers/requestHeader';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { CreateShiftSwapRequestPayload } from '@/store/server/features/timesheet/shiftSwap/interface';

const createShiftSwapRequest = async ({
  item,
  userId,
}: {
  item: CreateShiftSwapRequestPayload;
  userId: string;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/shift-swap-requests`,
    method: 'POST',
    headers: requestHeaders,
    data: { ...item, requesterUserId: userId },
  });
};

const peerApproveShiftSwap = async ({
  id,
  comment,
}: {
  id: string;
  comment?: string;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/shift-swap-requests/${id}/peer-approve`,
    method: 'POST',
    headers: requestHeaders,
    data: { comment },
  });
};

const peerRejectShiftSwap = async ({
  id,
  comment,
}: {
  id: string;
  comment?: string;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/shift-swap-requests/${id}/peer-reject`,
    method: 'POST',
    headers: requestHeaders,
    data: { comment },
  });
};

const cancelShiftSwapRequest = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/shift-swap-requests/${id}/cancel`,
    method: 'PATCH',
    headers: requestHeaders,
  });
};

const finalApproveShiftSwap = async (data: {
  shiftSwapRequestId: string;
  status: 'approved' | 'declined';
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/shift-swap-requests/escalate`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

const invalidateShiftSwapQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries(['shift-swap-requests']);
  queryClient.invalidateQueries(['shift-swap-peer-pending']);
  queryClient.invalidateQueries(['shift-swap-approval-all-status']);
  queryClient.invalidateQueries(['my-schedule']);
};

export const useCreateShiftSwapRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(createShiftSwapRequest, {
    onSuccess: () => {
      invalidateShiftSwapQueries(queryClient);
      handleSuccessMessage('POST');
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message: error?.response?.data?.message || 'Unable to create request',
      });
    },
  });
};

export const usePeerApproveShiftSwap = () => {
  const queryClient = useQueryClient();
  return useMutation(peerApproveShiftSwap, {
    onSuccess: () => {
      invalidateShiftSwapQueries(queryClient);
      handleSuccessMessage('POST');
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message: error?.response?.data?.message || 'Unable to approve request',
      });
    },
  });
};

export const usePeerRejectShiftSwap = () => {
  const queryClient = useQueryClient();
  return useMutation(peerRejectShiftSwap, {
    onSuccess: () => {
      invalidateShiftSwapQueries(queryClient);
      handleSuccessMessage('POST');
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message: error?.response?.data?.message || 'Unable to reject request',
      });
    },
  });
};

export const useCancelShiftSwapRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(cancelShiftSwapRequest, {
    onSuccess: () => {
      invalidateShiftSwapQueries(queryClient);
      handleSuccessMessage('PATCH');
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message: error?.response?.data?.message || 'Unable to cancel request',
      });
    },
  });
};

export const useSetFinalShiftSwapRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(finalApproveShiftSwap, {
    onSuccess: () => {
      invalidateShiftSwapQueries(queryClient);
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message: error?.response?.data?.message || 'Unable to update request',
      });
    },
  });
};
