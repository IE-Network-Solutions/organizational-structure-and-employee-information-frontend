import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { CompanyInfoResponse } from './interface';
import { TENANT_MGMT_URL } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};
/**
 * Fetch all company info from the API.
 * @returns Promise with the list of company info.
 */
const getAllCompanyInfo = async () => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/company-info`,
    method: 'GET',
    headers,
  });
};

/**
 * Fetch a specific company info by ID from the API.
 * @param id - ID of the company info to fetch.
 * @returns Promise with the company info data.
 */
const getCompanyInfo = async (id: string) => {
  return await crudRequest({
    url: `${TENANT_MGMT_URL}/company-info/${id}`,
    method: 'GET',
    headers,
  });
};

/**
 * Custom hook to fetch all company info.
 * Uses React Query's useQuery to manage the query state.
 * @returns Query object containing the list of company info.
 */
export const useGetCompanyInfo = () =>
  useQuery<CompanyInfoResponse>('companyInfo', getAllCompanyInfo);

/**
 * Custom hook to fetch a specific company info by ID.
 * Uses React Query's useQuery to manage the query state.
 * @param id - ID of the company info to fetch.
 * @returns Query object containing the company info data.
 */
export const useGetCompanyInfoById = (id: string) =>
  useQuery<CompanyInfoResponse>(['companyInfo', id], () => getCompanyInfo(id), {
    keepPreviousData: true,
  });
