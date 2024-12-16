/**
 * @module fetchQuestionTemplate
 * This module provides a function and custom hook to fetch question templates from the API with pagination support.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
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
const fetchAllFeedbackTypes = async (pageSize?: number, current?: number) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    // url: `${ORG_DEV_URL}/feedback-type?page=${current}&limit=${pageSize}`,
    url: `${ORG_DEV_URL}/feedback-type`,
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
export const useFetchAllFeedbackTypes = (pageSize?: number, current?: number) => {
  return useQuery(['feedbackTypes', pageSize, current], () =>
    fetchAllFeedbackTypes(pageSize, current),
  );
};
