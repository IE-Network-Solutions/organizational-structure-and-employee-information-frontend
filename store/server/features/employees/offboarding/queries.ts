import { crudRequest } from '@/utils/crudRequest';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useQuery } from 'react-query';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;

const fetchOffBoardingTemplateTasks = async () => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/offboarding-tasks-template`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const fetchOffBoardingTasks = async (userId: string) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/offboarding-employee-tasks/termination/${userId}`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const fetchUserTermination = async (userId: string) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employee-termination/users/${userId}`,
    method: 'GET',
    headers: requestHeader(),
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
