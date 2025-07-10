import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { ORG_AND_EMP_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { requestHeader } from '@/helpers/requestHeader';
import { useQuery } from 'react-query';

const getEmployee = async (id: string) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users/${id}`,
    method: 'GET',
    headers: requestHeader(),
  });
};

const getSimpleEmployee = async (id: string) => {
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users/simple-info/${id}`,
    method: 'GET',
    headers: requestHeader(),
  });
};

export const useGetSimpleEmployee = (empId: string) =>
  useQuery<any>(['employee', empId], () => getSimpleEmployee(empId), {
    keepPreviousData: true,
    enabled: !!empId,
  });

export const useGetEmployee = (empId: string) => {
  const token = useAuthenticationStore.getState().token;
  return useQuery<any>(['employeeItemData', empId], () => getEmployee(empId), {
    keepPreviousData: true,
    enabled: empId?.length > 0 || !!token,
  });
};
