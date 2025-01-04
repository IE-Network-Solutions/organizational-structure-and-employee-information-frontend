import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import axios from 'axios';
import { useQuery } from 'react-query';

const getBasicSalaryById = async (id: string) => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };
    const response = await axios.get(
      `${ORG_AND_EMP_URL}/basic-salary/user/${id}`,
      {
        headers,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const useGetBasicSalaryById = (empId: string) =>
  useQuery<any>(['basicSalary', empId], () => getBasicSalaryById(empId));
