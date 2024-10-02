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
    // url: `${RECRUITMENT}/job-information`,
    url: `http://172.16.33.228:8010/api/v1/job-information?limit=${pageSize}&&page=${currentPage}`,
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
    // url: `${RECRUITMENT}/job-information/${jobId}`,
    url: `http://172.16.33.228:8010/api/v1/job-information/${jobId}`,
    method: 'GET',
    headers,
  });
};

const fetchPublicJob = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  return await crudRequest({
    // url: `${RECRUITMENT}/job-information/public`,
    url: `https://mocki.io/v1/8b78d9ee-4358-4087-9638-59a8ed16b5d4`,
    method: 'GET',
    headers,
  });
};

export const useGetJobs = () => {
  return useQuery('jobs', getJobs);
};

export const useGetJobsByID = (jobId: string) => {
  return useQuery(['job', jobId], () => getJobsByID(jobId));
};

export const useFetchPublicJob = () => {
  return useQuery('publicJob', fetchPublicJob);
};
