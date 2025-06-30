import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL, RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import axios from 'axios';

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
const getAllJobs = async (
  whatYouNeed?: string,
  currentPage?: number,
  pageSize?: number
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId,
  };

  const queryParams = new URLSearchParams();

  if (whatYouNeed) queryParams.append('jobTitle', whatYouNeed);
  if (pageSize) queryParams.append('limit', pageSize.toString());
  if (currentPage) queryParams.append('page', currentPage.toString());

  const queryString = queryParams.toString();
  const url = `${RECRUITMENT_URL}/job-information${queryString ? `?${queryString}` : ''}`;

  return await crudRequest({
    url,
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
    url: `${ORG_AND_EMP_URL}/departments/${depId}`,
    method: 'GET',
    headers,
  });
};

const downloadJobCandidatesExcel = async (
  jobId: string,
  params: {
    name?: string;
    dateRange?: string;
    jobInformationId?: string;
    applicantStatusStageId?: string;
    departmentId?: string;
    limit?: number;
    page?: number;
  },
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
    requestedBy: userId,
    createdBy: userId,
  };

  // Build query parameters
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const queryString = queryParams.toString();
  const url = `${RECRUITMENT_URL}/job-candidate-information/job-information/${jobId}/export${queryString ? `?${queryString}` : ''}`;

  const response = await axios({
    url,
    method: 'GET',
    headers,
    responseType: 'json', // Changed from 'blob' to 'json'
  });

  return response.data;
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
export const useGetAllJobs = (
  whatYouNeed: string,
  currentPage?: number,
  pageSize?: number,
) => {
  return useQuery(['jobs', whatYouNeed, currentPage, pageSize], () =>
    getAllJobs(whatYouNeed, currentPage, pageSize),
  );
};

export const useGetJobsByID = (jobId: string) => {
  return useQuery(['jobs', jobId], () => getJobsByID(jobId));
};

export const useGetDepartmentByID = (depId: string) => {
  return useQuery(['department', depId], () => getDepartmentById(depId));
};

export const useDownloadJobCandidatesExcel = () => {
  return useQuery(
    ['downloadJobCandidatesExcel'],
    () => downloadJobCandidatesExcel('', {}),
    {
      enabled: false, // Don't run automatically, only when triggered
    },
  );
};

// Export the function for direct use
export { downloadJobCandidatesExcel };
