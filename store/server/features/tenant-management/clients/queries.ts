import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';
import { Client, ClientResponse, ClientRequestParams } from './interface';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const getAllClients = async (
  paginationOptions?: ClientRequestParams,
): Promise<ClientResponse> => {
  const requestHeaders = await requestHeader();
  const queryParams = new URLSearchParams();

  if (paginationOptions?.orderBy) {
    queryParams.append('orderBy', paginationOptions.orderBy);
  }
  if (paginationOptions?.orderDirection) {
    queryParams.append('orderDirection', paginationOptions.orderDirection);
  }
  if (paginationOptions?.page) {
    queryParams.append('page', paginationOptions.page.toString());
  }
  if (paginationOptions?.limit) {
    queryParams.append('limit', paginationOptions.limit.toString());
  }

  const url = `${TENANT_MGMT_URL}/clients${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  return await crudRequest({
    url,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const createClient = async (data: Partial<Client>): Promise<Client> => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/clients`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

const getClientById = async (id: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/clients/${id}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetClientById = (id: string, isEnabled: boolean = true) =>
  useQuery(['client', id], () => getClientById(id), {
    enabled: isEnabled,
  });

export const useGetAllClients = (paginationOptions?: ClientRequestParams) =>
  useQuery(['clients', paginationOptions], () =>
    getAllClients(paginationOptions),
  );

// New hook to get current tenant/client data
export const useGetCurrentTenant = () => {
  const { tenantId } = useAuthenticationStore();
  return useGetClientById(tenantId, !!tenantId);
};

// Dedicated function to get tenant details for certificate
const getTenantDetailsForCertificate = async (tenantId: string) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/clients/${tenantId}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

// Hook to get tenant details specifically for certificate
export const useGetTenantDetailsForCertificate = () => {
  const { tenantId } = useAuthenticationStore();
  return useQuery(
    ['tenantDetailsForCertificate', tenantId],
    () => getTenantDetailsForCertificate(tenantId),
    {
      enabled: !!tenantId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  );
};
