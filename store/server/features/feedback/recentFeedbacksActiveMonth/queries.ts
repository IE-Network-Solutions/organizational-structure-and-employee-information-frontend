import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';

import type { RecentFeedbacksActiveMonthResponse } from './interface';

const getRecentFeedbacksActiveMonth = async (
  userId: string,
): Promise<RecentFeedbacksActiveMonthResponse> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  if (!token || !tenantId) {
    throw new Error('Missing authentication information.');
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId,
  };

  return crudRequest({
    url: `${ORG_DEV_URL}/feedback-record/users/${userId}/recent-feedbacks-active-month`,
    method: 'GET',
    headers,
  });
};

export const useRecentFeedbacksActiveMonth = (userId: string | undefined) =>
  useQuery<RecentFeedbacksActiveMonthResponse>(
    ['feedback-record', 'recent-feedbacks-active-month', userId],
    () => getRecentFeedbacksActiveMonth(userId!),
    {
      enabled: Boolean(userId),
      keepPreviousData: true,
    },
  );
