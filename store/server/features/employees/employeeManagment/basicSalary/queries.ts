import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';

const getBasicSalaryById = async (id: string) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/basic-salary/user/${id}`,
    method: 'GET',
    headers: requestHeader(),
  });
};

export const useGetBasicSalaryById = (empId: string) =>
  useQuery<any>(['basicSalary', empId], () => getBasicSalaryById(empId));
