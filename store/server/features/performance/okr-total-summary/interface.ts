export interface OkrLeaderboardPerformer {
  rank: number;
  userId: string;
  fullName: string;
  roleLabel: string;
  position: string;
  department: string;
  avatarUrl: string | null;
  okrScorePercent: number;
  summaryId: string;
}

export interface OkrTotalSummaryLeaderboard {
  sessionId: string;
  performers: OkrLeaderboardPerformer[];
}

export interface OkrDepartmentsOkrProgressRequest {
  departmentIds: string[];
  orgLevel: number;
  sessionId: string;
}

export interface OkrDepartmentsOkrProgressFilters {
  orgLevel: number | null;
  departmentIds: string[] | null;
}

export interface OkrDepartmentProgressRow {
  departmentId: string;
  departmentName: string;
  orgLevel: number;
  userCount: number;
  okrScorePercent: number;
}

export interface OkrKeyResultStatusBucket {
  count: number;
  percent: number;
}

export interface OkrKeyResultProgress {
  total: number;
  completed: OkrKeyResultStatusBucket;
  onTrack: OkrKeyResultStatusBucket;
  behind: OkrKeyResultStatusBucket;
  critical: OkrKeyResultStatusBucket;
}

export interface OkrDepartmentsOkrProgressResponse {
  sessionId: string;
  filters: OkrDepartmentsOkrProgressFilters;
  departments: OkrDepartmentProgressRow[];
  keyResultProgress: OkrKeyResultProgress;
}
