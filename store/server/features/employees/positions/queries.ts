import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { usePositionState } from '@/store/uistate/features/employees/positions';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

const getPositions = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  const pageSize = usePositionState.getState().pageSize;
  const currentPage = usePositionState.getState().currentPage;
  const headers = {
    Authorization: `Bearer ${token}`,
    tenantId: tenantId,
  };

  return await crudRequest({
    url: `${ORG_AND_EMP_URL}/positions?limit=${pageSize}&&page=${currentPage}`,
    method: 'GET',
    headers,
  });
};

const getPositionsByID = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
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

export const useGetPositions = () => {
  return useQuery('positions', getPositions);
};
export const useGetPositionsById = (id: string) => {
  return useQuery(['positions', id], () => getPositionsByID(id));
};
