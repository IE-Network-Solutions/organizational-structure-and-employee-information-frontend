import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';
import type { ActionPlansDashboard } from './interface';

const getActionPlansDashboard = async (
  sessionId: string,
  monthId: string,
  type: string | null | undefined,
): Promise<ActionPlansDashboard> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const params = new URLSearchParams({
    sessionId,
    monthId,
    ...(type != null ? { type } : {}),
  });
  const res = await crudRequest({
    url: `${ORG_DEV_URL}/action-plans/dashboard?${params.toString()}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId,
    },
  });
  return res as ActionPlansDashboard;
};

export const useGetActionPlansDashboard = (
  sessionId: string | null | undefined,
  monthId: string | null | undefined,
  type: string | null | undefined,
) => {
  return useQuery<ActionPlansDashboard>(
    ['actionPlansDashboard', sessionId, monthId, type],
    () =>
      getActionPlansDashboard(
        sessionId as string,
        monthId as string,
        type as string,
      ),
    {
      enabled: Boolean(sessionId && monthId),
    },
  );
};

export { getActionPlansDashboard };
