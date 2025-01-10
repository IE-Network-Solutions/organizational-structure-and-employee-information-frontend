import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { ORG_AND_EMP_URL, PAYROLL_DEV_URL } from '@/utils/constants';

const getPayRoll = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${PAYROLL_DEV_URL}/payroll`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetPayRoll = () => useQuery('taxRules', getPayRoll);

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

const getActivePayroll = async () => {
  const token = useAuthenticationStore.getState().token;
  const tenantId = useAuthenticationStore.getState().tenantId;
  return crudRequest({
    url: `${PAYROLL_DEV_URL}/payroll/find-all-payroll-by-pay-period`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      tenantId: tenantId,
    },
  });
};
export const useGetActivePayroll = () => useQuery('payroll', getActivePayroll);
