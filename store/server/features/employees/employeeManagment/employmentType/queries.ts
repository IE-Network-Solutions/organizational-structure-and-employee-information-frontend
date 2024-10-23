import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const getEmployeementTypes = async (page: number, pageSize: number) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/employement-type?page=${page}&limit=${pageSize}`,
    // url: `${ORG_AND_EMP_URL}/employement-type`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};

export const useGetEmployementTypes = (page: number, pageSize: number) =>
  useQuery(
    ['employeementTypes', page, pageSize],
    () => getEmployeementTypes(page, pageSize),
    { keepPreviousData: true },
  );
