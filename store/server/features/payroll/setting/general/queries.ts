import { requestHeader } from '@/helpers/requestHeader';
import { PAYROLL_URL } from '@/utils/constants';
import { crudRequest } from '@/utils/crudRequest';
import { useQuery } from 'react-query';

export type PayrollSettings = {
  applyWorkingDaysToVpOnly?: boolean;
  [key: string]: unknown;
};

const getPayrollSettings = async (): Promise<PayrollSettings> => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${PAYROLL_URL}/payroll-settings`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetPayrollSettings = () =>
  useQuery(['payroll-settings'], getPayrollSettings);
