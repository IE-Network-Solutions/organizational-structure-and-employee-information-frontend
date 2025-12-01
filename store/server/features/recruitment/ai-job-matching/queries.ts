import axios from 'axios';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';
import {
  AIMatchedCandidate,
  AIMatchDetails,
  AIMatchOptions,
  AIMatchResponse,
  JobMatchSummary,
  MatchScoreBreakdown,
} from './interface';

interface JobCandidateRelation {
  id: string;
  applicantStatusStage?: {
    title?: string;
  };
}

interface JobInformationApi {
  id: string;
  jobTitle: string;
  jobStatus?: string;
  jobLocation?: string;
  location?: string;
  jobDeadline?: string;
  department?: { name?: string } | null;
  organizationDepartment?: { name?: string } | null;
  departmentName?: string | null;
  departmentTitle?: string | null;
  createdAt?: string;
  updatedAt?: string;
  jobCandidate?: JobCandidateRelation[] | null;
  totalCandidates?: number;
  candidateCount?: number;
}

interface JobListApiResponse {
  items?: JobInformationApi[];
}

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
  jobCandidate?: JobCandidateRelation[];
}

interface JobCandidateListResponse {
  items?: JobCandidateApi[];
  meta?: {
    totalItems?: number;
  };
}

interface CandidateDetailApi extends JobCandidateApi {
  additionalInformation?: Array<{
    question: string;
    answer: string;
  }>;
}

const JOBS_PAGE_SIZE = 12;
const MATCH_REASON_LIBRARY = [
  'Strong alignment with required skills',
  'Relevant industry experience',
  'Proven track record of meeting deadlines',
  'Solid educational background',
  'Positive team collaboration feedback',
  'Availability aligns with project timeline',
  'Strong communication skills',
  'Experience with similar tools and stack',
  'Adaptable to changing requirements',
  'Leadership experience with cross-functional teams',
];

const SKILL_LIBRARY = [
  'TypeScript',
  'React',
  'Node.js',
  'NestJS',
  'Azure',
  'Docker',
  'Kubernetes',
  'SQL',
  'GraphQL',
  'CI/CD Pipelines',
  'Unit Testing',
  'Agile Methodology',
];

const MISSING_SKILL_LIBRARY = [
  'Kubernetes',
  'Advanced data visualization',
  'Performance tuning',
  'Security hardening',
  'Generative AI tooling',
];

const RECOMMENDATION_LIBRARY = [
  'Schedule a technical interview focusing on problem solving.',
  'Share a take-home assessment to validate practical skills.',
  'Discuss relocation expectations and preferred working style.',
  'Introduce the candidate to the hiring manager for culture fit evaluation.',
  'Review compensation expectations early in the process.',
  'Align on onboarding timeline and device provisioning requirements.',
];

const CONCERN_LIBRARY = [
  'Needs additional exposure to enterprise-scale systems.',
  'Has limited background in our core industry.',
  'May require mentorship on stakeholder communication.',
  'Has not recently led cross-functional initiatives.',
  'Requires a clearer plan for upskilling on cloud tooling.',
];

const buildHeaders = async () => {
  const token = await getCurrentToken();
  let tenantId = useAuthenticationStore.getState().tenantId;

  // Use demo-tenant if no tenant is configured (for testing with sample data)
  // Also use demo-tenant if tenantId is empty string or null
  if (!tenantId || tenantId.trim() === '') {
    tenantId = 'demo-tenant';
    console.log('[AI Job Matching] Using demo-tenant for sample data');
  } else {
    console.log('[AI Job Matching] Using tenantId from store:', tenantId);
  }

  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  // Always set tenantId
  headers.tenantId = tenantId;

  console.log('[AI Job Matching] Request headers:', {
    tenantId,
    hasToken: !!token,
  });

  return headers;
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const selectItems = (list: string[], hash: number, count: number) => {
  if (list.length === 0 || count === 0) {
    return [];
  }
  const picks: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const index = (hash + i * 7) % list.length;
    const item = list[index];
    if (!picks.includes(item)) {
      picks.push(item);
    }
  }
  return picks;
};

const generateMatchScore = (seed: string) => {
  const hash = hashString(seed);
  return clamp(55 + (hash % 45), 50, 98);
};

const generateMatchReasons = (seed: string) =>
  selectItems(MATCH_REASON_LIBRARY, hashString(seed), 3);

