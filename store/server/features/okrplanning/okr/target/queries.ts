import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { OKR_AND_PLANNING_URL, ORG_AND_EMP_URL } from '@/utils/constants';

const getTargetAssignment = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_AND_PLANNING_URL}/criteria-targets`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetTargetAssignment = () =>
  useQuery('targetAssignment', getTargetAssignment);

const getActiveSession = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/session/active/session`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useGetActiveSession = () =>
  useQuery('active-session', getActiveSession);

const getTargetAssignmentById = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${OKR_AND_PLANNING_URL}/criteria-targets/${id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetTargetAssignmentById = (id: string) =>
  useQuery(['targetAssignment', id], () => getTargetAssignmentById(id));