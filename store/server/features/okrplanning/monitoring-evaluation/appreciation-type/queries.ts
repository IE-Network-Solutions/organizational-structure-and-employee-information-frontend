import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { AppreciationType } from '@/store/uistate/features/okrplanning/monitoring-evaluation/appreciation-type/interface';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { crudRequest } from '@/utils/crudRequest';

const tenantId = useAuthenticationStore.getState().tenantId;

type ResponseData = {
  items: AppreciationType[];
  meta?: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
};

/**
 * Function to fetch posts by sending a GET request to the API
 * @returns The response data from the API
 */
const getAppType = async () => {
  const token = await getCurrentToken();
  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/recognition-type?type=appreciation`,
      method: 'GET',
      headers,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Function to fetch a single appreciation type by sending a GET request to the API
 * @param id The ID of the appreciation type to fetch
 * @returns The response data from the API
 */
const getAppreciationType = async (id: string) => {
  try {
    const response = await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/appreciation-type/${id}`,
      method: 'GET',
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Custom hook to fetch a list of appreciation types using useQuery from react-query.
 *
 * @returns The query object for fetching appreciation types.
 *
 * @description
 * This hook uses `useQuery` to fetch a list of appreciation types from the API. It returns
 * the query object containing the appreciation types data and any loading or error states.
 */

/**
 * Custom hook to fetch a single appreciation type by ID using useQuery from react-query.
 *
 * @param id The ID of the appreciation type to fetch
 * @returns The query object for fetching the appreciation type.
 *
 * @description
 * This hook uses `useQuery` to fetch a single appreciation type by its ID. It returns the
 * query object containing the appreciation type data, and it keeps the previous data
 * while the new data is being fetched.
 */
export const useGetAppreciationTypeById = (id: string) =>
  useQuery<AppreciationType>(['appreciationType', id], () => getAppreciationType(id), {
    keepPreviousData: true,
    enabled: !!id, // Only run query when ID is provided
  });

export const useGetAppreciationType = () =>
  useQuery<ResponseData>('appType', getAppType);
