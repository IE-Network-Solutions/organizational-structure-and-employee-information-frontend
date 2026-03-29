export interface ActionPlansDashboard {
  sessionId: string;
  monthId: string | null;
  total: number;
  resolved: number;
  pending: number;
  unresolved: number;
  resolvedPercentage: number;
  resolvedPercentagePointDifferenceFromPreviousMonth: number | null;
}
