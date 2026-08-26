import { crudRequest } from '@/utils/crudRequest';
import { TNA_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';

/**
 * Runs the same recalculation as the nightly cron. Useful when an admin wants
 * the counters brought up to date without waiting for midnight.
 */
const recalculateCommitments = async () => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TNA_URL}/user-training-commitment/recalculate`,
    method: 'POST',
    headers: requestHeaders,
    data: {},
  });
};

export const useRecalculateCommitments = () => {
  const queryClient = useQueryClient();
  return useMutation(recalculateCommitments, {
    onSuccess: () => {
      [
        'user-training-commitment',
        'user-training-commitment-detail',
        'user-training-commitment-active',
      ].forEach((key) => queryClient.invalidateQueries(key));
      NotificationMessage.success({
        message: 'Success',
        description: 'Commitment counters recalculated.',
      });
    },
  });
};
