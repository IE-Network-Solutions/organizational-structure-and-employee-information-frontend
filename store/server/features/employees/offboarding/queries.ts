import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useQuery } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import axios from 'axios';
import { getCurrentToken } from '@/utils/getCurrentToken';

const token = await getCurrentToken();
const tenantId = useAuthenticationStore.getState().tenantId;

const fetchOffBoardingTemplateTasks = async () => {
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
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.get(
      `${ORG_AND_EMP_URL}/offboarding-employee-tasks/termination/${userId}`,
      { headers },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

const fetchUserTermination = async (userId: string) => {
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.get(
      `${ORG_AND_EMP_URL}/employee-termination/users/${userId}`,
      { headers },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

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
