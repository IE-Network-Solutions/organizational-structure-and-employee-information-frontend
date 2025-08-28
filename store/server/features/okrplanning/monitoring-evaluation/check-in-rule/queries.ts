import { OKR_AND_PLANNING_URL } from '@/utils/constants';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { CheckInRule } from '@/types/okr/check-in-rule';

const tenantId = useAuthenticationStore.getState().tenantId;

type ResponseData = {
  items: CheckInRule[];
  meta?: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
};

/**
 * Function to fetch check-in rules by sending a GET request to the API
 * @returns The response data from the API
 */
const getCheckInRules = async () => {
  const token = await getCurrentToken();
  try {
    const response = await crudRequest({
      url: `${OKR_AND_PLANNING_URL}/check-in-rules`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        tenantId: tenantId,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Custom hook to fetch a list of check-in rules using useQuery from react-query.
 *
 * @returns The query object for fetching check-in rules.
 *
 * @description
 * This hook uses `useQuery` to fetch a list of check-in rules from the API. It returns
 * the query object containing the check-in rules data and any loading or error states.
 */
export const useGetCheckInRules = () =>
  useQuery<ResponseData>('checkInRule', getCheckInRules); 