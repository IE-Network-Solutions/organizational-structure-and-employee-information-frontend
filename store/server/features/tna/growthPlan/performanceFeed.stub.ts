/**
 * Deferred performance / rewards feed contract (Phase 4 stub).
 * No UI in v1 — consumers can poll completed growth-plan goals later.
 */
export interface GrowthPlanPerformanceFeedItem {
  userId: string;
  fiscalYearId: string;
  categoryId: string;
  categoryName: string;
  completedGoals: Array<{
    goalId: string;
    skillName: string;
    isCustom: boolean;
    completedAt: string;
    measurableOutcome: string;
  }>;
  generalTrainingComplete: boolean;
}

/** Suggested endpoint: GET ${TNA_URL}/growth-plan/performance-feed?fiscalYearId= */
export type GrowthPlanPerformanceFeed = GrowthPlanPerformanceFeedItem[];
