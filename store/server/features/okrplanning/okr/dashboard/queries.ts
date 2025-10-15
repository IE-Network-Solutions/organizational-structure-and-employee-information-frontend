import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_URL, ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';

interface Dashboard {
  daysLeft: number;
  okrCompleted: number;
  userOkr: number;
  teamOkr: number;
  companyOkr: number;
  keyResultCount: number;
  supervisorOkr?: number;
  supervisorKeyResultAchieved?: number;
  supervisorKeyResultCount?: number;
}

type ResponseData = Dashboard;

/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getObjectiveDashboardByUser = async (id: number | string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_URL}/okr-total-summary/user/dashboard/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getPlanningPeriods = async () => {
  const token = await getCurrentToken();
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

const getActiveMonth = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/month/active/month`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getAllUsersAverageScoreByDate = async (
  startDate: string,
  endDate: string,
  page: number = 1,
  limit: number = 5,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${OKR_URL}/average-score`,
    method: 'POST',
    data: {
      startDate,
      endDate,
      page: page.toString(),
      limit: limit.toString(),
    },
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getUserAverageScoreByDate = async (
  userId: string,
  startDate: string,
  endDate: string,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  return crudRequest({
    url: `${OKR_URL}/average-score/user/${userId}`,
    method: 'POST',
    data: {
      startDate,
      endDate,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const getPerformance = async (planningPeriodId: string, userId: string) => {
  const token = await getCurrentToken();
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
  const token = await getCurrentToken();
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
  const token = await getCurrentToken();
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

const getDueSoonKeyResults = async (userId: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_URL}/objective/${userId}?page=1&limit=100&metricTypeId=`,
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

export const useGetActiveMonth = () => {
  const tenantId = useAuthenticationStore.getState().tenantId;
  return useQuery('activeMonth', getActiveMonth, {
    keepPreviousData: true,
    enabled: !!tenantId,
  });
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

export const useGetAllUsersAverageScoreByDate = (
  params: { startDate: string; endDate: string; page?: number; limit?: number },
  options: any = {},
) => {
  const tenantId = useAuthenticationStore.getState().tenantId;
  return useQuery(
    [
      'allUsersAverageScoreByDate',
      params.startDate,
      params.endDate,
      params.page,
      params.limit,
    ],
    () =>
      getAllUsersAverageScoreByDate(
        params.startDate,
        params.endDate,
        params.page || 1,
        params.limit || 5,
      ),
    {
      keepPreviousData: true,
      enabled: !!tenantId && !!params.startDate && !!params.endDate,
      ...options,
    },
  );
};

export const useGetUserAverageScoreByDate = (
  params: {
    userId: string;
    startDate: string;
    endDate: string;
    page?: number;
    limit?: number;
  },
  options: any = {},
) => {
  const tenantId = useAuthenticationStore.getState().tenantId;
  return useQuery(
    [
      'userAverageScoreByDate',
      params.userId,
      params.startDate,
      params.endDate,
      params.page,
      params.limit,
    ],
    () =>
      getUserAverageScoreByDate(
        params.userId,
        params.startDate,
        params.endDate,
      ),
    {
      keepPreviousData: true,
      enabled:
        !!tenantId && !!params.userId && !!params.startDate && !!params.endDate,
      ...options,
    },
  );
};

export const useGetVariablePay = (monthIds: string[]) => {
  return useQuery(['variablePay', monthIds], () => getVariablePay(monthIds), {
    keepPreviousData: true,
  });
};

export const useGetDueSoonKeyResults = (userId: string) => {
  const tenantId = useAuthenticationStore.getState().tenantId;
  return useQuery(
    ['DueSoonKeyResults', userId],
    () => getDueSoonKeyResults(userId),
    {
      keepPreviousData: true,
      enabled: !!tenantId && !!userId,
    },
  );
};
