import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useQuery } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { ProbationTarget } from './interface';

const tenantId = useAuthenticationStore.getState().tenantId;

const fetchProbationTargets = async () => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/probation-targets`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const fetchProbationTargetById = async (id: string) => {
  const token = await getCurrentToken();
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };
    const response = await crudRequest({
      url: `${ORG_AND_EMP_URL}/probation-targets/${id}`,
      method: 'GET',
      headers,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const fetchProbationTargetsByUserId = async (userId: string) => {
  const token = await getCurrentToken();
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };
    const response = await crudRequest({
      url: `${ORG_AND_EMP_URL}/probation-targets/user/${userId}`,
      method: 'GET',
      headers,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Custom hook to get all probation targets
 * @returns useQuery hook for fetching all probation targets
 */
export const useFetchProbationTargets = () => {
  return useQuery<ProbationTarget[]>('probationTargets', fetchProbationTargets);
};

/**
 * Custom hook to get probation target by ID
 * @param id The ID to fetch probation target for
 * @returns useQuery hook for fetching probation target
 */
export const useFetchProbationTargetById = (id: string) =>
  useQuery<ProbationTarget>(
    ['probationTarget', id],
    () => fetchProbationTargetById(id),
    {
      enabled: !!id,
    },
  );

/**
 * Custom hook to get probation targets by user ID
 * @param userId The user ID to fetch probation targets for
 * @returns useQuery hook for fetching probation targets by user
 */
export const useFetchProbationTargetsByUserId = (userId: string) =>
  useQuery<ProbationTarget[]>(
    ['probationTargetsByUserId', userId],
    () => fetchProbationTargetsByUserId(userId),
    {
      enabled: !!userId,
      keepPreviousData: true,
    },
  );
