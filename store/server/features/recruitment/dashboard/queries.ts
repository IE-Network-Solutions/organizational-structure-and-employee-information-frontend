import { useQuery } from 'react-query';
import { crudRequest } from '@/utils/crudRequest';
import { RECRUITMENT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { DASHBOARD_API } from './api';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import axios from 'axios';
import { useMutation } from 'react-query';

// For /job-information/dashboard

const getRecruitmentDashboard = async () => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${RECRUITMENT_URL}/${DASHBOARD_API.GET_RECRUITMENT_DASHBOARD_API}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetRecruitmentDashboard = () => {
  return useQuery(['recruitmentDashboard'], () => getRecruitmentDashboard(), {
    enabled: true,
  });
};

// For /job-information/stages
const getRecruitmentStages = async (params?: {
  jobId?: string;
  stages?: string;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${RECRUITMENT_URL}/${DASHBOARD_API.GET_RECRUITMENT_STAGES_API}`,
    method: 'GET',
    headers: requestHeaders,
    params,
  });
};

export const useGetRecruitmentStages = (params?: {
  jobId?: string;
  stages?: string;
}) => {
  return useQuery(
    ['recruitmentStages', params],
    () => getRecruitmentStages(params),
    {
      enabled: true,
    },
  );
};

// For /job-information/jobPostPerformance
const getJobPostPerformance = async (params: {
  jobTitle?: string;
  departmentId?: string;
  stages?: string;
  jobId?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${RECRUITMENT_URL}/${DASHBOARD_API.GET_JOB_POST_PERFORMANCE_API}`,
    method: 'GET',
    headers: requestHeaders,
    params,
  });
};

export const useGetJobPostPerformance = (params: {
  jobTitle?: string;
  departmentId?: string;
  stages?: string;
  jobId?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery(
    ['jobPostPerformance', params],
    () => getJobPostPerformance(params),
    {
      enabled: !!params.page && !!params.limit,
    },
  );
};

// For /job-information/recruitmentPipeline
const getRecruitmentPipeline = async (params: {
  candidateName?: string;
  departmentId?: string;
  stages?: string;
  jobId?: string;
  page?: number;
  limit?: number;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${RECRUITMENT_URL}/${DASHBOARD_API.GET_RECRUITMENT_PIPELINE_API}`,
    method: 'GET',
    headers: requestHeaders,
    params,
  });
};

export const useGetRecruitmentPipeline = (params: {
  candidateName?: string;
  departmentId?: string;
  stages?: string;
  jobId?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery(['recruitmentPipeline', params], () =>
    getRecruitmentPipeline(params),
  );
};
const getHiredApplicantTrend = async () => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${RECRUITMENT_URL}/${DASHBOARD_API.GET_HIRED_APPLICANT_TREND_API}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetHiredApplicantTrend = () => {
  return useQuery(['hiredApplicantTrend'], () => getHiredApplicantTrend(), {
    enabled: true,
  });
};

// For /job-information/jobPostPerformanceExport
const getJobPostPerformanceExport = async (params: {
  jobTitle?: string;
  departmentId?: string;
  stages?: string;
  jobId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${RECRUITMENT_URL}/${DASHBOARD_API.GET_JOB_POST_PERFORMANCE_EXPORT_API}`,
    method: 'GET',
    headers: requestHeaders,
    params,
  });
};

export const useGetJobPostPerformanceExport = (params: {
  jobTitle?: string;
  departmentId?: string;
  stages?: string;
  jobId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery(
    ['jobPostPerformanceExport', params],
    () => getJobPostPerformanceExport(params),
    {
      enabled: true,
    },
  );
};

// For /job-information/recruitmentPipelineExport
const getRecruitmentPipelineExport = async (params: {
  candidateName?: string;
  departmentId?: string;
  stages?: string;
  jobId?: string;
}) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${RECRUITMENT_URL}/${DASHBOARD_API.GET_RECRUITMENT_PIPELINE_EXPORT_API}`,
    method: 'GET',
    headers: requestHeaders,
    params,
  });
};

export const useGetRecruitmentPipelineExport = (params: {
  candidateName?: string;
  departmentId?: string;
  stages?: string;
  jobId?: string;
}) => {
  return useQuery(
    ['recruitmentPipelineExport', params],
    () => getRecruitmentPipelineExport(params),
    {
      enabled: true,
    },
  );
};

// Export function for file download
const downloadRecruitmentPipelineExport = async (params: {
  candidateName?: string;
  departmentId?: string;
  stages?: string;
  jobId?: string;
}) => {
  try {
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
    const url = `${RECRUITMENT_URL}/${DASHBOARD_API.GET_RECRUITMENT_PIPELINE_EXPORT_API}${queryString ? `?${queryString}` : ''}`;

    const response = await axios({
      url,
      method: 'GET',
      headers,
      responseType: 'blob', // Important for file download!
    });

    // Create blob from response data
    const blob = new Blob([response.data], {
      type:
        response.headers['content-type'] ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Create download link
    const url2 = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Get filename from content-disposition header or use default
    const disposition = response.headers['content-disposition'];
    let fileName = `recruitment-pipeline-${new Date().toISOString().split('T')[0]}.xlsx`;

    if (disposition && disposition.includes('filename=')) {
      fileName = disposition.split('filename=')[1].replace(/"/g, '');
    }

    link.href = url2;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url2);

    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const useDownloadRecruitmentPipelineExport = () => {
  return useMutation({
    mutationFn: downloadRecruitmentPipelineExport,
  });
};

// Export function for job post performance file download
const downloadJobPostPerformanceExport = async (params: {
  jobTitle?: string;
  departmentId?: string;
  stages?: string;
  jobId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  try {
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
    const url = `${RECRUITMENT_URL}/${DASHBOARD_API.GET_JOB_POST_PERFORMANCE_EXPORT_API}${queryString ? `?${queryString}` : ''}`;

    // First, get the download URL from the API
    const response = await axios({
      url,
      method: 'GET',
      headers,
      responseType: 'json', // Changed to json to get the response with downloadUrl
    });

    // Extract download URL and filename from response
    const { downloadUrl, fileName } = response.data;

    if (!downloadUrl) {
      throw new Error('Download URL not found in response');
    }

    // Download the file using the provided URL
    const fileResponse = await axios({
      url: downloadUrl,
      method: 'GET',
      responseType: 'blob',
    });

    // Create blob from response data
    const blob = new Blob([fileResponse.data], {
      type:
        fileResponse.headers['content-type'] ||
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Create download link
    const downloadUrl2 = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = downloadUrl2;
    link.download =
      fileName ||
      `job-post-performance-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl2);

    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const useDownloadJobPostPerformanceExport = () => {
  return useMutation({
    mutationFn: downloadJobPostPerformanceExport,
  });
};
