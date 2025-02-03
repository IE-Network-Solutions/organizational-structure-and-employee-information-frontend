import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL, PAYROLL_URL } from '@/utils/constants';

const getPayRoll = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${PAYROLL_URL}/payroll`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetPayRoll = () => useQuery('payroll', getPayRoll);

const getAllActiveBasicSalary = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/basic-salary/active`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetAllActiveBasicSalary = () =>
  useQuery('allBasicSalary', getAllActiveBasicSalary);

const getActivePayroll = async (searchParams = '') => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${PAYROLL_URL}/payroll/find-all-payroll-by-pay-period${searchParams}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetActivePayroll = (searchParams = '') =>
  useQuery(['payroll', searchParams], () => getActivePayroll(searchParams), {
    enabled: true,
  });

const getPayPeroid = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${PAYROLL_URL}/pay-period`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
const getPensionRule = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${PAYROLL_URL}/pension-rule`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetPayPeriod = () => useQuery('pay-peroid', getPayPeroid);
export const useGetAllPensionRule = () =>
  useQuery('pension-rule', getPensionRule);

const getEmployeeInfo = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${ORG_AND_EMP_URL}/users/simple-info/all-user-net-pay/with-tenant`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetEmployeeInfo = () =>
  useQuery('EmployeeInfo', getEmployeeInfo);
