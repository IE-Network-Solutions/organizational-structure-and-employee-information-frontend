import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import { RECRUITMENT } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const getJobs = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const pageSize = useJobState.getState().pageSize;
  const currentPage = useJobState.getState().currentPage;
  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  return await crudRequest({
    url: `${RECRUITMENT}/job-information?limit=${pageSize}&&page=${currentPage}`,
    // url: `http://172.16.33.228:8010/api/v1/job-information?limit=${pageSize}&&page=${currentPage}`,
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
    url: `${RECRUITMENT}/job-information/${jobId}`,
    // url: `http://172.16.33.228:8010/api/v1/job-information/${jobId}`,
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
    url: `${RECRUITMENT}/departments/${depId}`,
    // url: `http://172.16.33.228:8010/api/v1/departments/${depId}`,
    method: 'GET',
    headers,
  });
};

export const useGetJobs = () => {
  return useQuery('jobs', getJobs);
};

export const useGetJobsByID = (jobId: string) => {
  return useQuery(['jobs', jobId], () => getJobsByID(jobId));
};

export const useGetDepartmentByID = (depId: string) => {
  return useQuery(['department', depId], () => getDepartmentById(depId));
};
