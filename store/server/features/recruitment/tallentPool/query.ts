import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { RECRUITMENT_URL } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  ApplicantStatusResponse,
  TalentPool,
  TalentPoolResponse,
} from '@/types/dashboard/recruitment/talentPool';
import { getCurrentToken } from '@/utils/getCurrentToken';

// Fetch token and tenantId from the authentication store

const tenantId = useAuthenticationStore.getState().tenantId;

/**
 * Fetch all talent pool data from the API.
 * @returns Promise with the list of talent pool candidates.
 */
const getAllTalentPool = async (
  dateRange: string,
  department: string,
  job: string,
  stages: string,
  talentPoolCategory: string,
  pageSize: number,
  currentPage: number,
) => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/talent-pool?department=${department}&jobDeadline=${dateRange ?? null}&&talentPoolCategoryId=${talentPoolCategory}&&jobTitle=${job}&&status=${stages}&limit=${pageSize}&page=${currentPage}`,
    method: 'GET',
    headers,
  });
};

const getAllCandidates = async () => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/job-candidate-information`,
    method: 'GET',
    headers,
  });
};

/**
 * Fetch a specific talent pool candidate by ID from the API.
 * @param id - ID of the talent pool candidate to fetch.
 * @returns Promise with the candidate's data.
 */
const getTalentPoolCandidate = async (id: string) => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/job/candidates/${id}`,
    method: 'GET',
    headers,
  });
};

const getApplicantStatusStages = async () => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${RECRUITMENT_URL}/applicant-status-stages/`,
    method: 'GET',
    headers,
  });
};

/**
 * Custom hook to fetch all talent pool candidates.
 * Uses React Query's useQuery to manage the query state.
 * @returns Query object containing the list of talent pool candidates.
 */
export const useGetTalentPool = (
  dateRange: string,
  department: string,
  job: string,
  stages: string,
  talentPoolCategory: string,
  pageSize: number,
  currentPage: number,
) =>
  useQuery<TalentPoolResponse>(
    [
      'talentPool',
      dateRange,
      department,
      job,
      stages,
      talentPoolCategory,
      pageSize,
      currentPage,
    ],
    () =>
      getAllTalentPool(
        dateRange,
        department,
        job,
        stages,
        talentPoolCategory,
        pageSize,
        currentPage,
      ),
  );

export const useGetCandidates = () =>
  useQuery<TalentPoolResponse>('candidates', getAllCandidates);

/**
 * Custom hook to fetch a specific talent pool candidate by ID.
 * Uses React Query's useQuery to manage the query state.
 * @param id - ID of the candidate to fetch.
 * @returns Query object containing the candidate's data.
 */
export const useGetTalentPoolCandidate = (id: string) =>
  useQuery<TalentPool>(['talentPool', id], () => getTalentPoolCandidate(id), {
    keepPreviousData: true,
  });

export const useGetApplicantStatusStages = () =>
  useQuery<ApplicantStatusResponse>(
    ['applicant-status-stages'],
    () => getApplicantStatusStages(),
    {
      keepPreviousData: true,
    },
  );
