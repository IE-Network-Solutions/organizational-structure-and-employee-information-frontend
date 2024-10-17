import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
interface DataType {
  userId: string[] | [];
  planPeriodId: string;
}
const getPlanningData = async (params: DataType) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${OKR_URL}/plan-tasks/users/${params?.planPeriodId}`,
    method: 'post',
    data: params?.userId.length === 0 ? [''] : params?.userId,
    headers,
  });
};

const getAllUnReportedPlanningTask = async (
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
    url: `${OKR_URL}/okr-report-task/users/${userId}/planning-period/${planningPeriodId}`,
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
    url: `${OKR_URL}/okr-report/by-planning-period/${params?.planPeriodId}`,
    method: 'post',
    data: params?.userId.length === 0 ? [''] : params?.userId,
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
  return useQuery<any>('planningPeriods', getAllPlanningPeriods);
};

export const useGetPlanning = (params: DataType) => {
  return useQuery<any>(['okrPlans', params], () => getPlanningData(params));
};

export const useGetPlanningById = (planningId: string) => {
  return useQuery<any>(
    ['okrPlans', planningId],
    () => getPlanningDataById(planningId),
    {
      enabled: planningId !== null && planningId !== '',
    },
  );
};
export const useGetReporting = (params: DataType) => {
  return useQuery<any>(['okrReports', params], () => getReportingData(params));
};

export const useGetUnReportedPlanning = (
  planningPeriodId: string | undefined,
) => {
  return useQuery<any>(
    ['okrReports', planningPeriodId],
    () => getAllUnReportedPlanningTask(planningPeriodId),
    {
      enabled: !!planningPeriodId, // Enable the query only when planningPeriodId is defined
    },
  );
};
