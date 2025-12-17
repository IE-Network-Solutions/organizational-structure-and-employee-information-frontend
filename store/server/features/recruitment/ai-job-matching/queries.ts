import axios from 'axios';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';
import {
  AIMatchDetails,
  AIMatchOptions,
  AIMatchResponse,
  JobMatchSummary,
} from './interface';

interface JobCandidateApi {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  CGPA?: number;
  resumeUrl?: string;
  documentName?: string;
  city?: string;
  country?: string;
  createdAt?: string;
  jobCandidate?: Array<{
    id: string;
    applicantStatusStage?: { title?: string };
  }>;
}

interface JobCandidateListResponse {
  items?: JobCandidateApi[];
  meta?: {
    totalItems?: number;
  };
}

const JOBS_PAGE_SIZE = 12;

const buildHeaders = async () => {
  const token = await getCurrentToken();
  let tenantId = useAuthenticationStore.getState().tenantId;

  // Use demo-tenant if no tenant is configured (for testing with sample data)
  // Also use demo-tenant if tenantId is empty string or null
  if (!tenantId || tenantId.trim() === '') {
    tenantId = 'demo-tenant';
    // eslint-disable-next-line no-console
    console.log('[AI Job Matching] Using demo-tenant for sample data');
  } else {
    // eslint-disable-next-line no-console
    console.log('[AI Job Matching] Using tenantId from store:', tenantId);
  }

  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  // Always set tenantId
  headers.tenantId = tenantId;

  // eslint-disable-next-line no-console
  console.log('[AI Job Matching] Request headers:', {
    tenantId,
    hasToken: !!token,
  });

  return headers;
};

const fetchJobMatchSummaries = async (): Promise<JobMatchSummary[]> => {
  // Call Azure Function DIRECTLY (no proxy)
  const AI_BASE_URL =
    process.env.NEXT_PUBLIC_AI_REC_BASE_URL ||
    'https://selamnew-endpoint-execfuc7fmgjf5hz.westus2-01.azurewebsites.net';

  const url = `${AI_BASE_URL}/api/recruitment/job-matching/jobs`;

  const headers = await buildHeaders();

  // eslint-disable-next-line no-console
  console.log('[AI Job Matching] Calling Azure DIRECTLY:', url);
  // eslint-disable-next-line no-console
  console.log('[AI Job Matching] Headers:', headers);

  try {
    const { data } = await axios.get<JobMatchSummary[]>(url, {
      headers,
      params: {
        limit: JOBS_PAGE_SIZE,
        page: 1,
      },
    });

    // eslint-disable-next-line no-console
    console.log(
      '[AI Job Matching] ✅ Received data:',
      Array.isArray(data) ? `Array(${data.length})` : typeof data,
      data,
    );

    if (Array.isArray(data)) {
      return data;
    }

    // eslint-disable-next-line no-console
    console.warn('[AI Job Matching] Invalid data format:', data);
    return [];
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error(
      '[AI Job Matching] ❌ Error:',
      error?.response?.status,
      error?.message,
    );
    throw error;
  }
};

