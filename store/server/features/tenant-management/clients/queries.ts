import { requestHeader } from '@/helpers/requestHeader';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import type {
  ClientResponse,
  ClientRequestParams,
  CreateClientDto,
} from './interface';
import { Tenant } from '@/types/tenant-management';

export const useGetClients = (params: ClientRequestParams = {}) => {
  return useQuery<ClientResponse>(
    ['clients', params],
    () =>
      crudRequest({
        url: `${TENANT_MGMT_URL}/clients`,
        method: 'GET',
        headers: requestHeader(),
        params,
      }),
    {
      keepPreviousData: true,
    },
  );
};

export const createClient = (data: CreateClientDto) => {
  return crudRequest({
    url: `${TENANT_MGMT_URL}/clients`,
    method: 'POST',
    headers: requestHeader(),
    data,
  });
};

const getClientById = async (id: string) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/clients/${id}`,
    method: 'GET',
    headers: requestHeader(),
  });
};

export const useGetClientById = (id: string, isEnabled: boolean = true) => {
  return useQuery<Tenant>(['client', id], () => getClientById(id), {
    enabled: isEnabled && !!id,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
