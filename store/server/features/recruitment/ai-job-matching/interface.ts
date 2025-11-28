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
}

export interface AIMatchedCandidate {
  candidateId: string;
  matchScore: number;
  matchReasons: string[];
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
}

export interface AIMatchDetails {
  jobId: string;
  candidateId: string;
  matchScore: number;
  detailedAnalysis: MatchScoreBreakdown;
  recommendations: string[];
  strengths: string[];
  concerns: string[];
  analysisTimestamp: string;
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


