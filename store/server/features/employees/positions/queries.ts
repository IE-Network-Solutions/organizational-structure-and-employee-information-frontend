import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { usePositionState } from '@/store/uistate/features/employees/positions';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';

const getPositions = async (
  currentPage: number,
  pageSize: number,
  searchTerm?: string,
) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };

  const searchParam =
    searchTerm && searchTerm.trim() !== ''
      ? `&columnName=name&query=${encodeURIComponent(searchTerm.trim())}`
      : '';
  const url = `${ORG_AND_EMP_URL}/positions?limit=${pageSize}&page=${currentPage}${searchParam}`;

  return await crudRequest({
    url,
    method: 'GET',
    headers,
  });
};
const getAllPositions = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };

  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/positions`,
    method: 'GET',
    headers,
  });
};

const getPositionsByID = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  const pageSize = usePositionState.getState().pageSize;
  const currentPage = usePositionState.getState().currentPage;
  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };

  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/positions/${id}?limit=${pageSize}&&page=${currentPage}`,
    method: 'GET',
    headers,
  });
};

export const useGetPositions = (
  currentPage: number,
  pageSize: number,
  searchTerm?: string,
) => {
  // Normalize empty string to undefined for consistent query keys
  const normalizedSearchTerm =
    searchTerm && searchTerm.trim() !== '' ? searchTerm.trim() : undefined;

  return useQuery(
    ['positions', currentPage, pageSize, normalizedSearchTerm],
    () => getPositions(currentPage, pageSize, normalizedSearchTerm),
    {
      keepPreviousData: true,
    },
  );
};
export const useGetAllPositions = () => {
  return useQuery('allPositions', getAllPositions);
};
export const useGetPositionsById = (id: string) => {
  return useQuery(['positions', id], () => getPositionsByID(id));
};
