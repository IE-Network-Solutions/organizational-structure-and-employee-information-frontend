import { crudRequest } from '@/utils/crudRequest';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { TENANT_BASE_URL, TENANT_MGMT_URL } from '@/utils/constants';
import { CompanyProfileImage } from '@/store/uistate/features/organizationStructure/companyProfile/interface';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
/* eslint-disable @typescript-eslint/naming-convention */
import { getCurrentToken } from '@/utils/getCurrentToken';

const tenantId = useAuthenticationStore.getState().tenantId;

/**
 * Fetch company profile by tenant ID.
 * @param tenantId - The ID of the tenant to fetch the company profile for.
 * @returns Promise with the company profile.
 */
export const getCompanyProfileByTenantId = async (tenantId: string) => {
  const token = await getCurrentToken();
  const headers = {
    tenantId,
    Authorization: `Bearer ${token}`,
  };

  return await crudRequest({
    url: `${TENANT_BASE_URL}/api/v1/clients/${tenantId}`,
    method: 'GET',
    headers,
  });
};

/**
 * Update existing company profile.
 * @param params - Object containing the ID and updated company profile.
 * @returns Promise with the updated company profile.
 */

const updateCompanyProfile = async ({
  id,
  companyProfileImage,
}: {
  id: string;
  companyProfileImage: CompanyProfileImage;
}) => {
  const token = await getCurrentToken();
  const multiPartFormDataheaders = {
    tenantId: tenantId,
    'Content-Type': 'multipart/form-data',
    Authorization: `Bearer ${token}`,
  };
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

const updateCompanyProfileWithStamp = async ({
  id,
  updateClientDto, // Include the DTO data
  companyProfileImage,
  companyStamp,
}: {
  id: string;
  updateClientDto?: any; // Optional DTO
  companyProfileImage?: CompanyProfileImage;
  companyStamp?: CompanyProfileImage;
}): Promise<any> => {
  const token = await getCurrentToken();
  const formData = new FormData();
  // Append DTO as JSON string
  if (updateClientDto) {
    formData.append('updateClientDto', JSON.stringify({}));
  }

  // Append files if they exist
  if (companyProfileImage?.originFileObj) {
    formData.append('companyProfileImage', companyProfileImage.originFileObj);
  }

  if (companyStamp?.originFileObj) {
    formData.append('companyStamp', companyStamp.originFileObj);
  }

  const headers = {
    tenantId: tenantId,
    Authorization: `Bearer ${token}`,
    // Don't manually set 'Content-Type': 'multipart/form-data'
    // Let Axios or Fetch handle it automatically
  };

  return await crudRequest({
    url: `${TENANT_MGMT_URL}/clients/${id}`,
    method: 'PUT',
    headers: headers,
    data: formData,
  });
};

export const useUpdateCompanyProfileWithStamp = () => {
  const queryClient = useQueryClient();
  return useMutation(updateCompanyProfileWithStamp, {
    onSuccess: () => {
      queryClient.invalidateQueries('companyProfile');
      // const method = variables?.method?.toUpperCase();
      // handleSuccessMessage(method);
    },
  });
};
