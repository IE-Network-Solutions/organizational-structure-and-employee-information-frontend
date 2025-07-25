import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { EmployeeStatusDashboard } from '@/store/uistate/features/dashboard/employee-status/interface';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { getCurrentToken } from '@/utils/getCurrentToken';
import axios from 'axios';
import { useQuery } from 'react-query';

type ResponseData = EmployeeStatusDashboard[];

/**
 * Function to fetch employee status by sending a GET request to the API
 * @param id - The employee type ID or parameter
 * @returns The response data from the API
 */
const getEmployeeStatus = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const headers = {
      Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
      tenantId: tenantId, // Pass tenantId in the headers
    };
    const response = await axios.get(
      `${ORG_AND_EMP_URL}/employement-type/type/employee?type=${id}`,
      {
        headers,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const useGetEmployeeStatus = (id: string) =>
  useQuery<ResponseData>(
    ['employeeStatus', id], // Use id as part of the query key
    () => getEmployeeStatus(id), // Pass function reference to useQuery
    {
      keepPreviousData: true,
    },
  );
