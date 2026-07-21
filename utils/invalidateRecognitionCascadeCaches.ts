import type { QueryClient } from 'react-query';

const REFETCH_OPTS = { refetchActive: true, refetchInactive: true } as const;

/**
 * Backend cascade deletes related recognition types / recognitions / incentives.
 * Invalidate every frontend cache that displays those entities so incentive
 * totals, child counts, and lists update without a hard refresh.
 */
export function invalidateRecognitionTypeCascadeCaches(
  queryClient: QueryClient,
): Promise<unknown[]> {
  return Promise.all([
    // Recognition type trees / lists
    queryClient.invalidateQueries('recognitionTypes', REFETCH_OPTS),
    queryClient.invalidateQueries('recognitionTypesWithRelations', REFETCH_OPTS),
    queryClient.invalidateQueries('parentRecognition', REFETCH_OPTS),
    queryClient.invalidateQueries('allChildRecognition', REFETCH_OPTS),
    queryClient.invalidateQueries('childRecognition', REFETCH_OPTS),
    queryClient.invalidateQueries('recognitionTypesChild', REFETCH_OPTS),
    queryClient.invalidateQueries('recognitionTypeParentChild', REFETCH_OPTS),
    queryClient.invalidateQueries('recognitionTypeChild', REFETCH_OPTS),
    queryClient.invalidateQueries(
      'recognitionTypeParentWithChildren',
      REFETCH_OPTS,
    ),
    queryClient.invalidateQueries('recognitionById', REFETCH_OPTS),
    // Recognitions
    queryClient.invalidateQueries('recognitions', REFETCH_OPTS),
    queryClient.invalidateQueries(
      'recognitionsByParentRecognitionType',
      REFETCH_OPTS,
    ),
    queryClient.invalidateQueries(
      'allRecognitionIdsByParentType',
      REFETCH_OPTS,
    ),
    // Incentive calculation / totals / formulas
    queryClient.invalidateQueries(['getAllIncentiveData'], REFETCH_OPTS),
    queryClient.invalidateQueries(['allIncentiveIds'], REFETCH_OPTS),
    queryClient.invalidateQueries('allIncentiveCards', REFETCH_OPTS),
    queryClient.invalidateQueries('useDetail', REFETCH_OPTS),
    queryClient.invalidateQueries('incentiveFormula', REFETCH_OPTS),
    queryClient.invalidateQueries('incentiveCriteria', REFETCH_OPTS),
    // Dashboard / payroll summary
    queryClient.invalidateQueries('recognitionTypeDashboardStats', REFETCH_OPTS),
    queryClient.invalidateQueries('totalRecognition', REFETCH_OPTS),
    queryClient.invalidateQueries('incentivizeRecognition', REFETCH_OPTS),
    queryClient.invalidateQueries('incentiveSummery', REFETCH_OPTS),
  ]);
}

/** Cascade: deleting a recognition also removes its linked incentive. */
export function invalidateRecognitionCascadeCaches(
  queryClient: QueryClient,
): Promise<unknown[]> {
  return Promise.all([
    queryClient.invalidateQueries('recognitions', REFETCH_OPTS),
    queryClient.invalidateQueries(
      'recognitionsByParentRecognitionType',
      REFETCH_OPTS,
    ),
    queryClient.invalidateQueries(
      'allRecognitionIdsByParentType',
      REFETCH_OPTS,
    ),
    queryClient.invalidateQueries(['getAllIncentiveData'], REFETCH_OPTS),
    queryClient.invalidateQueries(['allIncentiveIds'], REFETCH_OPTS),
    queryClient.invalidateQueries('allIncentiveCards', REFETCH_OPTS),
    queryClient.invalidateQueries('useDetail', REFETCH_OPTS),
    queryClient.invalidateQueries('recognitionTypeDashboardStats', REFETCH_OPTS),
    queryClient.invalidateQueries('totalRecognition', REFETCH_OPTS),
    queryClient.invalidateQueries('incentivizeRecognition', REFETCH_OPTS),
    queryClient.invalidateQueries('incentiveSummery', REFETCH_OPTS),
  ]);
}

/** Direct incentive delete — refresh totals and related cards. */
export function invalidateIncentiveCaches(
  queryClient: QueryClient,
): Promise<unknown[]> {
  return Promise.all([
    queryClient.invalidateQueries(['getAllIncentiveData'], REFETCH_OPTS),
    queryClient.invalidateQueries(['allIncentiveIds'], REFETCH_OPTS),
    queryClient.invalidateQueries('allIncentiveCards', REFETCH_OPTS),
    queryClient.invalidateQueries('useDetail', REFETCH_OPTS),
    queryClient.invalidateQueries('incentiveSummery', REFETCH_OPTS),
    queryClient.invalidateQueries('incentivizeRecognition', REFETCH_OPTS),
  ]);
}
