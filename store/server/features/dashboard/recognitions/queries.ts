import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Recognition, SuperStartProps } from '@/types/dashboard/okr';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

type ResponseData = SuperStartProps[];
type WeeklyStar = Recognition[];

/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getSuperStar = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };

    return await crudRequest({
      url: `${ORG_DEV_URL}/recognition/super-star-recognition`,
      method: 'GET',
      headers,
    });
  } catch (error) {
    throw error;
  }
};
const getRockStar = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };

    return await crudRequest({
      url: `${ORG_DEV_URL}/recognition/rock-star-recognition`,
      method: 'GET',
      headers,
    });
  } catch (error) {
    throw error;
  }
};
const getWeeklyLeader = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };

    return await crudRequest({
      url: `${ORG_DEV_URL}/recognition/weekly-leader-recognition`,
      method: 'GET',
      headers,
    });
  } catch (error) {
    throw error;
  }
};

export const useGetSuperStar = () =>
  useQuery<ResponseData>(['superStar'], () => getSuperStar(), {
    keepPreviousData: true,
  });
export const useGetRockStar = () =>
  useQuery<WeeklyStar>(['rockStar'], () => getRockStar(), {
    keepPreviousData: true,
  });
export const useGetWeeklyLeader = () =>
  useQuery<WeeklyStar>(['weeklyLeader'], () => getWeeklyLeader(), {
    keepPreviousData: true,
  });
