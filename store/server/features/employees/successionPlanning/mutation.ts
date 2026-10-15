import { useMutation, useQueryClient } from 'react-query';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { SUCCESSION_KEYS } from './queries';
import type {
  ApiCriticalRole,
  ApiCriticalRolePayload,
  ApiDevelopmentPlan,
  ApiEvaluationScorePayload,
  ApiFieldOfStudy,
  ApiGapStatus,
  ApiIdpActivityType,
  ApiSuccessorGap,
  ApiSuccessorGapAction,
} from './types';

const authHeaders = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return {
    Authorization: `Bearer ${token}`,
    tenantId,
  };
};

const request = async <T>(
  method: 'POST' | 'PATCH' | 'DELETE',
  path: string,
  data?: unknown,
): Promise<T> =>
  crudRequest({
    url: `${ORG_AND_EMP_URL}/succession-planning${path}`,
    method,
    data,
    headers: await authHeaders(),
  });

/**
 * Invalidate everything a write can touch.
 *
 * Gaps are recalculated server-side on almost every mutation (a new score, a
 * new evaluator, an edited qualification), so a narrow invalidation would leave
 * stale severities on screen.
 */
const useSuccessionInvalidator = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries(SUCCESSION_KEYS.roles);
    queryClient.invalidateQueries(SUCCESSION_KEYS.role);
    queryClient.invalidateQueries(SUCCESSION_KEYS.successor);
    queryClient.invalidateQueries(SUCCESSION_KEYS.assessment);
    queryClient.invalidateQueries(SUCCESSION_KEYS.gaps);
    queryClient.invalidateQueries(SUCCESSION_KEYS.developmentPlan);
    queryClient.invalidateQueries(SUCCESSION_KEYS.evaluatorAssignments);
    queryClient.invalidateQueries(SUCCESSION_KEYS.roleKpis);
    queryClient.invalidateQueries(SUCCESSION_KEYS.evaluatorKpis);
    queryClient.invalidateQueries(SUCCESSION_KEYS.reports);
  };
};

const notifyError = (error: unknown, fallback: string) => {
  const message =
    (error as { response?: { data?: { message?: string | string[] } } })
      ?.response?.data?.message ?? fallback;
  NotificationMessage.error({
    message: 'Something went wrong',
    description: Array.isArray(message) ? message.join(' ') : String(message),
  });
};

// ── Critical roles ──────────────────────────────────────────────────────────

export const useCreateCriticalRole = () => {
  const invalidate = useSuccessionInvalidator();
  return useMutation(
    (payload: ApiCriticalRolePayload) =>
      request<ApiCriticalRole>('POST', '/critical-roles', payload),
    {
      onSuccess: () => {
        invalidate();
        NotificationMessage.success({
          message: 'Critical role created',
          description:
            'Assigned evaluators have been notified of their evaluations.',
        });
      },
      onError: (error) => notifyError(error, 'Failed to create critical role'),
    },
  );
};

export const useUpdateCriticalRole = () => {
  const invalidate = useSuccessionInvalidator();
  return useMutation(
    ({ id, payload }: { id: string; payload: ApiCriticalRolePayload }) =>
      request<ApiCriticalRole>('PATCH', `/critical-roles/${id}`, payload),
    {
      onSuccess: () => {
        invalidate();
        NotificationMessage.success({
          message: 'Critical role updated',
          description: 'The critical role has been updated successfully.',
        });
      },
      onError: (error) => notifyError(error, 'Failed to update critical role'),
    },
  );
};

export const useDeleteCriticalRole = () => {
  const invalidate = useSuccessionInvalidator();
  return useMutation(
    (id: string) => request<void>('DELETE', `/critical-roles/${id}`),
    {
      onSuccess: () => {
        invalidate();
        NotificationMessage.success({
          message: 'Critical role deleted',
          description: 'The critical role has been removed.',
        });
      },
      onError: (error) => notifyError(error, 'Failed to delete critical role'),
    },
  );
};

// ── Successor assessment ────────────────────────────────────────────────────

