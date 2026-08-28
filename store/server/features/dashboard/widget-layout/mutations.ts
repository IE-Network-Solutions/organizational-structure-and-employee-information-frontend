import { useMutation, useQueryClient } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { dashboardWidgetLayoutKey } from './queries';
import type {
  DashboardPlanKey,
  DashboardWidgetLayoutRow,
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
  payload: SaveDashboardWidgetLayoutPayload,
): Promise<DashboardWidgetLayoutRow[]> =>
  crudRequest({
    url: `${ORG_AND_EMP_URL}/dashboard-widget-layouts`,
    method: 'PUT',
    data: payload,
    headers: await authHeaders(),
  });

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
    onSuccess: (rows, payload) => {
      queryClient.setQueryData(
        dashboardWidgetLayoutKey(userId, payload.plan),
        rows,
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
      queryClient.setQueryData(dashboardWidgetLayoutKey(userId, planKey), []);
    },
  });
};
