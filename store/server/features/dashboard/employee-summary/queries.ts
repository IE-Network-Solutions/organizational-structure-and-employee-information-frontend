import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { TIME_AND_ATTENDANCE_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';

import type {
  DashboardEmployeeSummaryFilter,
  DashboardEmployeeSummaryResponse,
} from './interface';

const getDashboardEmployeeSummary = async (
  filter: DashboardEmployeeSummaryFilter,
): Promise<DashboardEmployeeSummaryResponse> => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  if (!token || !tenantId) {
    throw new Error('Missing authentication information.');
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId,
  };

  return crudRequest({
    url: `${TIME_AND_ATTENDANCE_URL}/dashboard/employee-summary`,
    method: 'POST',
    headers,
    data: filter,
  });
};

export const useGetDashboardEmployeeSummary = (userId: string | undefined) =>
  useQuery<DashboardEmployeeSummaryResponse>(
    ['dashboard', 'employee-summary', userId],
    () =>
      getDashboardEmployeeSummary({
        userIds: userId ? [userId] : [],
      }),
    {
      enabled: Boolean(userId),
      keepPreviousData: true,
    },
  );
