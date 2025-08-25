import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ReprimandType } from '@/store/uistate/features/okrplanning/monitoring-evaluation/reprimand-type/interface';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { crudRequest } from '@/utils/crudRequest';

const tenantId = useAuthenticationStore.getState().tenantId;

type ResponseData = {
  items: ReprimandType[];
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
  try {
    const token = await getCurrentToken();
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/recognition-type?type=reprimand`,
      method: 'GET',
      headers,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Function to fetch a single reprimand type by sending a GET request to the API
 * @param id The ID of the reprimand type to fetch
 * @returns The response data from the API
 */
const getReprimandType = async (id: string) => {
  try {
    const response = await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/reprimand-type/${id}`,
      method: 'GET',
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Custom hook to fetch a list of reprimand types using useQuery from react-query.
 *
 * @returns The query object for fetching reprimand types.
 *
 * @description
 * This hook uses `useQuery` to fetch a list of reprimand types from the API. It returns
 * the query object containing the reprimand types data and any loading or error states.
 */

/**
 * Custom hook to fetch a single reprimand type by ID using useQuery from react-query.
 *
 * @param id The ID of the reprimand type to fetch
 * @returns The query object for fetching the reprimand type.
 *
 * @description
 * This hook uses `useQuery` to fetch a single reprimand type by its ID. It returns the
 * query object containing the reprimand type data, and it keeps the previous data
 * while the new data is being fetched.
 */
export const useGetReprimandTypeById = (id: string) =>
  useQuery<ReprimandType>(['reprimandType', id], () => getReprimandType(id), {
    keepPreviousData: true,
    enabled: !!id, // Only run query when ID is provided
  });

export const useGetReprimandType = () =>
  useQuery<ResponseData>(['repType'], () => getAppType(), {
    keepPreviousData: true,
  });