const mapJobToSummary = (
  job: JobInformationApi,
  mockStats: JobMatchSummary,
): JobMatchSummary => {
  const totalCandidates =
    Array.isArray(job.jobCandidate) && job.jobCandidate.length
      ? job.jobCandidate.length
      : (job.totalCandidates ?? job.candidateCount ?? 0);

  const departmentName =
    job.department?.name ||
    job.organizationDepartment?.name ||
    job.departmentName ||
    job.departmentTitle ||
    null;

  return {
    jobId: job.id,
    jobTitle: job.jobTitle || mockStats.jobTitle,
    department: departmentName ?? mockStats.department,
    location: job.jobLocation || job.location || mockStats.location,
    totalCandidates,
    aiMatchedCount:
      totalCandidates > 0
        ? Math.min(totalCandidates, mockStats.aiMatchedCount)
        : mockStats.aiMatchedCount,
    topMatchScore: mockStats.topMatchScore,
    averageMatchScore: mockStats.averageMatchScore,
    lastAnalyzed: job.updatedAt || job.createdAt || mockStats.lastAnalyzed,
    jobStatus: job.jobStatus,
    jobDeadline: job.jobDeadline || null,
  };
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

const mapCandidateToMatch = (
  jobId: string,
  candidate: JobCandidateApi,
): AIMatchedCandidate => {
  const candidateId = candidate.id || `${jobId}-candidate-${Math.random()}`;
  const seed = `${jobId}-${candidateId}`;
  const matchScore = generateMatchScore(seed);

  const stage =
    Array.isArray(candidate.jobCandidate) && candidate.jobCandidate.length > 0
      ? candidate.jobCandidate[0]
      : undefined;

  return {
    candidateId,
    matchScore,
    matchReasons: generateMatchReasons(seed),
    candidate: {
      id: candidateId,
      fullName: candidate.fullName || 'Unknown Candidate',
      email: candidate.email || '',
      phone: candidate.phone || '',
      resumeUrl: candidate.resumeUrl || '',
      documentName: candidate.documentName || 'Resume.pdf',
      CGPA: candidate.CGPA,
      city: candidate.city,
      country: candidate.country,
    },
    jobCandidate: stage
      ? {
          id: stage.id,
          applicantStatusStage: stage.applicantStatusStage?.title
            ? { title: stage.applicantStatusStage.title }
            : undefined,
        }
      : undefined,
  };
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

const createScoreBreakdown = (
  seed: string,
  overallScore: number,
  preferredLocation?: string,
): MatchScoreBreakdown => {
  const hash = hashString(seed);
  const skillsScore = clamp(overallScore + ((hash % 15) - 7), 40, 100);
  const experienceScore = clamp(
    overallScore + (((hash >> 3) % 12) - 6),
    40,
    100,
  );
  const educationScore = clamp(
    overallScore + (((hash >> 6) % 10) - 5),
    40,
    100,
  );
  const locationScore = clamp(
    overallScore + (((hash >> 9) % 20) - 10),
    30,
    100,
  );

  return {
    skillsMatch: {
      score: skillsScore,
      matchedSkills: selectItems(SKILL_LIBRARY, hash, 3),
      missingSkills: selectItems(MISSING_SKILL_LIBRARY, hash >> 2, 2),
      totalSkills: SKILL_LIBRARY.length,
    },
    experienceMatch: {
      score: experienceScore,
      yearsMatch: (hash & 1) === 0,
      industryMatch: (hash & 2) === 0,
      yearsDifference: ((hash >> 5) % 4) - 1,
    },
    educationMatch: {
      score: educationScore,
      degreeMatch: (hash & 4) === 0,
      cgpaMatch: (hash & 8) === 0,
      cgpa: clamp(2.8 + (hash % 15) / 10, 2.5, 4),
    },
    locationMatch: {
      score: locationScore,
      preferenceMatch: (hash & 16) === 0,
      location: preferredLocation,
    },
    overallScore,
  };
};

const buildCandidateStrengths = (
  candidate: CandidateDetailApi | null,
  seed: string,
) => {
  const name = candidate?.fullName || 'The candidate';
  const cgpa = candidate?.CGPA
    ? `${candidate.CGPA}`
    : 'a solid academic record';
  const statements = [
    `${name} demonstrates ${cgpa} which reflects consistent commitment.`,
    `${name} communicates proactively and collaborates well with stakeholders.`,
    'Shows accountability for deliverables and follows through on action items.',
    'Comfortable adapting to new tooling and workflows quickly.',
    'Provides thoughtful responses during screening conversations.',
    'Brings experience working across cross-functional pods.',
  ];

  return selectItems(statements, hashString(`${seed}-strengths`), 3);
};

const buildCandidateConcerns = (
  candidate: CandidateDetailApi | null,
  seed: string,
) => {
  const location = candidate?.city || candidate?.country;
  const concernStatements = [
    location
      ? `Availability for relocation to ${location} still needs confirmation.`
      : 'Relocation preferences remain unclear.',
    'Needs a clearer plan for upskilling on our infrastructure stack.',
    'Recent experience with enterprise security practices is limited.',
    'Requires additional context on working with distributed teams.',
    'Should provide more detail on production incident handling.',
  ];

  return selectItems(
    [...concernStatements, ...CONCERN_LIBRARY],
    hashString(`${seed}-concerns`),
    2,
  );
};

const buildRecommendations = (seed: string) =>
  selectItems(RECOMMENDATION_LIBRARY, hashString(`${seed}-recs`), 3);

const fetchCandidateDetail = async (
  candidateId: string,
): Promise<CandidateDetailApi> => {
  const headers = await buildHeaders();
  const { data } = await axios.get<CandidateDetailApi>(
    `${RECRUITMENT_URL}/job-candidate-information/${candidateId}`,
    { headers },
  );
  return data;
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
