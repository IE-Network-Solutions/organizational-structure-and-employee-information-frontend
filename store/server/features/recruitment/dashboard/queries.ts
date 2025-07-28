import { useQuery } from 'react-query';
import { crudRequest } from '@/utils/crudRequest';
import { RECRUITMENT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { DASHBOARD_API } from './api';

// For /job-information/dashboard
const getRecruitmentDashboard = async () => {
    return await crudRequest({
        url: `${RECRUITMENT_URL}/${DASHBOARD_API.GET_RECRUITMENT_DASHBOARD_API}`,
        method: 'GET',
        headers: requestHeader(),
    });
};

export const useGetRecruitmentDashboard = () => {
    return useQuery(
        ['recruitmentDashboard'],
        () => getRecruitmentDashboard(),
        {
            enabled: true,
        },
    );
};

// For /job-information/stages
const getRecruitmentStages = async (params?: { jobId?: string, stages?: string }) => {
    return await crudRequest({
        url: `${RECRUITMENT_URL}/${DASHBOARD_API.GET_RECRUITMENT_STAGES_API}`,
        method: 'GET',
        headers: requestHeader(),
        params,
    });
};

export const useGetRecruitmentStages = (params?: { jobId?: string, stages?: string }) => {
    return useQuery(['recruitmentStages', params], () => getRecruitmentStages(params),
        {
            enabled: true,
        });
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
    return await crudRequest({
        url: `${RECRUITMENT_URL}/${DASHBOARD_API.GET_JOB_POST_PERFORMANCE_API}`,
        method: 'GET',
        headers: requestHeader(),
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
    return await crudRequest({
        url: `${RECRUITMENT_URL}/${DASHBOARD_API.GET_RECRUITMENT_PIPELINE_API}`,
        method: 'GET',
        headers: requestHeader(),
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
    return await crudRequest({
        url: `${RECRUITMENT_URL}/${DASHBOARD_API.GET_HIRED_APPLICANT_TREND_API}`,
        method: 'GET',
        headers: requestHeader(),
    });
};

export const useGetHiredApplicantTrend = () => {
    return useQuery(['hiredApplicantTrend'], () => getHiredApplicantTrend(),
        {
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
    return await crudRequest({
        url: `${RECRUITMENT_URL}/${DASHBOARD_API.GET_JOB_POST_PERFORMANCE_EXPORT_API}`,
        method: 'GET',
        headers: requestHeader(),
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
    return await crudRequest({
        url: `${RECRUITMENT_URL}/${DASHBOARD_API.GET_RECRUITMENT_PIPELINE_EXPORT_API}`,
        method: 'GET',
        headers: requestHeader(),
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
