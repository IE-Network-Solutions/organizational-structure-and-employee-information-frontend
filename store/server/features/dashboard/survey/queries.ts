import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

// Define the OKRDashboard interface
interface SurveyData {
  stage?: string;
  createdAt: string;
  name: string;
  formCategory: { name: string };
}
interface AllMeeting {
  meetings: [];
  surveys: [];
  actionPlans: [];
}
// Define the ResponseData type as an array of OKRDashboard
type ResponseData = SurveyData[];
type AllMeetingResponseData = AllMeeting;

/**
 * Function to fetch applicant summary by sending a GET request to the API
 * @returns The response data from the API
 */
const getSurvey = async (start: string, end: string): Promise<ResponseData> => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;

  if (!token || !tenantId) {
    throw new Error('Missing authentication information.');
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };
  const response = await crudRequest({
    url: `${ORG_DEV_URL}/forms/user/form?userId=${userId}&start=${start}&end=${end}`,
    method: 'GET',
    headers,
  });
  return response;
};
const getSchedule = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;

  if (!token || !tenantId) {
    throw new Error('Missing authentication information.');
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };

  return await crudRequest({
    url: `${ORG_DEV_URL}/my-meetings/${userId}`,
    method: 'GET',
    headers,
  });
};
const getScheduleByDate = async (date: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;

  if (!token || !tenantId) {
    throw new Error('Missing authentication information.');
  }

  const params = { date: date };

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };

  return await crudRequest({
    url: `${ORG_DEV_URL}/my-meetings/${userId}/by-date`,
    method: 'GET',
    headers,
    params,
  });
};

/**
 * Custom hook to get the applicant summary
 * @returns useQuery hook for fetching applicant summary
 */
export const useGetSurvey = (start: string, end: string) =>
  useQuery<ResponseData>(
    ['survey', start, end], // Use id as part of the query key
    () => getSurvey(start, end), // Pass function reference to useQuery
    {
      keepPreviousData: true,
    },
  );
export const useGetSchedule = () =>
  useQuery<AllMeetingResponseData>(
    ['schedule'], // Use id as part of the query key
    () => getSchedule(), // Pass function reference to useQuery
    {
      keepPreviousData: true,
    },
  );
export const useGetScheduleByDate = (date: string) =>
  useQuery<AllMeetingResponseData>(
    ['scheduleByDate'], // Use id as part of the query key
    () => getScheduleByDate(date), // Pass function reference to useQuery
    {
      keepPreviousData: true,
    },
  );
