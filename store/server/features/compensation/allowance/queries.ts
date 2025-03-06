/**
 * @module fetchAllowanceEntitlementTemplate
 * This module provides a function and custom hook to fetch question templates from the API with pagination support.
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
 * Fetches the question templates from the API, using pagination details such as page size and current page.
 *
 * @async
 * @function fetchQuestionTemplate
 * @param {number} pageSize - The number of question templates to fetch per page.
 * @param {number} current - The current page number to fetch.
 * @returns {Promise<any>} The response from the API.
 */

const fetchAllowanceEntitlements = async (allowanceId: string | string[]) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${PAYROLL_URL}/compensation-item-entitlement/compensation/${allowanceId}`,
    method: 'GET',
    headers,
  });
};

/**
 * Fetches the question templates from the API, using pagination details such as page size and current page.
 *
 * @async
 * @function fetchQuestionTemplate
 * @param {number} pageSize - The number of question templates to fetch per page.
 * @param {number} current - The current page number to fetch.
 * @returns {Promise<any>} The response from the API.
 */
const fetchAllowances = async () => {
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
 * Fetches the question templates from the API, using pagination details such as page size and current page.
 *
 * @async
 * @function fetchQuestionTemplate
 * @param {number} pageSize - The number of question templates to fetch per page.
 * @param {number} current - The current page number to fetch.
 * @returns {Promise<any>} The response from the API.
 */
const fetchAllowance = async (allowanceId: string | string[]) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${PAYROLL_URL}/compensation-items/${allowanceId}`,
    method: 'GET',
    headers,
  });
};

/**
 * Custom hook to fetch question templates with pagination using React Query's useQuery hook.
 * The query's cache key is based on the `pageSize` and `current` page number to ensure proper cache handling.
 *
 * @param {number} pageSize - The number of question templates to fetch per page.
 * @param {number} current - The current page number to fetch.
 * @returns {QueryObject} The query object for fetching question templates.
 */
export const useFetchAllowanceEntitlements = (
  allowanceId: string | string[],
) => {
  return useQuery(['allowanceEntitlement'], () =>
    fetchAllowanceEntitlements(allowanceId),
  );
};

/**
 * Custom hook to fetch question templates with pagination using React Query's useQuery hook.
 * The query's cache key is based on the `pageSize` and `current` page number to ensure proper cache handling.
 *
 * @param {number} pageSize - The number of question templates to fetch per page.
 * @param {number} current - The current page number to fetch.
 * @returns {QueryObject} The query object for fetching question templates.
 */
export const useFetchAllowances = () => {
  return useQuery(['allowanceType'], () => fetchAllowances());
};

/**
 * Custom hook to fetch question templates with pagination using React Query's useQuery hook.
 * The query's cache key is based on the `pageSize` and `current` page number to ensure proper cache handling.
 *
 * @param {number} pageSize - The number of question templates to fetch per page.
 * @param {number} current - The current page number to fetch.
 * @returns {QueryObject} The query object for fetching question templates.
 */
export const useFetchAllowance = (allowanceId: string | string[]) => {
  return useQuery(['benefit'], () => fetchAllowance(allowanceId));
};
