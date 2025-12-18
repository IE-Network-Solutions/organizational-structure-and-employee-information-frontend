import { useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { AI_REC_BASE_URL } from '@/utils/constants';
import { BatchMatchResponse, AIMatchOptions } from './interface';

const getDirectUrl = (endpoint: string) => {
  if (!AI_REC_BASE_URL) {
    throw new Error('AI_REC_BASE_URL is not configured');
  }
  return `${AI_REC_BASE_URL}/api${endpoint}`;
};

/**
 * Trigger batch matching for jobs
 */
const triggerBatchMatch = async (params: {
  jobIds?: string[];
  options?: AIMatchOptions;
}): Promise<BatchMatchResponse> => {
  const token = await getCurrentToken();
  let tenantId = useAuthenticationStore.getState().tenantId;

  // Use demo-tenant if no tenant configured
  if (!tenantId || tenantId.trim() === '') {
    tenantId = 'demo-tenant';
  }

  try {
    const { data } = await axios.post<BatchMatchResponse>(
      getDirectUrl('/recruitment/job-matching/batch-match'),
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
  let tenantId = useAuthenticationStore.getState().tenantId;

  // Use demo-tenant if no tenant configured
  if (!tenantId || tenantId.trim() === '') {
    tenantId = 'demo-tenant';
  }

  const { data } = await axios.post(
    getDirectUrl(`/recruitment/job-matching/trigger/${params.jobId}`),
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
