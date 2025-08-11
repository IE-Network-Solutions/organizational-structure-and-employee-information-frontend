import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';

const fetchOffBoardingTemplateTasks = async () => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/offboarding-tasks-template`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const fetchOffBoardingTasks = async (userId: string) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/offboarding-employee-tasks/termination/${userId}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

const fetchUserTermination = async (userId: string) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employee-termination/users/${userId}`,
    method: 'GET',
    headers: requestHeaders,
  });
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
