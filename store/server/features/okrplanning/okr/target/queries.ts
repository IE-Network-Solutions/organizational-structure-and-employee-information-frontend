import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { OKR_AND_PLANNING_URL } from '@/utils/constants';

const token = useAuthenticationStore.getState().token;
const tenantId = useAuthenticationStore.getState().tenantId;

const getTargetAssignment = async () => {
  return crudRequest({
    url: `${OKR_AND_PLANNING_URL}/criteria-targets`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};

export const useTargetAssignment = () =>
  useQuery('targetAssignment', getTargetAssignment);
