import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';

const getAllUsersWithOutPagination = async () => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      // tenantId: tenantId,
      tenantId: tenantId,
    },
  });
};
export const useGetAllUsers = () =>
  useQuery<any>('employeesWithOutPagination', getAllUsersWithOutPagination);
