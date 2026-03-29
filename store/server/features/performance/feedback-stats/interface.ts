export interface FeedbackStatsSummaryBreakdown {
  kpi: number;
  engagement: number;
}

export interface FeedbackStatsSummary {
  totalAppreciation: number;
  appreciation: FeedbackStatsSummaryBreakdown;
  totalReprimand: number;
  reprimand: FeedbackStatsSummaryBreakdown;
}

export interface FeedbackStatsSeriesPoint {
  label: string;
  appreciation: number;
  reprimand: number;
}

export interface FeedbackStatsDashboard {
  sessionId: string;
  monthId: string;
  graphGranularity: string;
  summary: FeedbackStatsSummary;
  series: FeedbackStatsSeriesPoint[];
}

export interface FeedbackStatsPerformer {
  userId: string;
  name: string;
  jobTitle: string;
  profileImageUrl: string | null;
  kpiCount: number;
  engagementCount: number;
  total: number;
}

export interface FeedbackStatsPerformers {
  sessionId: string;
  monthId: string | null;
  performers: FeedbackStatsPerformer[];
}