export const useUpdateSuccessor = () => {
  const invalidate = useSuccessionInvalidator();
  return useMutation(
    ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        readiness?: string;
        educationLevel?: string;
        educationField?: string;
        relevantExperience?: number;
        currentPositionId?: string;
      };
    }) => request('PATCH', `/successors/${id}`, payload),
    {
      onSuccess: () => invalidate(),
      onError: (error) => notifyError(error, 'Failed to update successor'),
    },
  );
};

/** PM marks a non-exact field of study as related (role must permit it). */
export const useSetEducationRelated = () => {
  const invalidate = useSuccessionInvalidator();
  return useMutation(
    ({ id, accepted }: { id: string; accepted: boolean }) =>
      request('PATCH', `/successors/${id}/education-related`, { accepted }),
    {
      onSuccess: (data, variables) => {
        invalidate();
        NotificationMessage.success({
          message: variables.accepted
            ? 'Marked as related field'
            : 'Related field mark removed',
          description: 'Gaps have been recalculated.',
        });
      },
      onError: (error) =>
        notifyError(error, 'Failed to update the field of study acceptance'),
    },
  );
};

export const useRemoveSuccessor = () => {
  const invalidate = useSuccessionInvalidator();
  return useMutation((id: string) => request('DELETE', `/successors/${id}`), {
    onSuccess: () => invalidate(),
    onError: (error) => notifyError(error, 'Failed to remove successor'),
  });
};

// ── Evaluators and scores ───────────────────────────────────────────────────

/** Assigning an evaluator notifies them; reassigning clears the old score. */
export const useAssignEvaluators = () => {
  const invalidate = useSuccessionInvalidator();
  return useMutation(
    ({
      successorId,
      assignments,
    }: {
      successorId: string;
      assignments: Array<{
        competencyCriteriaId: string;
        evaluatorId: string;
      }>;
    }) =>
      request('POST', `/successors/${successorId}/evaluators`, { assignments }),
    {
      onSuccess: () => {
        invalidate();
        NotificationMessage.success({
          message: 'Evaluators assigned',
          description: 'Each assigned evaluator has been notified.',
        });
      },
      onError: (error) => notifyError(error, 'Failed to assign evaluators'),
    },
  );
};

export const useSubmitEvaluation = () => {
  const invalidate = useSuccessionInvalidator();
  return useMutation(
    ({
      successorId,
      evaluatorId,
      scores,
    }: {
      successorId: string;
      evaluatorId?: string;
      scores: ApiEvaluationScorePayload[];
    }) =>
      request('POST', `/successors/${successorId}/evaluations`, {
        evaluatorId,
        scores,
      }),
    {
      onSuccess: () => {
        invalidate();
        NotificationMessage.success({
          message: 'Evaluation saved',
          description: 'Scores recorded and gaps recalculated.',
        });
      },
      onError: (error) => notifyError(error, 'Failed to save the evaluation'),
    },
  );
};

// ── Gaps and development actions ────────────────────────────────────────────

export const useRecalculateGaps = () => {
  const invalidate = useSuccessionInvalidator();
  return useMutation(
    (successorId: string) =>
      request<ApiSuccessorGap[]>(
        'POST',
        `/successors/${successorId}/gaps/recalculate`,
      ),
    {
      onSuccess: () => {
        invalidate();
        NotificationMessage.success({
          message: 'Gaps recalculated',
          description: 'Readiness gaps are up to date.',
        });
      },
      onError: (error) => notifyError(error, 'Failed to recalculate gaps'),
    },
  );
};

export const useUpdateGapStatus = () => {
  const invalidate = useSuccessionInvalidator();
  return useMutation(
    ({ id, status }: { id: string; status: ApiGapStatus }) =>
      request<ApiSuccessorGap>('PATCH', `/gaps/${id}`, { status }),
    {
      onSuccess: () => invalidate(),
      onError: (error) => notifyError(error, 'Failed to update the gap status'),
    },
  );
};

