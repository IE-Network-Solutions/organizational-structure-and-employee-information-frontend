import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const getJobs = async (
  whatYouNeed: string,
  currentPage: number,
  pageSize: number,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  const jobTitleQuery = whatYouNeed ? `jobTitle=${whatYouNeed}&` : '';

  return await crudRequest({
    url: `${RECRUITMENT_URL}/job-information?${jobTitleQuery}limit=${pageSize ? pageSize : 4}&&page=${currentPage ? currentPage : 1}`,
    method: 'GET',
    headers,
  });
};

const getJobsByID = async (jobId: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/job-information/${jobId}`,
    method: 'GET',
    headers,
  });
};

const getDepartmentById = async (depId: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/departments/${depId}`,
    method: 'GET',
    headers,
  });
};

export const useGetJobs = (
  whatYouNeed: string,
  currentPage: number,
  pageSize: number,
) => {
  return useQuery(['jobs', whatYouNeed, currentPage, pageSize], () =>
    getJobs(whatYouNeed, currentPage, pageSize),
  );
};

export const useGetJobsByID = (jobId: string) => {
  return useQuery(['jobs', jobId], () => getJobsByID(jobId));
};

export const useGetDepartmentByID = (depId: string) => {
  return useQuery(['department', depId], () => getDepartmentById(depId));
};
