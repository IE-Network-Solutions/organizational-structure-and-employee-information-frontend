/**
 * @module allowanceEntitlementMutation
 * This module provides functions and custom hooks for managing question templates (create, update, and delete) using CRUD operations via API requests.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useMutation, useQueryClient } from 'react-query';

/**
 * Deletes a custom question template by sending a DELETE request to the API.
 * The request includes pagination details such as the current page and page size for managing the UI state.
 *
 * @async
 * @function deleteQuestionTemplate
 * @returns {Promise<any>} The response from the API.
 */
const createAllowanceEntitlement = async (data: any) => {
  const token = await getCurrentToken();
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
 * Creates a new allowance/deduction entitlement with settlement tracking by sending a POST request.
 * This endpoint properly handles the payments array with amounts and pay periods.
 *
 * @async
 * @function createAllowanceEntitlementSettlement
 * @returns {Promise<any>} The response from the API.
 */
const createAllowanceEntitlementSettlement = async (data: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${PAYROLL_URL}/compensation-item-entitlement/employee-settlement-tracking`,
    method: 'POST',
    data,
    headers,
  });
};

/**
 * Updates an allowance/deduction entitlement settlement by sending a PATCH request to the API.
 *
 * @async
 * @function updateAllowanceEntitlementSettlement
 * @returns {Promise<any>} The response from the API.
 */
const updateAllowanceEntitlementSettlement = async (data: any) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${PAYROLL_URL}/compensation-item-entitlement/employee-settlement-tracking/${data.id}`,
    method: 'PATCH',
    data,
    headers,
  });
};

/**
 * Deletes a custom question template by sending a DELETE request to the API.
 * The request includes pagination details such as the current page and page size for managing the UI state.
 *
 * @async
 * @function deleteQuestionTemplate
 * @returns {Promise<any>} The response from the API.
 */
const deleteAllowanceEntitlement = async (id: string) => {
  const token = await getCurrentToken();
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
 * Custom hook to delete a question template using React Query's useMutation hook.
 * On success, the cache for `questionTemplate` is invalidated and a success message is displayed.
 *
 * @returns {MutationObject} The mutation object for deleting a question template.
 */
export const useCreateAllowanceEntitlement = () => {
  const queryClient = useQueryClient();
  return useMutation(createAllowanceEntitlement, {
    onSuccess: (notused: any, variables: any) => {
      queryClient.invalidateQueries(['allowanceEntitlement']);
      queryClient.invalidateQueries('allowanceType');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

/**
 * Custom hook to create an allowance/deduction entitlement with settlement tracking.
 * This is the correct hook for rate-based deductions that need proper payment schedule handling.
 *
 * @returns {MutationObject} The mutation object for creating an entitlement with settlement tracking.
 */
export const useCreateAllowanceEntitlementSettlement = () => {
  const queryClient = useQueryClient();
  return useMutation(createAllowanceEntitlementSettlement, {
    onSuccess: (notused: any, variables: any) => {
      queryClient.invalidateQueries(['allowanceEntitlement']);
      queryClient.invalidateQueries('allowanceType');
      queryClient.invalidateQueries('employeeSettlementTracking');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

/**
 * Custom hook to delete a question template using React Query's useMutation hook.
 * On success, the cache for `questionTemplate` is invalidated and a success message is displayed.
 *
 * @returns {MutationObject} The mutation object for deleting a question template.
 */
export const useDeleteAllowanceEntitlement = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteAllowanceEntitlement, {
    onSuccess: (notused: any, variables: any) => {
      queryClient.invalidateQueries(['allowanceEntitlement']);
      queryClient.invalidateQueries('allowanceType');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
    },
  });
};

/**
 * Custom hook to update an allowance/deduction entitlement settlement using React Query's useMutation hook.
 * On success, the cache is invalidated and a success message is displayed.
 *
 * @returns {MutationObject} The mutation object for updating an entitlement settlement.
 */
export const useUpdateAllowanceEntitlementSettlement = () => {
  const queryClient = useQueryClient();
  return useMutation(updateAllowanceEntitlementSettlement, {
    onSuccess: () => {
      queryClient.invalidateQueries(['allowanceEntitlement']);
      queryClient.invalidateQueries('allowanceType');
      queryClient.invalidateQueries('employeeSettlementTracking');
      handleSuccessMessage('PATCH');
    },
  });
};
