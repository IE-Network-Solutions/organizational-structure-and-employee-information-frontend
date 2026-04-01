export interface ActionPlanTopOwner {
  id: string;
  name: string;
  surveyCount: number;
  meetingCount: number;
  resolvedPercentage: number;
  jobTitle: string;
  profileImageUrl: string | null;
  total: number;
}

export interface ActionPlansDashboard {
  sessionId: string;
  monthId: string | null;
  total: number;
  resolved: number;
  pending: number;
  unresolved: number;
  resolvedPercentage: number;
  resolvedPercentagePointDifferenceFromPreviousMonth: number | null;
  topOwners?: ActionPlanTopOwner[];
}
