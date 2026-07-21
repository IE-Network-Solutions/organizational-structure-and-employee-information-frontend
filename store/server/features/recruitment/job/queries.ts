import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  CORE_API_URL,
  ORG_AND_EMP_URL,
  RECRUITMENT_URL,
} from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';

const getJobs = async (
  whatYouNeed: string,
  currentPage: number,
  pageSize: number,
  filters?: {
    department?: string;
    employmentType?: string;
    status?: string;
    location?: string;
    createdDate?: string;
    closedDate?: string;
  },
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  const queryParams = new URLSearchParams();

  if (whatYouNeed) queryParams.append('jobTitle', whatYouNeed);
  if (filters?.department)
    queryParams.append('departmentId', filters.department);
  if (filters?.employmentType)
    queryParams.append('employmentType', filters.employmentType);
  if (filters?.status) queryParams.append('jobStatus', filters.status);
  if (filters?.location) queryParams.append('jobLocation', filters.location);
  if (filters?.createdDate)
    queryParams.append('createdDate', filters.createdDate);
  if (filters?.closedDate) queryParams.append('closedDate', filters.closedDate);
  queryParams.append('limit', String(pageSize ? pageSize : 4));
  queryParams.append('page', String(currentPage ? currentPage : 1));

  return await crudRequest({
    url: `${RECRUITMENT_URL}/job-information?${queryParams.toString()}`,
    method: 'GET',
    headers,
  });
};
const getAllJobs = async (
  whatYouNeed?: string,
  currentPage?: number,
  pageSize?: number,
) => {
  const token = await getCurrentToken();
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
  const token = await getCurrentToken();
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
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  return await crudRequest({
    url: `${CORE_API_URL}/departments/${depId}`,
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
  const token = await getCurrentToken();
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

  const response = await crudRequest({
    url,
    method: 'GET',
    headers,
    responseType: 'json', // Backend returns JSON with downloadUrl
  });

  return response;
};

export const useGetJobs = (
  whatYouNeed: string,
  currentPage: number,
  pageSize: number,
  filters?: {
    department?: string;
    employmentType?: string;
    status?: string;
    location?: string;
    createdDate?: string;
    closedDate?: string;
  },
  options?: any,
) => {
  return useQuery(
    ['jobs', whatYouNeed, currentPage, pageSize, filters],
    () => getJobs(whatYouNeed, currentPage, pageSize, filters),
    options,
  );
};
export const useGetAllJobs = (
  whatYouNeed: string,
  currentPage?: number,
  pageSize?: number,
  options?: any,
) => {
  return useQuery(
    ['jobs', whatYouNeed, currentPage, pageSize],
    () => getAllJobs(whatYouNeed, currentPage, pageSize),
    options,
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
