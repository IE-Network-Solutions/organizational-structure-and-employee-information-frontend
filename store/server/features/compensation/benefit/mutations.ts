/**
 * @module benefitEntitlementMutation
 * This module provides functions and custom hooks for managing benefit entitlements (create and delete) using CRUD operations via API requests.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { OKR_URL, PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';

/**
 * Creates a new benefit entitlement by sending a POST request to the API.
 *
 * @async
 * @function createBenefitEntitlement
 * @param {Object} data - The data for the new benefit entitlement.
 * @returns {Promise<any>} The response from the API.
 */
const createBenefitEntitlement = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${PAYROLL_URL}/compensation-item-entitlement`,
    method: 'POST',
    data,
    headers,
  });
};

/**
 * Deletes a benefit entitlement by sending a DELETE request to the API.
 *
 * @async
 * @function deleteBenefitEntitlement
 * @param {string} id - The ID of the benefit entitlement to delete.
 * @returns {Promise<any>} The response from the API.
 */
const deleteBenefitEntitlement = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${PAYROLL_URL}/compensation-item-entitlement/${id}`,
    method: 'DELETE',
    headers,
  });
};

/**
 * Custom hook to delete a benefit entitlement using React Query's useMutation hook.
 * On success, the cache for `benefitEntitlement` is invalidated and a success message is displayed.
 *
 * @returns {MutationObject} The mutation object for deleting a benefit entitlement.
 */
export const useDeleteBenefitEntitlement = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteBenefitEntitlement, {
    onSuccess: (unused: any, variables: any) => {
      queryClient.invalidateQueries('benefitEntitlement');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method, 'Benefit entitlement successfully deleted.');
    },
  });
};

/**
 * Custom hook to create a benefit entitlement using React Query's useMutation hook.
 * On success, the cache for `benefitEntitlement` is invalidated and a success message is displayed.
 *
 * @returns {MutationObject} The mutation object for creating a benefit entitlement.
 */
export const useCreateBenefitEntitlement = () => {
  const queryClient = useQueryClient();
  return useMutation(createBenefitEntitlement, {
    onSuccess: (unused: any, variables: any) => {
      queryClient.invalidateQueries('benefitEntitlement');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method, 'Benefit entitlement successfully created.');
    },
  });
};

const filterVpScoreInstance = async (data: any) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${OKR_URL}/vp-score-instance`,
    method: 'POST',
    data,
    headers,
  });
};

export const useFilterVpScoreInstance = () => {
  const queryClient = useQueryClient();
  return useMutation(filterVpScoreInstance, {
    onSuccess: (unused: any, variables: any) => {
      queryClient.invalidateQueries('ObjectiveDashboard');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method, 'Benefit entitlement successfully created.');
    },
  });
};