import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';
import { useQuery } from 'react-query';
import { crudRequest } from '@/utils/crudRequest';

const getBasicSalaryById = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };
    const response = await crudRequest({
      url: `${ORG_AND_EMP_URL}/basic-salary/user/${id}`,
      method: 'GET',
      headers,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const useGetBasicSalaryById = (empId: string) =>
  useQuery<any>(['basicSalary', empId], () => getBasicSalaryById(empId));
