/**
 * @module fetchAllowanceTypes
 * This module provides a function and custom hook to fetch compensation types (allowance types) from the API with pagination support.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

/**
 * @constant {string} token - The authentication token retrieved from the authentication store.
 */

/**
 * @constant {string} tenantId - The tenant ID retrieved from the authentication store.
 */

/**
 * @constant {Object} headers - Headers for API requests, including tenant ID and Bearer token for authorization.
 * @property {string} tenantId - The tenant ID for API requests.
 * @property {string} Authorization - Authorization header with Bearer token.
 */

/**
 * Fetches the compensation types (allowance types) from the API.
 *
 * @async
 * @function fetchAllowanceTypes
 * @returns {Promise<any>} The response from the API.
 */
const fetchAllowanceTypes = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${PAYROLL_URL}/compensation-items`,
    method: 'GET',
    headers,
  });
};

/**
 * Custom hook to fetch compensation types (allowance types) using React Query's useQuery hook.
 * The query's cache key is based on the `pageSize` and `current` page number to ensure proper cache handling.
 *
 * @returns {QueryObject} The query object for fetching compensation types.
 */
export const useFetchAllowanceTypes = () => {
  return useQuery(['allowanceType'], () =>
    fetchAllowanceTypes(),
  );
};