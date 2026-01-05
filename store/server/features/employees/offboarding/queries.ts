import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useQuery } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';

const tenantId = useAuthenticationStore.getState().tenantId;

const fetchOffBoardingTemplateTasks = async () => {
  const token = await getCurrentToken();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/offboarding-tasks-template`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

const fetchOffBoardingTasks = async (userId: string) => {
  const token = await getCurrentToken();
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await crudRequest({
      url: `${ORG_AND_EMP_URL}/offboarding-employee-tasks/termination/${userId}`,
      method: 'GET',
      headers,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const fetchUserTermination = async (userId: string) => {
  const token = await getCurrentToken();
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await crudRequest({
      url: `${ORG_AND_EMP_URL}/employee-termination/users/${userId}`,
      method: 'GET',
      headers,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const getOffboarding = async (id: string) => {
  try {
    const response = await crudRequest({
      url: `${ORG_AND_EMP_URL}/offboarding/${id}`,
      method: 'GET',
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const getOffboardingByUser = async (id: string) => {
  try {
    const response = await crudRequest({
      url: `${ORG_AND_EMP_URL}/offboarding/user/${id}`,
      method: 'GET',
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Custom hook to get offboarding by ID
 * @param id The ID to fetch offboarding for
 * @returns useQuery hook for fetching offboarding
 */
export const useGetOffboarding = (id: string) =>
  useQuery<any>(
    ['offboarding', id], // Query key with ID
    () => getOffboarding(id), // Function reference for fetching data
    {
      enabled: !!id, // Only run query when ID is provided
    },
  );

/**
 * Custom hook to get offboarding by user ID
 * @param id The user ID to fetch offboarding for
 * @returns useQuery hook for fetching offboarding by user
 */
export const useGetOffboardingByUser = (id: string) =>
  useQuery<any>(
    ['offboardingByUser', id], // Query key with ID
    () => getOffboardingByUser(id), // Function reference for fetching data
    {
      enabled: !!id, // Only run query when ID is provided
    },
  );

export const useFetchOffboardItems = () => {
  return useQuery<any>('offboardItems', fetchOffBoardingTemplateTasks);
};

export const useFetchOffboardingTasks = (userId: string) =>
  useQuery<any>(
    ['offboardItems', userId],
    () => fetchOffBoardingTasks(userId),
    {
      keepPreviousData: true,
    },
  );
export const useFetchOffBoardingTasksTemplate = () => {
  return useQuery<any>('offboardItemsTemplate', fetchOffBoardingTemplateTasks);
};
export const useFetchUserTerminationByUserId = (userId: string) =>
  useQuery<any>(['offboardingActiveTermiantionsByUserId', userId], () =>
    fetchUserTermination(userId),
  );
