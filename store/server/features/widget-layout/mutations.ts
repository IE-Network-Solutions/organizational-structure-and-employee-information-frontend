import { useMutation, useQueryClient } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { dashboardWidgetLayoutKey } from './queries';
import {
  isDashboardLayoutForUser,
  normalizeDashboardWidgetLayout,
} from './normalize';
import type {
  DashboardPlanKey,
  DashboardWidgetLayoutResponse,
  SaveDashboardWidgetLayoutPayload,
} from './interface';

const authHeaders = async () => {
  const token = await getCurrentToken();
  return {
    Authorization: `Bearer ${token}`,
    tenantId: useAuthenticationStore.getState().tenantId,
  };
};

const saveDashboardWidgetLayout = async (
  payload: SaveDashboardWidgetLayoutPayload & { fallbackUserId: string },
): Promise<DashboardWidgetLayoutResponse> => {
  const { fallbackUserId, ...body } = payload;
  const raw = await crudRequest({
    url: `${ORG_AND_EMP_URL}/dashboard-widget-layouts`,
    method: 'PUT',
    data: body,
    headers: await authHeaders(),
  });

  const normalized = normalizeDashboardWidgetLayout(
    raw,
    body.plan,
    fallbackUserId,
  );

  if (!isDashboardLayoutForUser(normalized, fallbackUserId)) {
    throw new Error(
      'Dashboard layout belongs to a different user and will not be applied.',
    );
  }

  return normalized;
};

const resetDashboardWidgetLayout = async (planKey: DashboardPlanKey) =>
  crudRequest({
    url: `${ORG_AND_EMP_URL}/dashboard-widget-layouts/${planKey}`,
    method: 'DELETE',
    headers: await authHeaders(),
  });

/** Replaces the whole stored layout for one plan. */
export const useSaveDashboardWidgetLayout = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation(saveDashboardWidgetLayout, {
    onSuccess: (response, payload) => {
      queryClient.setQueryData(
        dashboardWidgetLayoutKey(userId, payload.plan),
        response,
      );
    },
  });
};

/** Clears the customization so the plan falls back to its default layout. */
export const useResetDashboardWidgetLayout = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation(resetDashboardWidgetLayout, {
    onSuccess: (unusedResult, planKey) => {
      void unusedResult;
      // Drop the entry rather than writing an empty one, so the next mount
      // refetches and re-learns which user the layout belongs to.
      queryClient.removeQueries(dashboardWidgetLayoutKey(userId, planKey));
    },
  });
};
