import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { AI_REC_BASE_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { BatchMatchResponse, AIMatchOptions } from './interface';

// Use Next.js API route as proxy to avoid CORS issues
const getProxyUrl = (endpoint: string) => {
  if (typeof window !== 'undefined') {
    return `/api/ai-proxy${endpoint}`;
  }
  const BASE_URL = 
    AI_REC_BASE_URL || 
    'https://selamnew-ai-matching-a8drhxandkdwctea.canadacentral-01.azurewebsites.net';
  return `${BASE_URL}/api${endpoint}`;
};

/**
 * Trigger batch matching for jobs
 */
const triggerBatchMatch = async (params: {
  jobIds?: string[];
  options?: AIMatchOptions;
}): Promise<BatchMatchResponse> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const { data } = await axios.post<BatchMatchResponse>(
      getProxyUrl('/recruitment/job-matching/batch-match'),
      {
        jobIds: params.jobIds || [],
        options: {
          minMatchScore: params.options?.minMatchScore || 50,
          forceRefresh: params.options?.forceRefresh || false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          tenantId: tenantId,
          'Content-Type': 'application/json',
        },
      },
    );
    return data;
  } catch (error: any) {
    if (error?.code === 'ERR_NETWORK' || error?.message?.includes('CORS')) {
      throw new Error(
        'CORS Error: The AI backend is not configured with proper CORS headers.',
      );
    }
    throw error;
  }
};

/**
 * Trigger matching for a single job
 */
const triggerJobMatch = async (params: {
  jobId: string;
  options?: AIMatchOptions;
}): Promise<any> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const { data } = await axios.post(
    getProxyUrl(`/recruitment/job-matching/trigger/${params.jobId}`),
    {
      options: {
        minMatchScore: params.options?.minMatchScore || 50,
        forceRefresh: params.options?.forceRefresh || true,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
        'Content-Type': 'application/json',
      },
    },
  );
  return data;
};

export const useBatchMatchJobsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(triggerBatchMatch, {
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries(['job-match-summaries']);
      queryClient.invalidateQueries(['ai-matched-candidates']);
    },
  });
};

export const useTriggerJobMatchMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(triggerJobMatch, {
    onSuccess: (result, variables) => {
      void result;
      // Invalidate related queries
      queryClient.invalidateQueries(['job-match-summary', variables.jobId]);
      queryClient.invalidateQueries(['ai-matched-candidates', variables.jobId]);
    },
  });
};
