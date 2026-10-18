import type { QueryClient } from 'react-query';

const REFETCH_OPTS = { refetchActive: true, refetchInactive: true } as const;

/**
 * Backend cascade deletes related recognition types / recognitions / incentives.
 * Settings → Recognition uses `recognitionTypesWithRelations`; CFR → Recognition
 * cards and Incentives → Incentive KPI/category cards use other keys and must
 * be actively cleared + refetched so totals and type counts stay exact.
 */
export function invalidateRecognitionTypeCascadeCaches(
  queryClient: QueryClient,
  deletedRecognitionTypeId?: string | null,
): Promise<unknown[]> {
  const id =
    deletedRecognitionTypeId != null && String(deletedRecognitionTypeId)
      ? String(deletedRecognitionTypeId)
      : null;

  if (id) {
    queryClient.removeQueries(['recognitionById', id]);
    queryClient.removeQueries(['childRecognition', id]);
    queryClient.removeQueries(['recognitionTypeParentChild', id]);
    queryClient.removeQueries(['recognitionTypes', id]);
    queryClient.removeQueries(['incentiveFormula', id]);
    queryClient.removeQueries(['allIncentiveCards', id]);
    queryClient.removeQueries({
      predicate: (q) => {
        const key = q.queryKey;
        if (!Array.isArray(key) || key.length < 2) return false;
        const root = key[0];
        return (
          (root === 'recognitionTypeChild' ||
            root === 'getAllIncentiveData') &&
          key.some((part) => part === id)
        );
      },
    });
  }

  // Drop whole list/stat caches so cards never keep a deleted row / stale total.
  queryClient.removeQueries('recognitionTypeParentWithChildren');
  queryClient.removeQueries('recognitionTypeDashboardStats');
  queryClient.removeQueries('parentRecognition');
  queryClient.removeQueries('allChildRecognition');
  queryClient.removeQueries('getAllIncentiveData');
  queryClient.removeQueries('allIncentiveCards');
  queryClient.removeQueries('useDetail');
  queryClient.removeQueries('incentiveSummery');
  queryClient.removeQueries('incentivizeRecognition');

  return Promise.all([
    // Recognition type trees / lists
    queryClient.invalidateQueries('recognitionTypes', REFETCH_OPTS),
    queryClient.invalidateQueries('recognitionTypesWithRelations', REFETCH_OPTS),
    queryClient.invalidateQueries('recognitionTypesWithOutCriteria', REFETCH_OPTS),
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
    queryClient.invalidateQueries('getAllRecognition', REFETCH_OPTS),
    queryClient.invalidateQueries('criteria', REFETCH_OPTS),
    queryClient.invalidateQueries('personalRecognition', REFETCH_OPTS),
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
    queryClient.invalidateQueries('getAllIncentiveData', REFETCH_OPTS),
    queryClient.invalidateQueries('allIncentiveIds', REFETCH_OPTS),
    queryClient.invalidateQueries('allIncentiveCards', REFETCH_OPTS),
    queryClient.invalidateQueries('useDetail', REFETCH_OPTS),
    queryClient.invalidateQueries('incentiveFormula', REFETCH_OPTS),
    queryClient.invalidateQueries('incentiveCriteria', REFETCH_OPTS),
    // Dashboard / payroll summary + CFR Recognition top stats
    queryClient.invalidateQueries('recognitionTypeDashboardStats', REFETCH_OPTS),
    queryClient.invalidateQueries('totalRecognition', REFETCH_OPTS),
    queryClient.invalidateQueries('incentivizeRecognition', REFETCH_OPTS),
    queryClient.invalidateQueries('incentiveSummery', REFETCH_OPTS),
    // Force the card surfaces to refetch immediately.
    queryClient.refetchQueries('parentRecognition', REFETCH_OPTS),
    queryClient.refetchQueries('allChildRecognition', REFETCH_OPTS),
    queryClient.refetchQueries('recognitionTypesWithRelations', REFETCH_OPTS),
    queryClient.refetchQueries('getAllIncentiveData', REFETCH_OPTS),
    queryClient.refetchQueries('allIncentiveCards', REFETCH_OPTS),
    queryClient.refetchQueries('useDetail', REFETCH_OPTS),
    queryClient.refetchQueries(
      'recognitionTypeParentWithChildren',
      REFETCH_OPTS,
    ),
    queryClient.refetchQueries('recognitionTypeDashboardStats', REFETCH_OPTS),
    queryClient.refetchQueries('totalRecognition', REFETCH_OPTS),
    queryClient.refetchQueries('incentivizeRecognition', REFETCH_OPTS),
    queryClient.refetchQueries('incentiveSummery', REFETCH_OPTS),
  ]);
}

