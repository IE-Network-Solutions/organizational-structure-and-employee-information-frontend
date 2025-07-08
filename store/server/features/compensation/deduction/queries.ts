/**
 * @module fetchAllowanceTypesTemplate
 * This module provides a function and custom hooks to fetch benefit data from the API.
 */

import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const getAllDeductionTypes = async (type: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${PAYROLL_URL}/compensation-items/by-compensation-type?type=${type}`,
    method: 'GET',
    headers,
  });
};

export const useGetAllDeductionTypes = (type: string) => {
  return useQuery(['deductions'], () => getAllDeductionTypes(type));
};