const fetchMatchedCandidates = async (
  jobId: string,
  options?: AIMatchOptions,
): Promise<AIMatchResponse> => {
  // Call Azure Function DIRECTLY (no proxy)
  const AI_BASE_URL =
    process.env.NEXT_PUBLIC_AI_REC_BASE_URL ||
    'https://selamnew-endpoint-execfuc7fmgjf5hz.westus2-01.azurewebsites.net';

  const url = `${AI_BASE_URL}/api/recruitment/job-matching/jobs/${jobId}/candidates`;

  const headers = await buildHeaders();
  const limit = options?.limit ?? 200;

  // eslint-disable-next-line no-console
  console.log(`[AI Job Matching] Calling Azure DIRECTLY for candidates:`, url);

  try {
    const { data } = await axios.get<AIMatchResponse>(url, {
      headers,
      params: { limit },
    });

    if (data && Array.isArray(data.matchedCandidates)) {
      // eslint-disable-next-line no-console
      console.log(
        `[AI Job Matching] ✅ Loaded ${data.matchedCandidates.length} candidates for job ${jobId}`,
      );
      return data;
    }

    // eslint-disable-next-line no-console
    console.warn(`[AI Job Matching] Invalid data for job ${jobId}`);
    return {
      jobId,
      jobTitle: '',
      matchedCandidates: [],
      totalMatches: 0,
      analysisTimestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error(
      `[AI Job Matching] ❌ Error:`,
      error?.response?.status,
      error?.message,
    );
    throw error;
  }
};

interface JobMetadata {
  jobId: string;
  location?: string | null;
  jobPostedAt?: string | null;
  postedAt?: string | null;
}

const fetchJobMetadata = async (jobId: string): Promise<JobMetadata> => {
  const matchResponse = await fetchMatchedCandidates(jobId, { limit: 1 });
  return {
    jobId: matchResponse.jobId,
    location: matchResponse.location ?? null,
    jobPostedAt: matchResponse.jobPostedAt ?? matchResponse.postedAt ?? null,
    postedAt: matchResponse.postedAt ?? null,
  };
};

const fetchMatchDetails = async (
  jobId: string,
  candidateId: string,
): Promise<AIMatchDetails> => {
  // Call Azure Function DIRECTLY (no proxy)
  const AI_BASE_URL =
    process.env.NEXT_PUBLIC_AI_REC_BASE_URL ||
    'https://selamnew-endpoint-execfuc7fmgjf5hz.westus2-01.azurewebsites.net';

  const url = `${AI_BASE_URL}/api/recruitment/job-matching/jobs/${jobId}/candidates/${candidateId}`;

  const headers = await buildHeaders();

  // eslint-disable-next-line no-console
  console.log(
    `[AI Job Matching] Calling Azure DIRECTLY for match details:`,
    url,
  );

  const { data } = await axios.get<AIMatchDetails>(url, { headers });

  if (data) {
    // eslint-disable-next-line no-console
    console.log(`[AI Job Matching] ✅ Loaded match details for ${candidateId}`);
    return data;
  }

  // eslint-disable-next-line no-console
  console.warn(`[AI Job Matching] Invalid data for match details`);
  throw new Error('Failed to load match details from Azure');
};

const getOptionsKey = (options?: AIMatchOptions) =>
  options ? JSON.stringify(options) : 'default';

const fetchJobApplicants = async (
  jobId: string,
  limit = 100,
): Promise<JobCandidateListResponse> => {
  const headers = await buildHeaders();
  const { data } = await axios.get<JobCandidateListResponse>(
    `${RECRUITMENT_URL}/job-candidate-information/job-information/${jobId}`,
    {
      headers,
      params: {
        limit,
        page: 1,
      },
    },
  );
  return data;
};

export const useGetJobMatchSummaries = (enabled = true) =>
  useQuery<JobMatchSummary[]>(
    ['job-match-summaries'],
    () => fetchJobMatchSummaries(),
    {
      enabled,
      staleTime: 0, // Disable cache to always fetch fresh data
      cacheTime: 0, // Don't keep old data
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  );

export const useGetAIMatchedCandidates = (
  jobId: string | null,
  options?: AIMatchOptions,
  enabled = true,
) =>
  useQuery<AIMatchResponse>(
    ['ai-matched-candidates', jobId, getOptionsKey(options)],
    () => fetchMatchedCandidates(jobId as string, options),
    {
      enabled: Boolean(jobId) && enabled,
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000,
    },
  );

export const useGetAIMatchDetails = (
  jobId: string | null,
  candidateId: string | null,
  enabled = true,
) =>
  useQuery<AIMatchDetails>(
    ['ai-match-details', jobId, candidateId],
    () => fetchMatchDetails(jobId as string, candidateId as string),
    {
      enabled: Boolean(jobId) && Boolean(candidateId) && enabled,
    },
  );

export const useGetJobApplicants = (jobId: string | null, enabled = true) =>
  useQuery<JobCandidateListResponse>(
    ['job-applicants', jobId],
    () => fetchJobApplicants(jobId as string),
    {
      enabled: Boolean(jobId) && enabled,
      staleTime: 60 * 1000,
    },
  );

export const useGetJobMetadata = (jobId: string | null, enabled = true) =>
  useQuery<JobMetadata>(
    ['ai-job-metadata', jobId],
    () => fetchJobMetadata(jobId as string),
    {
      enabled: Boolean(jobId) && enabled,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  );