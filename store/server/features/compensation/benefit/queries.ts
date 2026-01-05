/**
 * @module fetchAllowanceTypesTemplate
 * This module provides a function and custom hooks to fetch benefit data from the API.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';
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
 * Fetches benefit entitlement details for a specific benefit from the API.
 *
 * @async
 * @function fetchBenefitEntitlement
 * @param {string | string[]} benefitId - The ID of the benefit for which entitlements are being fetched.
 * @returns {Promise<any>} The response from the API.
 */
const fetchBenefitEntitlement = async (benefitId: string | string[]) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${PAYROLL_URL}/compensation-item-entitlement/compensation/${benefitId}`,
    method: 'GET',
    headers,
  });
};

/**
 * Fetches details for a specific benefit from the API.
 *
 * @async
 * @function fetchBenefit
 * @param {string | string[]} id - The ID of the benefit to fetch.
 * @returns {Promise<any>} The response from the API.
 */
const fetchBenefit = async (id: string | string[]) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${PAYROLL_URL}/compensation-items/${id}`,
    method: 'GET',
    headers,
  });
};

/**
 * Fetches a list of all benefits from the API.
 *
 * @async
 * @function fetchBenefits
 * @returns {Promise<any>} The response from the API.
 */
const fetchBenefits = async () => {
  const token = await getCurrentToken();
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
 * Custom hook to fetch benefit entitlements using React Query's useQuery hook.
 *
 * @param {string | string[]} benefitId - The ID of the benefit for which entitlements are being fetched.
 * @returns {QueryObject} The query object for fetching benefit entitlements.
 */
export const useFetchBenefitEntitlement = (benefitId: string | string[]) => {
  return useQuery(['benefitEntitlement'], () =>
    fetchBenefitEntitlement(benefitId),
  );
};

/**
 * Custom hook to fetch a specific benefit using React Query's useQuery hook.
 *
 * @param {string | string[]} benefitId - The ID of the benefit to fetch.
 * @returns {QueryObject} The query object for fetching the benefit.
 */
export const useFetchBenefit = (benefitId: string | string[]) => {
  return useQuery(['benefit'], () => fetchBenefit(benefitId));
};

/**
 * Custom hook to fetch all benefits using React Query's useQuery hook.
 *
 * @returns {QueryObject} The query object for fetching all benefits.
 */
export const useFetchBenefits = () => {
  return useQuery(['benefits'], () => fetchBenefits());
};
