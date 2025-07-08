import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { RECRUITMENT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const getCandidates = async (
  jobId: string,
  whatYouNeed: string,
  dateRange: string,
  selectedJob: string,
  selectedStage: string,
  selectedDepartment: string,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const pageSize = useCandidateState.getState().pageSize;
  const currentPage = useCandidateState.getState().currentPage;

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/job-candidate-information/job-information/${jobId}?name=${whatYouNeed}&&dateRange=${dateRange}&&jobInformationId=${selectedJob}&&applicantStatusStageId=${selectedStage}&&departmentId=${selectedDepartment}&&limit=${pageSize}&&page=${currentPage}`,
    method: 'GET',
    headers,
  });
};

const getAllCandidates = async (
  whatYouNeed: string,
  dateRange: string,
  selectedJob: string,
  selectedStage: string,
  selectedDepartment: string,
) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const pageSize = useCandidateState.getState().pageSize;
  const currentPage = useCandidateState.getState().currentPage;
  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/job-candidate-information?name=${whatYouNeed}&&dateRange=${dateRange}&&jobInformationId=${selectedJob}&&applicantStatusStageId=${selectedStage}&&departmentId=${selectedDepartment}&&limit=${pageSize}&&page=${currentPage}`,
    method: 'GET',
    headers,
  });
};

const getCandidateById = async (candidateId: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/job-candidate-information/${candidateId}`,
    method: 'GET',
    headers,
  });
};

const getTalentPoolCategory = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/talent-pool-category`,
    method: 'GET',
    headers,
  });
};
const getStages = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/applicant-status-stages`,
    method: 'GET',
    headers,
  });
};

export const useGetCandidates = (
  jobId: string,
  whatYouNeed: string,
  dateRange: string,
  selectedJob: string,
  selectedStage: string,
  selectedDepartment: string,
) => {
  return useQuery(
    [
      'candidates',
      jobId,
      whatYouNeed,
      dateRange,
      selectedJob,
      selectedStage,
      selectedDepartment,
    ],
    () =>
      getCandidates(
        jobId,
        whatYouNeed,
        dateRange,
        selectedJob,
        selectedStage,
        selectedDepartment,
      ),
  );
};

export const useGetCandidateById = (candidateId: string) => {
  return useQuery(['candidate', candidateId], () =>
    getCandidateById(candidateId),
  );
};

export const useGetAllCandidates = (
  whatYouNeed: string,
  dateRange: string,
  selectedJob: string,
  selectedStage: string,
  selectedDepartment: string,
) => {
  return useQuery(
    [
      'allCandidates',
      whatYouNeed,
      dateRange,
      selectedJob,
      selectedStage,
      selectedDepartment,
    ],
    () =>
      getAllCandidates(
        whatYouNeed,
        dateRange,
        selectedJob,
        selectedStage,
        selectedDepartment,
      ),
  );
};

export const useGetTalentPoolCategory = () => {
  return useQuery('TalentPoolCategory', getTalentPoolCategory);
};

export const useGetStages = () => {
  return useQuery('stages', getStages);
};
