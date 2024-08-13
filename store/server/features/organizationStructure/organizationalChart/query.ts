import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { OrgChart } from './interface';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;
const headers = {
  tenantId: tenantId,
  Authorization: `Bearer ${token}`,
};
/**
 * Fetch all organization charts from the API.
 * @returns Promise with the list of organization charts.
 */

const getAllOrgCharts = async () => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/departments`,
    method: 'GET',
    headers,
  });
};

/**
 * Fetch a specific organization chart by ID from the API.
 * @param id - ID of the organization chart to fetch.
 * @returns Promise with the organization chart data.
 */
const getOrgChart = async (id: string) => {
  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/departments/${id}`,
    method: 'GET',
    headers,
  });
};

/**
 * Custom hook to fetch all organization charts.
 * Uses React Query's useQuery to manage the query state.
 * @returns Query object containing the list of organization charts.
 */
export const useGetOrgCharts = () =>
  useQuery<OrgChart>('orgcharts', getAllOrgCharts);

/**
 * Custom hook to fetch a specific organization chart by ID.
 * Uses React Query's useQuery to manage the query state.
 * @param id - ID of the organization chart to fetch.
 * @returns Query object containing the organization chart data.
 */
export const useGetOrgChart = (id: string) =>
  useQuery<OrgChart>(['orgchart', id], () => getOrgChart(id), {
    keepPreviousData: true,
  });
