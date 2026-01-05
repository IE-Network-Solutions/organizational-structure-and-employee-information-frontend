import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { getCurrentToken } from '@/utils/getCurrentToken';

const getEmployeementTypes = async (page?: number, pageSize?: number) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;
  let url;
  if (page && pageSize) {
    url = `${ORG_AND_EMP_URL}/employement-type?page=${page}&limit=${pageSize}`;
  } else {
    url = `${ORG_AND_EMP_URL}/employement-type`;
  }
  return crudRequest({
    url: url,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    },
  });
};

export const useGetEmployementTypes = (page?: number, pageSize?: number) =>
  useQuery(
    ['employeementTypes', page, pageSize],
    () => getEmployeementTypes(page, pageSize),
    { keepPreviousData: true },
  );
