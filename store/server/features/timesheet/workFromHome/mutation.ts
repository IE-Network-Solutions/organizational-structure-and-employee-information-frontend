import { crudRequest } from '@/utils/crudRequest';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { useMutation, useQueryClient } from 'react-query';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { requestHeader } from '@/helpers/requestHeader';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const setWorkFromHomeRequest = async ({
  item,
  userId,
}: {
  item: Record<string, any>;
  userId: string;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/work-from-home-request/make`,
    method: 'POST',
    headers: requestHeaders,
    data: { item: { ...item, user: userId } },
  });
};

/** Final approve/decline step — same payload shape as leave escalate; backend may map `leaveRequestId` to WFH id. */
const setFinalWorkFromHomeRequest = async (data: {
  leaveRequestId: string;
  status: 'approved' | 'declined';
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/work-from-home-request/escalate`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

export const useSetWorkFromHomeRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(setWorkFromHomeRequest, {
    onSuccess: (unusedMutationResult, variables: any) => {
      void unusedMutationResult;
      queryClient.invalidateQueries(['work-from-home-request']);
      queryClient.invalidateQueries(['work-from-home-approval-all-status']);
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message: error?.response?.data?.message || 'Unable to create request',
      });
    },
  });
};

export const useSetFinalWorkFromHomeRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(setFinalWorkFromHomeRequest, {
    onSuccess: () => {
      queryClient.invalidateQueries(['work-from-home-approval-all-status']);
      queryClient.invalidateQueries(['work-from-home-request']);
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message: error?.response?.data?.message || 'Unable to update request',
      });
    },
  });
};
