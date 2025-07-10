import { useQuery } from 'react-query';
import { crudRequest } from '@/utils/crudRequest';
import { RECRUITMENT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { DASHBOARD_API } from './api';

// For /job-information/dashboard
const getRecruitmentDashboard = async (params: {
    startDate?: string;
    endDate?: string;
}) => {
    return await crudRequest({
        url: `${RECRUITMENT_URL}/${DASHBOARD_API.GET_RECRUITMENT_DASHBOARD_API}`,
        method: 'GET',
        headers: requestHeader(),
        params,
    });
};

export const useGetRecruitmentDashboard = (params: {
    startDate?: string;
    endDate?: string;
}) => {
    return useQuery(
        ['recruitmentDashboard', params],
        () => getRecruitmentDashboard(params),
        {
            enabled: !!params.startDate && !!params.endDate,
        },
    );
};

// For /job-information/stages
const getRecruitmentStages = async () => {
    return await crudRequest({
        url: `${RECRUITMENT_URL}/${DASHBOARD_API.GET_RECRUITMENT_STAGES_API}`,
        method: 'GET',
        headers: requestHeader(),
    });
};

export const useGetRecruitmentStages = () => {
    return useQuery(['recruitmentStages'], getRecruitmentStages);
};

// For /job-information/jobPostPerformance
const getJobPostPerformance = async (params: {
    page?: number;
    limit?: number;
}) => {
    return await crudRequest({
        url: `${RECRUITMENT_URL}/${DASHBOARD_API.GET_JOB_POST_PERFORMANCE_API}`,
        method: 'GET',
        headers: requestHeader(),
        params,
    });
};

export const useGetJobPostPerformance = (params: {
    page?: number;
    limit?: number;
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
    search?: string;
    departmentId?: string;
    stageId?: string;
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
    search?: string;
    departmentId?: string;
    stageId?: string;
    jobId?: string;
    page?: number;
    limit?: number;
}) => {
    return useQuery(['recruitmentPipeline', params], () =>
        getRecruitmentPipeline(params),
    );
}; 