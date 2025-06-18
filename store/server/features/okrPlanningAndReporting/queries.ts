import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { AssignedPlanningPeriodLogArray } from './interface';
interface DataType {
  userId: string[] | [] | string;
  planPeriodId: string;
  page?: number;
  pageSize?: number;
  pageReporting?: number;
  pageSizeReporting?: number;
}

const getPlanningData = async (params: DataType) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  if (params?.page) {
    return await crudRequest({
      url: `${OKR_URL}/plan-tasks/users/${params?.planPeriodId}?page=${params?.page}&limit=${params.pageSize}`,
      method: 'post',
      data: params?.userId.length === 0 ? [''] : params?.userId,
      headers,
    });
  }
  return await crudRequest({
    url: `${OKR_URL}/plan-tasks/users/${params?.planPeriodId}`,
    method: 'post',
    data: params?.userId.length === 0 ? [''] : params?.userId,
    headers,
  });
};
const getUserPlanningData = async (planPeriodId: string, forPlan: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${OKR_URL}/plan/find-all-plans/users/${userId}/planning-period/${planPeriodId}?forPlan=${forPlan}`,
    method: 'get',
    headers,
  });
};
const getPlanningPeriodsHierarchy = async (
  userId: string,
  planningPeriodId: string,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${OKR_URL}/planning-periods/parent-hierarchy/${planningPeriodId}/user/${userId}`,
    method: 'get',
    headers,
  });
};

const getAllUnReportedPlanningTask = async (
  planningPeriodId: string | undefined,
  forPlan: number,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${OKR_URL}/okr-report-task/users/${userId}/planning-period/${planningPeriodId}?forPlan=${forPlan}`,
    method: 'get',
    headers,
  });
};

const getAllPlannedTasksForReport = async (
  planningPeriodId: string | undefined,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${OKR_URL}/plan-tasks/planned-data/un-reported-plan-tasks/${userId}/planning-period/${planningPeriodId}`,
    method: 'get',
    headers,
  });
};
const getAllReportedPlanningTask = async (planId: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${OKR_URL}/plan-tasks/get-reported-plan-tasks/by-plan-id/${planId}`,
    method: 'get',
    headers,
  });
};
const getPlanningDataById = async (planningId: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${OKR_URL}/plan-tasks/${planningId}`,
    method: 'get',
    headers,
  });
};

const getReportingData = async (params: DataType) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${OKR_URL}/okr-report/by-planning-period/${params?.planPeriodId}?page=${params?.pageReporting}&limit=${params.pageSizeReporting}`,
    method: 'post',
    data: params?.userId.length === 0 ? [''] : params?.userId,
    headers,
  });
};

const getReportingDataById = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${OKR_URL}/okr-report/${id}`,
    method: 'get',
    headers,
  });
};

const getAllPlanningPeriods = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${OKR_URL}/planning-periods/assignment/assigneduser/${userId}`,
    method: 'GET',
    headers,
  });
};

export const AllPlanningPeriods = () => {
  return useQuery<AssignedPlanningPeriodLogArray>(
    'planningPeriods',
    getAllPlanningPeriods,
  );
};

const getDefaultPlanningPeriods = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${OKR_URL}/planning-periods`,
    method: 'GET',
    headers,
  });
};

export const useDefaultPlanningPeriods = () => {
  return useQuery('defaultPlanningPeriods', getDefaultPlanningPeriods);
};

export const useGetPlanning = (params: DataType) => {
  return useQuery<any>(['okrPlans', params], () => getPlanningData(params), {
    enabled:
      params &&
      params.userId !== undefined &&
      params.planPeriodId !== undefined &&
      params.planPeriodId !== '',
  });
};
export const useGetUserPlanning = (planPeriodId: string, forPlan: string) => {
  return useQuery<any>(
    ['okrPlans', planPeriodId, forPlan],
    () => getUserPlanningData(planPeriodId, forPlan),
    {
      enabled: planPeriodId !== undefined && planPeriodId !== '',
    },
  );
};

export const useGetPlanningPeriodsHierarchy = (
  userId: string,
  planningPeriodId: string,
) => {
  return useQuery<any>(
    ['planningPeriodsHierarchy', { userId, planningPeriodId }],
    () => getPlanningPeriodsHierarchy(userId, planningPeriodId),
    {
      enabled: !!userId && !!planningPeriodId, // Ensure both are truthy
    },
  );
};

export const useGetPlanningById = (planningId: string) => {
  return useQuery<any>(
    ['okrPlan', planningId],
    () => getPlanningDataById(planningId),
    {
      enabled: planningId !== null && planningId !== '',
    },
  );
};
export const useGetReporting = (params: DataType) => {
  return useQuery<any>(['okrReports', params], () => getReportingData(params), {
    enabled: !!params?.planPeriodId, // Enable the query only when planningPeriodId is defined
  });
};

export const useGetReportingById = (id: string) => {
  return useQuery<any>(['okrReport', id], () => getReportingDataById(id), {
    enabled: !!id, // Enable the query only when planningPeriodId is defined
  });
};

export const useGetUnReportedPlanning = (
  planningPeriodId: string | undefined,
  forPlan: number,
) => {
  return useQuery<any>(
    ['okrPlan', planningPeriodId],
    () => getAllUnReportedPlanningTask(planningPeriodId, forPlan),
    {
      enabled: !!planningPeriodId, // Enable the query only when planningPeriodId is defined
    },
  );
};
export const useGetPlannedTaskForReport = (
  planningPeriodId: string | undefined,
) => {
  return useQuery<any>(
    ['okrPlannedData', planningPeriodId],
    () => getAllPlannedTasksForReport(planningPeriodId),
    {
      enabled: !!planningPeriodId, // Enable the query only when planningPeriodId is defined
    },
  );
};
export const useGetReportedPlanning = (planId: string) => {
  return useQuery<any>(
    ['okrReport', planId],
    () => getAllReportedPlanningTask(planId),
    {
      enabled: !!planId, // Enable the query only when planningPeriodId is defined
    },
  );
};
