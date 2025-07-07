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

const getPerformance = async (planningPeriodId: string, userId: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_URL}/okr-report/performance/user?planningPeriodId=${planningPeriodId}&&userId=${userId}`,
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

const getVariablePay = async (monthIds: string[]) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_URL}/vp-score-instance/filter?monthIds=${monthIds}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useGetUserObjectiveDashboard = (postId: number | string) => {
  const tenantId = useAuthenticationStore.getState().tenantId;
  return useQuery<ResponseData>(
    ['ObjectiveDashboard', postId],
    () => getObjectiveDashboardByUser(postId),
    {
      keepPreviousData: true,
      enabled: !!tenantId,
    },
  );
};

export const useGetPlanningPeriods = () => {
  return useQuery('periods', getPlanningPeriods);
};

export const useGetRockStars = (planningPeriodId: string, options: any) => {
  return useQuery(
    ['rockStars', planningPeriodId],
    () => getRockStars(planningPeriodId),
    {
      ...options,
      keepPreviousData: true,
    },
  );
};

export const useGetPerformance = (planningPeriodId: string, userId: string) => {
  return useQuery(
    ['performance', planningPeriodId, userId],
    () => getPerformance(planningPeriodId, userId),
    {
      keepPreviousData: true,
    },
  );
};

export const useGetVariablePay = (monthIds: string[]) => {
  return useQuery(['variablePay', monthIds], () => getVariablePay(monthIds), {
    keepPreviousData: true,
  });
};