/** Cascade: deleting a recognition also removes its linked incentive. */
export function invalidateRecognitionCascadeCaches(
  queryClient: QueryClient,
): Promise<unknown[]> {
  queryClient.removeQueries('getAllIncentiveData');
  queryClient.removeQueries('recognitionTypeDashboardStats');
  queryClient.removeQueries('allIncentiveCards');
  queryClient.removeQueries('useDetail');
  queryClient.removeQueries('incentiveSummery');

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
    queryClient.invalidateQueries('getAllRecognition', REFETCH_OPTS),
    queryClient.invalidateQueries('getAllIncentiveData', REFETCH_OPTS),
    queryClient.invalidateQueries('allIncentiveIds', REFETCH_OPTS),
    queryClient.invalidateQueries('allIncentiveCards', REFETCH_OPTS),
    queryClient.invalidateQueries('useDetail', REFETCH_OPTS),
    queryClient.invalidateQueries('recognitionTypeDashboardStats', REFETCH_OPTS),
    queryClient.invalidateQueries('totalRecognition', REFETCH_OPTS),
    queryClient.invalidateQueries('incentivizeRecognition', REFETCH_OPTS),
    queryClient.invalidateQueries('incentiveSummery', REFETCH_OPTS),
    queryClient.invalidateQueries('personalRecognition', REFETCH_OPTS),
    queryClient.refetchQueries('getAllIncentiveData', REFETCH_OPTS),
    queryClient.refetchQueries('allIncentiveCards', REFETCH_OPTS),
    queryClient.refetchQueries('useDetail', REFETCH_OPTS),
    queryClient.refetchQueries(
      'recognitionsByParentRecognitionType',
      REFETCH_OPTS,
    ),
    queryClient.refetchQueries('recognitionTypeDashboardStats', REFETCH_OPTS),
    queryClient.refetchQueries('totalRecognition', REFETCH_OPTS),
    queryClient.refetchQueries('incentiveSummery', REFETCH_OPTS),
  ]);
}

/** Direct incentive delete — refresh totals and related cards. */
export function invalidateIncentiveCaches(
  queryClient: QueryClient,
): Promise<unknown[]> {
  queryClient.removeQueries('getAllIncentiveData');
  queryClient.removeQueries('allIncentiveCards');
  queryClient.removeQueries('useDetail');
  queryClient.removeQueries('incentiveSummery');
  queryClient.removeQueries('recognitionTypeDashboardStats');

  return Promise.all([
    queryClient.invalidateQueries('getAllIncentiveData', REFETCH_OPTS),
    queryClient.invalidateQueries('allIncentiveIds', REFETCH_OPTS),
    queryClient.invalidateQueries('allIncentiveCards', REFETCH_OPTS),
    queryClient.invalidateQueries('useDetail', REFETCH_OPTS),
    queryClient.invalidateQueries('incentiveSummery', REFETCH_OPTS),
    queryClient.invalidateQueries('incentivizeRecognition', REFETCH_OPTS),
    queryClient.invalidateQueries('recognitionTypeDashboardStats', REFETCH_OPTS),
    queryClient.refetchQueries('getAllIncentiveData', REFETCH_OPTS),
    queryClient.refetchQueries('allIncentiveCards', REFETCH_OPTS),
    queryClient.refetchQueries('useDetail', REFETCH_OPTS),
    queryClient.refetchQueries('recognitionTypeDashboardStats', REFETCH_OPTS),
  ]);
}
