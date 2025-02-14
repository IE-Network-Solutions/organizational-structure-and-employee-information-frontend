import { useQuery } from 'react-query';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL, PAYROLL_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';

const getEmployeeInfo = async () => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users/simple-info/all-user-net-pay/with-tenant`,
    method: 'GET',
    headers: requestHeader(),
  });
};
export const useGetEmployeeInfo = () =>
  useQuery('EmployeeInfo', getEmployeeInfo);

const getAllowance = async () => {
  return crudRequest({
    url: `${PAYROLL_URL}/compensation-items`,
    method: 'GET',
    headers: requestHeader(),
  });
};
export const useGetAllowance = () => useQuery('AllowanceData', getAllowance);
