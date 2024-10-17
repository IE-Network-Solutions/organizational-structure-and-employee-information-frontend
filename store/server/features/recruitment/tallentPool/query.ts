import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { RECRUITMENT_URL } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  ApplicantStatusResponse,
  TalentPool,
  TalentPoolResponse,
} from '@/types/dashboard/recruitment/talentPool';

// Fetch token and tenantId from the authentication store
const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};

/**
 * Fetch all talent pool data from the API.
 * @returns Promise with the list of talent pool candidates.
 */
const getAllTalentPool = async () => {
  return await crudRequest({
    url: `${RECRUITMENT_URL}/talent-pool`,
    method: 'GET',
    headers,
  });
};

const getAllCandidates = async () => {
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
  return await crudRequest({
    url: `${RECRUITMENT_URL}/job/candidates/${id}`,
    method: 'GET',
    headers,
  });
};

const getApplicantStatusStages = async () => {
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
export const useGetTalentPool = () =>
  useQuery<TalentPoolResponse>('talentPool', getAllTalentPool);

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
