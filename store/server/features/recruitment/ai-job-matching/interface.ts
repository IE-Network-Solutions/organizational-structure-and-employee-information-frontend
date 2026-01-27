export interface JobMatchSummary {
  jobId: string;
  jobTitle: string;
  department: string;
  location: string;
  totalCandidates: number;
  aiMatchedCount: number;
  topMatchScore: number;
  averageMatchScore: number;
  lastAnalyzed: string;
  jobStatus?: string | null;
  jobDeadline?: string | null;
  jobPostedAt?: string | null;
  /**
   * Optional job posted date from backend (if provided by Azure function).
   * Used by the AI Job Matching list and detail pages instead of any hardcoded dates.
   */
  postedAt?: string | null;
}

export interface AIMatchedCandidate {
  candidateId: string;
  matchScore: number;
  matchReasons: string[];
  matchedSkills?: string[];
  // New fields from updated function
  skillMatch?: number;
  educationMatch?: number;
  experienceMatch?: number;
  llmMatch?: number;
  cosineMatch?: number;
  candidate: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    resumeUrl: string;
    documentName: string;
    CGPA?: number;
    city?: string;
    country?: string;
    experience?: Array<{
      role?: string;
      company?: string;
      startDate?: string | number | null;
      endDate?: string | number | null;
      description?: string[];
    }>;
    education?: Array<{
      degree?: string;
      institution?: string | null;
      cgpa?: number | string | null;
      startYear?: number | null;
      endYear?: number | null;
    }>;
  };
  jobCandidate?: {
    id: string;
    applicantStatusStage?: {
      title?: string;
    };
  };
}

export interface MatchScoreSection {
  score: number;
  // Skills
  matchedSkills?: string[];
  missingSkills?: string[];
  totalSkills?: number;
  // Experience
  yearsMatch?: boolean;
  industryMatch?: boolean;
  yearsDifference?: number;
  // Education
  degreeMatch?: boolean;
  cgpaMatch?: boolean;
  cgpa?: number;
  // Location
  preferenceMatch?: boolean;
  location?: string;
}

export interface MatchScoreBreakdown {
  skillsMatch: MatchScoreSection;
  experienceMatch: MatchScoreSection;
  educationMatch: MatchScoreSection;
  locationMatch: MatchScoreSection;
  overallScore: number;
}

export interface AIMatchResponse {
  jobId: string;
  jobTitle: string;
  matchedCandidates: AIMatchedCandidate[];
  totalMatches: number;
  analysisTimestamp: string;
  department?: string;
  location?: string;
  /**
   * Optional job posted date from backend (if provided by Azure function).
   * When available, the UI will display this instead of a hardcoded label.
   */
  postedAt?: string | null;
  jobPostedAt?: string | null;
  jobStatus?: string | null;
}

export interface AIMatchDetails {
  jobId: string;
  candidateId: string;
  matchScore: number;
  detailedAnalysis: MatchScoreBreakdown;
  matchedSkills?: string[];
  missingSkills?: string[];
  recommendations: string[];
  strengths: string[];
  concerns: string[];
  analysisTimestamp: string;
  // New fields from updated function
  skillMatch?: number;
  educationMatch?: number;
  experienceMatch?: number;
  llmMatch?: number;
  cosineMatch?: number;
  jobPostedAt?: string;
  jobStatus?: string;
  location?: string;
  rawMatch?: any; // Full blob document
  candidate?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    resumeUrl: string;
    documentName: string;
    CGPA?: number;
    city?: string;
    country?: string;
    experience?: Array<{
      role?: string;
      company?: string;
      startDate?: string | number | null;
      endDate?: string | number | null;
      description?: string[];
    }>;
    education?: Array<{
      degree?: string;
      institution?: string | null;
      cgpa?: number | string | null;
      startYear?: number | null;
      endYear?: number | null;
    }>;
  };
}

export interface AIMatchOptions {
  minMatchScore?: number;
  limit?: number;
  forceRefresh?: boolean;
}

export interface BatchJobMatchResult {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  message?: string;
  matchedCandidates?: number;
}

export interface BatchMatchResponse {
  requestId: string;
  results: BatchJobMatchResult[];
}
