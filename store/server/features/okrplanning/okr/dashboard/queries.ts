import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

interface Dashboard {
  daysLeft: number;
  okrCompleted: number;
  userOkr: number;
  teamOkr: number;
  companyOkr: number;
  keyResultCount: number;
  supervisorOkr?: number;
}

type ResponseData = Dashboard;

/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getObjectiveDashboardByUser = async (id: number | string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_URL}/objective/user/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getPlanningPeriods = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_URL}/planning-periods`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getRockStars = async (planningPeriodId: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_URL}/okr-report/rock-star/user?planningPeriodId=${planningPeriodId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useGetUserObjectiveDashboard = (postId: number | string) => {
  return useQuery<ResponseData>(
    ['ObjectiveDashboard', postId],
    () => getObjectiveDashboardByUser(postId),
    {
      keepPreviousData: true,
    },
  );
};

export const useGetPlanningPeriods = () => {
  return useQuery('periods', getPlanningPeriods);
};

export const useGetRockStars = (planningPeriodId: string) => {
  return useQuery(
    ['rockStars', planningPeriodId],
    () => getRockStars(planningPeriodId),
    {
      keepPreviousData: true,
    },
  );
};
