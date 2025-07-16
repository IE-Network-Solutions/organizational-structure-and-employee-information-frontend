import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import axios from 'axios';
import { useQuery } from 'react-query';
import { getCurrentToken } from '@/utils/getCurrentToken';

const getEmployee = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    };
    const response = await axios.get(`${ORG_AND_EMP_URL}/users/${id}`, {
      headers,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getSimpleEmployee = async (id: string) => {
  const token = await getCurrentToken();
  const tenantId = useAuthenticationStore.getState().tenantId;

  try {
    const response = await axios.get(
      `${ORG_AND_EMP_URL}/users/simple-info/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          tenantId: tenantId,
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const useGetSimpleEmployee = (empId: string) =>
  useQuery<any>(['employee', empId], () => getSimpleEmployee(empId), {
    keepPreviousData: true,
    enabled: !!empId,
  });
export const useGetEmployee = async (empId: string) => {
  const token = await getCurrentToken();
  return useQuery<any>(['employeeItemData', empId], () => getEmployee(empId), {
    keepPreviousData: true,
    enabled: empId?.length > 0 || !!token,
  });
};