export const useCreateDevelopmentAction = () => {
  const invalidate = useSuccessionInvalidator();
  return useMutation(
    ({
      successorId,
      payload,
    }: {
      successorId: string;
      payload: {
        actionItem: string;
        responsiblePersonId?: string;
        targetCompletionDate?: string;
        completionDate?: string;
        status?: string;
        remark?: string;
        successorGapId?: string;
      };
    }) =>
      request<ApiSuccessorGapAction>(
        'POST',
        `/successors/${successorId}/development-actions`,
        payload,
      ),
    {
      onSuccess: () => {
        invalidate();
        NotificationMessage.success({
          message: 'Development action added',
          description: 'The action has been added to the plan.',
        });
      },
      onError: (error) =>
        notifyError(error, 'Failed to add the development action'),
    },
  );
};

export const useUpdateDevelopmentAction = () => {
  const invalidate = useSuccessionInvalidator();
  return useMutation(
    ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      request<ApiSuccessorGapAction>(
        'PATCH',
        `/development-actions/${id}`,
        payload,
      ),
    {
      onSuccess: () => invalidate(),
      onError: (error) =>
        notifyError(error, 'Failed to update the development action'),
    },
  );
};

export const useDeleteDevelopmentAction = () => {
  const invalidate = useSuccessionInvalidator();
  return useMutation(
    (id: string) => request('DELETE', `/development-actions/${id}`),
    {
      onSuccess: () => invalidate(),
      onError: (error) =>
        notifyError(error, 'Failed to delete the development action'),
    },
  );
};

// ── Individual Development Plan ─────────────────────────────────────────────

export const useUpsertDevelopmentPlan = () => {
  const invalidate = useSuccessionInvalidator();
  return useMutation(
    ({ successorId, status }: { successorId: string; status?: string }) =>
      request<ApiDevelopmentPlan>(
        'PATCH',
        `/successors/${successorId}/development-plan`,
        { status },
      ),
    {
      onSuccess: () => invalidate(),
      onError: (error) =>
        notifyError(error, 'Failed to update the development plan'),
    },
  );
};

export const useAddIdpActivity = () => {
  const invalidate = useSuccessionInvalidator();
  return useMutation(
    ({
      successorId,
      payload,
    }: {
      successorId: string;
      payload: {
        type: string;
        title: string;
        notes?: string;
        targetDate?: string;
        status?: string;
        linkedActionIds?: string[];
      };
    }) =>
      request<ApiDevelopmentPlan>(
        'POST',
        `/successors/${successorId}/development-plan/activities`,
        payload,
      ),
    {
      onSuccess: () => {
        invalidate();
        NotificationMessage.success({
          message: 'Activity added',
          description: 'The activity has been added to the IDP.',
        });
      },
      onError: (error) => notifyError(error, 'Failed to add the activity'),
    },
  );
};

export const useUpdateIdpActivity = () => {
  const invalidate = useSuccessionInvalidator();
  return useMutation(
    ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      request('PATCH', `/development-plan-activities/${id}`, payload),
    {
      onSuccess: () => invalidate(),
      onError: (error) => notifyError(error, 'Failed to update the activity'),
    },
  );
};

export const useDeleteIdpActivity = () => {
  const invalidate = useSuccessionInvalidator();
  return useMutation(
    (id: string) => request('DELETE', `/development-plan-activities/${id}`),
    {
      onSuccess: () => invalidate(),
      onError: (error) => notifyError(error, 'Failed to delete the activity'),
    },
  );
};

// ── Catalogs ────────────────────────────────────────────────────────────────

/** Registers a field of study typed into the role wizard's select. */
export const useCreateFieldOfStudy = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (payload: { name: string; description?: string }) =>
      request<ApiFieldOfStudy>('POST', '/fields-of-study', payload),
    {
      onSuccess: () =>
        queryClient.invalidateQueries(SUCCESSION_KEYS.fieldsOfStudy),
      onError: (error) =>
        notifyError(error, 'Failed to add the field of study'),
    },
  );
};

/** Registers a custom IDP activity type so it survives a reload. */
export const useCreateIdpActivityType = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (payload: { name: string }) =>
      request<ApiIdpActivityType>('POST', '/idp-activity-types', payload),
    {
      onSuccess: () =>
        queryClient.invalidateQueries(SUCCESSION_KEYS.activityTypes),
      onError: (error) => notifyError(error, 'Failed to add the activity type'),
    },
  );
};
