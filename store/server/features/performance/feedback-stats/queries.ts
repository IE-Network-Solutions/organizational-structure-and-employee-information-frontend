import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';
import type {
  FeedbackStatsDashboard,
  FeedbackStatsPerformers,
} from './interface';

const getFeedbackStatsDashboard = async (
  sessionId: string,
  monthId: string,
): Promise<FeedbackStatsDashboard> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const params = new URLSearchParams({
    sessionId,
    monthId,
  });
  const res = await crudRequest({
    url: `${ORG_DEV_URL}/feedback-stats/dashboard?${params.toString()}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId,
    },
  });
  return res as FeedbackStatsDashboard;
};

export const useGetFeedbackStatsDashboard = (
  sessionId: string | null | undefined,
  monthId: string | null | undefined,
) => {
  return useQuery<FeedbackStatsDashboard>(
    ['feedbackStatsDashboard', sessionId, monthId],
    () => getFeedbackStatsDashboard(sessionId as string, monthId as string),
    {
      enabled: Boolean(sessionId && monthId),
    },
  );
};

const getFeedbackStatsPerformers = async (
  sessionId: string,
  monthId: string | null | undefined,
): Promise<FeedbackStatsPerformers> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const params = new URLSearchParams({ sessionId });
  if (monthId) params.set('monthId', monthId);
  const res = await crudRequest({
    url: `${ORG_DEV_URL}/feedback-stats/performers?${params.toString()}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId,
    },
  });
  return res as FeedbackStatsPerformers;
};

export const useGetFeedbackStatsPerformers = (
  sessionId: string | null | undefined,
  monthId: string | null | undefined,
) => {
  return useQuery<FeedbackStatsPerformers>(
    ['feedbackStatsPerformers', sessionId, monthId ?? null],
    () => getFeedbackStatsPerformers(sessionId as string, monthId),
    {
      enabled: Boolean(sessionId),
    },
  );
};

export { getFeedbackStatsDashboard, getFeedbackStatsPerformers };
