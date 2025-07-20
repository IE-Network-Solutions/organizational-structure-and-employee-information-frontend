import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQueryClient } from 'react-query';
import { CompanyInfo } from './interface';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { handleSuccessMessage } from '@/utils/showSuccessMessage';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
/* eslint-disable @typescript-eslint/naming-convention */
import { getCurrentToken } from '@/utils/getCurrentToken';

const tenantId = useAuthenticationStore.getState().tenantId;


/**
 * Create a new company info.
 * @param data - Company info data to create.
 * @returns Promise with the created company info.
 */
const createCompanyInfo = async (data: CompanyInfo) => {
  const token = await getCurrentToken();
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/clients/${tenantId}`,
    method: 'PUT',
    headers,
    data: data,
  });
};

/**
 * Update existing company info.
 * @param data - Data containing the ID and updated company info.
 * @returns Promise with the updated company info.
 */
const updateCompanyInfo = async ({
  id,
  companyInfo,
}: {
  id: string;
  companyInfo: CompanyInfo;
}) => {
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/clients/${id}`,
    method: 'PUT',
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
  const token = await getCurrentToken();
  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
  };
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/clients/${id}`,
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
      // const method = variables?.method?.toUpperCase();
      // handleSuccessMessage(method);
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
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries('companyInfo');
      const method = variables?.method?.toUpperCase();
      handleSuccessMessage(method);
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
      // const method = variables?.method?.toUpperCase();
      // handleSuccessMessage(method);
    },
  });
};
/* eslint-enable @typescript-eslint/naming-convention */
