import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { CompanyProfileImage } from '@/store/uistate/features/organizationStructure/companyProfile/interface';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
/* eslint-disable @typescript-eslint/naming-convention */

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId,
  Authorization: `Bearer ${token}`,
};

/**
 * Fetch company profile by tenant ID.
 * @param tenantId - The ID of the tenant to fetch the company profile for.
 * @returns Promise with the company profile.
 */
export const getCompanyProfileByTenantId = async (tenantId: string) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/clients/${tenantId}`,
    method: 'GET',
    headers,
  });
};

/**
 * Update existing company profile.
 * @param params - Object containing the ID and updated company profile.
 * @returns Promise with the updated company profile.
 */

const multiPartFormDataheaders = {
  tenantId: tenantId,
  'Content-Type': 'multipart/form-data',
  Authorization: `Bearer ${token}`,
};

const updateCompanyProfile = async ({
  id,
  companyProfileImage,
}: {
  id: string;
  companyProfileImage: CompanyProfileImage;
}) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/clients/${id}`,
    method: 'PUT',
    headers: multiPartFormDataheaders,
    data: { companyProfileImage: companyProfileImage?.originFileObj },
  });
};

/**
 * Custom hook to fetch company profile by tenant ID.
 * Uses React Query's useQuery to manage the query state.
 * @param tenantId - The ID of the tenant to fetch the company profile for.
 * @returns Query object for fetching company profile.
 */
export const useGetCompanyProfileByTenantId = (tenantId: string) => {
  return useQuery(
    ['companyProfile', tenantId],
    () => getCompanyProfileByTenantId(tenantId),
    {
      enabled: !!tenantId, // Fetch only if tenantId is provided
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  );
};

/**
 * Custom hook to update a company profile.
 * Uses React Query's useMutation to manage the mutation state.
 * @returns Mutation object for updating company profile.
 */
export const useUpdateCompanyProfile = () => {
  const queryClient = useQueryClient();
  return useMutation(updateCompanyProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries('companyProfile');
      // const method = variables?.method?.toUpperCase();
      // handleSuccessMessage(method);
    },
  });
};

/* eslint-enable @typescript-eslint/naming-convention */
