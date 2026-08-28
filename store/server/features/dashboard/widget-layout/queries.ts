import { useQuery } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import type { DashboardPlanKey, DashboardWidgetLayoutRow } from './interface';

export const dashboardWidgetLayoutKey = (
  userId: string,
  planKey: DashboardPlanKey,
) => ['dashboard', 'widget-layout', userId, planKey];

const getDashboardWidgetLayout = async (
  planKey: DashboardPlanKey,
): Promise<DashboardWidgetLayoutRow[]> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${ORG_AND_EMP_URL}/dashboard-widget-layouts/${planKey}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId,
    },
  });
};

/**
 * The saved dashboard arrangement for the signed-in user on this plan. An empty
 * list means they have never customized it, so the caller falls back to that
 * plan's default layout.
 */
export const useGetDashboardWidgetLayout = (
  userId: string,
  planKey: DashboardPlanKey,
) =>
  useQuery<DashboardWidgetLayoutRow[]>(
    dashboardWidgetLayoutKey(userId, planKey),
    () => getDashboardWidgetLayout(planKey),
    {
      enabled: Boolean(userId),
      // The layout only changes from this tab, and stale refetches would fight
      // with edits that are still being saved.
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  );
