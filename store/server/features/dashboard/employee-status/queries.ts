import { requestHeader } from '@/helpers/requestHeader';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { EmployeeStatusDashboard } from '@/store/uistate/features/dashboard/employee-status/interface';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

type ResponseData = EmployeeStatusDashboard[];

/**
 * Function to fetch employee status by sending a GET request to the API
 * @param id - The employee type ID or parameter
 * @returns The response data from the API
 */
const getEmployeeStatus = async (id: string) => {
  const requestHeaders = await requestHeader();
  const response = await crudRequest({
    url: `${ORG_AND_EMP_URL}/employement-type/type/employee?type=${id}`,
    method: 'GET',
    headers: requestHeaders,
  });
  return response;
};

export const useGetEmployeeStatus = (id: string) =>
  useQuery<ResponseData>(
    ['employeeStatus', id], // Use id as part of the query key
    () => getEmployeeStatus(id), // Pass function reference to useQuery
    {
      keepPreviousData: true,
    },
  );
