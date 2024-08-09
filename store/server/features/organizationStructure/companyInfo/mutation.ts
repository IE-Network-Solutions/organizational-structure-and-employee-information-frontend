import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { CompanyInfo } from './interface';
import { TENANT_MGMT_URL, tenantId } from '@/utils/constants';

const headers = {
  tenantId: tenantId,
};

/**
 * Create a new company info.
 * @param data - Company info data to create.
 * @returns Promise with the created company info.
 */
const createCompanyInfo = async (data: CompanyInfo) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/clients/${tenantId}`,
    method: 'PATCH',
    headers,
    data: data,
  });
};

/**
 * Update existing company info.
 * @param data - Data containing the ID and updated company info.
 * @returns Promise with the updated company info.
 */
const updateCompanyInfo = async ({ id, companyInfo }: { id: string; companyInfo: CompanyInfo }) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/clients/${id}`,
    method: 'PATCH',
    headers,
    data: JSON.stringify(companyInfo),
  });
};

/**
 * Delete a company info by ID.
 * @param id - ID of the company info to delete.
 * @returns Promise with the result of the deletion.
 */
const deleteCompanyInfo = async (id: string) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/company-info/${id}`,
    method: 'DELETE',
    headers,
  });
};

/**
 * Custom hook to create a company info.
 * Uses React Query's useMutation to manage the mutation state.
 * @returns Mutation object for creating company info.
 */
export const useCreateCompanyInfo = () => {
  const queryClient = useQueryClient();
  return useMutation(createCompanyInfo, {
    onSuccess: () => {
      queryClient.invalidateQueries('companyInfo');
    },
  });
};

/**
 * Custom hook to update a company info.
 * Uses React Query's useMutation to manage the mutation state.
 * @returns Mutation object for updating company info.
 */
export const useUpdateCompanyInfo = () => {
  const queryClient = useQueryClient();
  return useMutation(updateCompanyInfo, {
    onSuccess: () => {
      queryClient.invalidateQueries('companyInfo');
    },
  });
};

/**
 * Custom hook to delete a company info.
 * Uses React Query's useMutation to manage the mutation state.
 * @returns Mutation object for deleting company info.
 */
export const useDeleteCompanyInfo = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteCompanyInfo, {
    onSuccess: () => {
      queryClient.invalidateQueries('companyInfo');
    },
  });
};
