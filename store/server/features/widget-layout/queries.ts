import { useQuery } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import type {
  DashboardPlanKey,
  DashboardWidgetLayoutResponse,
} from './interface';
import {
  isDashboardLayoutForUser,
  normalizeDashboardWidgetLayout,
} from './normalize';

export { normalizeDashboardWidgetLayout };

export const dashboardWidgetLayoutKey = (
  userId: string,
  planKey: DashboardPlanKey,
) => ['dashboard', 'widget-layout', userId, planKey];

const getDashboardWidgetLayout = async (
  planKey: DashboardPlanKey,
  fallbackUserId: string,
): Promise<DashboardWidgetLayoutResponse> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const raw = await crudRequest({
    url: `${ORG_AND_EMP_URL}/dashboard-widget-layouts/${planKey}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId,
    },
  });

  const normalized = normalizeDashboardWidgetLayout(
    raw,
    planKey,
    fallbackUserId,
  );

  if (!isDashboardLayoutForUser(normalized, fallbackUserId)) {
    throw new Error(
      'Dashboard layout belongs to a different user and will not be applied.',
    );
  }

  return normalized;
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
  useQuery<DashboardWidgetLayoutResponse>(
    dashboardWidgetLayoutKey(userId, planKey),
    () => getDashboardWidgetLayout(planKey, userId),
    {
      enabled: Boolean(userId),
      // Edits are saved from this tab, so background refetching would only
      // fight with saves still in flight.
      refetchOnWindowFocus: false,
      // But always re-ask on mount: signing in as someone else reuses this
      // cache (login is a client-side push and the cache is never cleared), so
      // a cached layout must never be trusted for a fresh mount.
      refetchOnMount: 'always',
      staleTime: 0,
    },
  );
