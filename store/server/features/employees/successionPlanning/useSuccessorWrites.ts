'use client';
import type {
  DevelopmentAction,
  IdpActivity,
  IdpPlanStatus,
} from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/successionTypes';
import type { SuccessorAssessmentValues } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/successorAssessmentModal';
import type { GapStatus } from '@/app/(afterLogin)/(employeeInformation)/employees/succession-planning/_components/successionTypes';
import {
  useAddIdpActivity,
  useAssignEvaluators,
  useCreateDevelopmentAction,
  useDeleteDevelopmentAction,
  useRecalculateGaps,
  useSetEducationRelated,
  useSubmitEvaluation,
  useUpdateDevelopmentAction,
  useUpdateGapStatus,
  useUpdateIdpActivity,
  useUpdateSuccessor,
  useUpsertDevelopmentPlan,
} from './mutation';

/**
 * API-backed write handlers for one successor, shaped to match the callbacks
 * the successor detail components already expose.
 *
 * The panels below (`SuccessorGapsPanel`, `DevelopmentActionsPanel`,
 * `IdpPanel`, …) keep their existing prop signatures — only the implementation
 * moved from local zustand mutations to real API calls, so nothing about the
 * approved layout changed.
 *
 * `successorId` is the backend nomination row id, which `mapCriticalRole`
 * already puts on `successor.id`.
 */
export const useSuccessorWrites = (successorId: string) => {
  const updateSuccessor = useUpdateSuccessor();
  const setEducationRelated = useSetEducationRelated();
  const recalculateGaps = useRecalculateGaps();
  const updateGapStatus = useUpdateGapStatus();
  const createAction = useCreateDevelopmentAction();
  const updateAction = useUpdateDevelopmentAction();
  const deleteAction = useDeleteDevelopmentAction();
  const upsertPlan = useUpsertDevelopmentPlan();
  const addActivity = useAddIdpActivity();
  const updateActivity = useUpdateIdpActivity();
  const assignEvaluators = useAssignEvaluators();
  const submitEvaluation = useSubmitEvaluation();

  return {
    /** Edit assessment — the server re-derives readiness and gaps. */
    updateProfile: (values: SuccessorAssessmentValues) =>
      updateSuccessor.mutateAsync({
        id: successorId,
        payload: {
          educationLevel: values.educationLevel,
          educationField: values.educationField,
          relevantExperience: values.relevantExperience,
          currentPositionId: values.currentPositionId,
          readiness: values.readiness,
        },
      }),

    setEducationRelated: (accepted: boolean) =>
      setEducationRelated.mutateAsync({ id: successorId, accepted }),

    recalculateGaps: () => recalculateGaps.mutateAsync(successorId),

    updateGapStatus: (gapId: string, status: GapStatus) =>
      updateGapStatus.mutateAsync({ id: gapId, status }),

    addAction: (action: Omit<DevelopmentAction, 'id'>) => {
      // Actions hang off a gap; the panels always supply the gap they came from.
      if (!action.gapId) {
        return Promise.reject(
          new Error('A development action must be attached to a gap'),
        );
      }
      return createAction.mutateAsync({
        gapId: action.gapId,
        payload: {
          actionItem: action.actionItem,
          responsiblePersonId: action.responsiblePersonId || undefined,
          targetCompletionDate: action.targetCompletionDate || undefined,
          completionDate: action.completionDate || undefined,
          status: action.status,
          remark: action.remarks || undefined,
        },
      });
    },

    updateAction: (actionId: string, patch: Partial<DevelopmentAction>) =>
      updateAction.mutateAsync({
        id: actionId,
        payload: {
          ...(patch.actionItem !== undefined && {
            actionItem: patch.actionItem,
          }),
          ...(patch.responsiblePersonId !== undefined && {
            responsiblePersonId: patch.responsiblePersonId || undefined,
          }),
          ...(patch.targetCompletionDate !== undefined && {
            targetCompletionDate: patch.targetCompletionDate || undefined,
          }),
          ...(patch.completionDate !== undefined && {
            completionDate: patch.completionDate || undefined,
          }),
          ...(patch.status !== undefined && { status: patch.status }),
          // The UI calls this field `remarks`; the API column is `remark`.
          ...(patch.remarks !== undefined && {
            remark: patch.remarks || undefined,
          }),
        },
      }),

    deleteAction: (actionId: string) => deleteAction.mutateAsync(actionId),

    upsertPlan: (plan: { status: IdpPlanStatus }) =>
      upsertPlan.mutateAsync({ successorId, status: plan.status }),

    addActivity: (activity: Omit<IdpActivity, 'id'>) =>
      addActivity.mutateAsync({
        successorId,
        payload: {
          type: activity.type,
          title: activity.title,
          notes: activity.notes,
          targetDate: activity.targetDate,
          status: activity.status,
          linkedActionIds: activity.linkedActionIds,
        },
      }),

    updateActivity: (activityId: string, patch: Partial<IdpActivity>) =>
      updateActivity.mutateAsync({ id: activityId, payload: { ...patch } }),

    /** Assign one competency's evaluator; the evaluator is notified. */
    assignEvaluator: (competencyCriteriaId: string, evaluatorId: string) =>
      assignEvaluators.mutateAsync({
        successorId,
        assignments: [{ competencyCriteriaId, evaluatorId }],
      }),

    submitEvaluation: (
      scores: Array<{
        competencyCriteriaId: string;
        rating: number;
        comment?: string;
      }>,
      evaluatorId?: string,
    ) => submitEvaluation.mutateAsync({ successorId, evaluatorId, scores }),

    isSaving:
      updateSuccessor.isLoading ||
      setEducationRelated.isLoading ||
      recalculateGaps.isLoading ||
      updateGapStatus.isLoading ||
      createAction.isLoading ||
      updateAction.isLoading ||
      deleteAction.isLoading ||
      upsertPlan.isLoading ||
      addActivity.isLoading ||
      updateActivity.isLoading ||
      assignEvaluators.isLoading ||
      submitEvaluation.isLoading,
  };
};
