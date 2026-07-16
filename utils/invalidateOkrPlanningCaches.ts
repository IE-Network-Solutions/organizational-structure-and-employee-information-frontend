import type { QueryClient } from 'react-query';

const REFETCH_OPTS = { refetchActive: true, refetchInactive: true } as const;

/**
 * Invalidate every query that feeds OKR objectives and Plan & Report KR progress.
 * Plan/report edits update backend KR metrics; without ObjectiveInformation invalidation
 * the Plan & Report left panel keeps stale progress until an unrelated action refetches.
 */
export function invalidateOkrPlanningCaches(
  queryClient: QueryClient,
): Promise<unknown[]> {
  return Promise.all([
    queryClient.invalidateQueries(['okrPlans'], REFETCH_OPTS),
    queryClient.invalidateQueries('okrUserPlans', REFETCH_OPTS),
    queryClient.invalidateQueries('okrReports', REFETCH_OPTS),
    queryClient.invalidateQueries('okrReport', REFETCH_OPTS),
    queryClient.invalidateQueries('okrPlan', REFETCH_OPTS),
    queryClient.invalidateQueries('okrPlannedData', REFETCH_OPTS),
    queryClient.invalidateQueries('planningPeriodsHierarchy', REFETCH_OPTS),
    queryClient.invalidateQueries('fetchObjectives', REFETCH_OPTS),
    queryClient.invalidateQueries('ObjectiveInformation', REFETCH_OPTS),
    queryClient.invalidateQueries('teamObjectiveInformation', REFETCH_OPTS),
    queryClient.invalidateQueries('companyObjectiveInformation', REFETCH_OPTS),
    queryClient.invalidateQueries('keyResult', REFETCH_OPTS),
    queryClient.invalidateQueries('keyResultForEdit', REFETCH_OPTS),
  ]);
}
