/**
 * @module dynamicFormFetch
 * This module provides a function and a custom hook for fetching dynamic forms from an API.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_DEV_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';

/**
 * @constant {string} tenantId - The tenant ID retrieved from the authentication store.
 */
const tenantId = useAuthenticationStore.getState().tenantId;

/**
 * @constant {Object} headers - Headers for API requests, including tenant ID and Bearer token for authorization.
 * @property {string} tenantId - Tenant ID for API requests. Defaults to a hardcoded value if not found.
 * @property {string} Authorization - Authorization header with Bearer token.
 */

/**
 * Fetches a dynamic form by its ID.
 * Sends a GET request to retrieve the public form based on the given form ID.
 *
 * @async
 * @function fetchDynamicForms
 * @param {string} formId - The ID of the form to be fetched.
 * @returns {Promise<any>} The response containing the form data from the API.
 */
const fetchQuestions = async (formId: string) => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${ORG_DEV_URL}/forms/public/${formId}`,
    method: 'GET',
    headers,
  });
};

/**
 * Custom hook to fetch a dynamic form using React Query's useQuery hook.
 * The query is keyed by `dynamicForms` and the provided form ID.
 *
 * @function useFetchDynamicForms
 * @param {string} formId - The ID of the form to be fetched.
 * @returns {Object} The result object from React Query, which includes form data, loading status, and errors.
 */
export const useFetchQuestions = (formId: string) => {
  return useQuery(['questions', formId], () => fetchQuestions(formId));
};
