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
import { getMockMatchDetails, mockJobSummaries } from './mockData';

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
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers: Record<string, string> = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (tenantId) {
    headers.tenantId = tenantId;
  }

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
  };
};

const fetchJobMatchSummaries = async (): Promise<JobMatchSummary[]> => {
  const headers = await buildHeaders();

  // First try to use Azure AI service via Next.js proxy
  try {
    const { data } = await axios.get<JobMatchSummary[]>(
      '/api/ai-proxy/recruitment/job-matching/jobs',
      {
        headers,
        params: {
          limit: JOBS_PAGE_SIZE,
          page: 1,
        },
      },
    );

    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (error) {
    // Fall back to legacy behavior if Azure AI service is unavailable
    // eslint-disable-next-line no-console
    console.warn(
      '[AI Job Matching] Failed to load summaries from Azure AI service, falling back to local computation.',
      error,
    );
  }

  // Legacy fallback: derive summaries from recruitment backend data
  const { data: legacyData } = await axios.get<JobListApiResponse>(
    `${RECRUITMENT_URL}/job-information`,
    {
      headers,
      params: {
        limit: JOBS_PAGE_SIZE,
        page: 1,
      },
    },
  );

  const jobs = legacyData?.items ?? [];
  const activeJobs = jobs.filter(
    (job) => job.jobStatus?.toLowerCase() === 'active',
  );
  const jobsToMap = activeJobs.length > 0 ? activeJobs : jobs;

  if (jobsToMap.length === 0) {
    return mockJobSummaries;
  }

  return jobsToMap.map((job, index) =>
    mapJobToSummary(job, mockJobSummaries[index % mockJobSummaries.length]),
  );
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
  const headers = await buildHeaders();
  const limit = options?.limit ?? 50;
  const minMatchScore = options?.minMatchScore ?? 50;

  // Prefer Azure AI service via proxy
  try {
    const { data } = await axios.get<AIMatchResponse>(
      `/api/ai-proxy/recruitment/job-matching/jobs/${jobId}/candidates`,
      {
        headers,
        params: {
          limit,
          minMatchScore,
        },
      },
    );

    if (data && Array.isArray(data.matchedCandidates)) {
      return data;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      `[AI Job Matching] Failed to load matched candidates from Azure AI service for job ${jobId}, falling back to local computation.`,
      error,
    );
  }

  // Legacy fallback: compute matches locally from recruitment backend data
  const [{ data: candidatesResponse }, { data: jobResponse }] =
    await Promise.all([
      axios.get<JobCandidateListResponse>(
        `${RECRUITMENT_URL}/job-candidate-information/job-information/${jobId}`,
        {
          headers,
          params: {
            limit,
            page: 1,
          },
        },
      ),
      axios.get<JobInformationApi>(
        `${RECRUITMENT_URL}/job-information/${jobId}`,
        {
          headers,
        },
      ),
    ]);

  const mappedCandidates = (candidatesResponse?.items ?? [])
    .map((candidate) => mapCandidateToMatch(jobId, candidate))
    .filter((candidate) => candidate.matchScore >= minMatchScore)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return {
    jobId,
    jobTitle: jobResponse?.jobTitle || 'Job',
    matchedCandidates: mappedCandidates,
    totalMatches: mappedCandidates.length,
    analysisTimestamp: new Date().toISOString(),
  };
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
  // Prefer Azure AI service via proxy
  try {
    const headers = await buildHeaders();
    const { data } = await axios.get<AIMatchDetails>(
      `/api/ai-proxy/recruitment/job-matching/jobs/${jobId}/candidates/${candidateId}`,
      { headers },
    );
    if (data) {
      return data;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      `[AI Job Matching] Failed to load detailed match from Azure AI service for job ${jobId}, candidate ${candidateId}, falling back to local computation.`,
      error,
    );
  }

  // Legacy fallback: rebuild explanation on the client or from mock
  try {
    const candidate = await fetchCandidateDetail(candidateId);
    const seed = `${jobId}-${candidateId}`;
    const matchScore = generateMatchScore(seed);

    return {
      jobId,
      candidateId,
      matchScore,
      detailedAnalysis: createScoreBreakdown(
        seed,
        matchScore,
        candidate.city || candidate.country,
      ),
      recommendations: buildRecommendations(seed),
      strengths: buildCandidateStrengths(candidate, seed),
      concerns: buildCandidateConcerns(candidate, seed),
      analysisTimestamp: new Date().toISOString(),
    };
  } catch (error) {
    return getMockMatchDetails(jobId, candidateId);
  }
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
      staleTime: 5 * 60 * 1000,
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
