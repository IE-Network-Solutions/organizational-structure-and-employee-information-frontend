/**
 * @module fetchQuestionTemplate
 * This module provides a function and custom hook to fetch question templates from the API with pagination support.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
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
const fetchQuestionTemplate = async (pageSize: number, current: number) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const userId = useAuthenticationStore.getState().userId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
    createdById: userId || '',
  };
  return await crudRequest({
    url: `${ORG_DEV_URL}/custom-fields?page=${current}&limit=${pageSize}`,
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
export const useFetchQuestionTemplate = (pageSize: number, current: number) => {
  return useQuery(['questionTemplate', pageSize, current], () =>
    fetchQuestionTemplate(pageSize, current),
  );
};
