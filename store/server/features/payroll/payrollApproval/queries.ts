import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { PAYROLL_URL } from '@/utils/constants';
import { requestHeader } from '@/helpers/requestHeader';

const getPendingPayrollApprovals = async (
  payPeriodId?: string,
  page?: number,
  limit?: number,
  orderBy?: string,
  orderDirection?: string,
) => {
  const requestHeaders = await requestHeader();
  const authStore = useAuthenticationStore.getState();
  const userRollId = authStore.userData?.roleId;
  
  const queryParams = new URLSearchParams();
  
  if (page) queryParams.append('page', page.toString());
  if (limit) queryParams.append('limit', limit.toString());
  if (orderBy) queryParams.append('orderBy', orderBy);
  if (orderDirection) queryParams.append('orderDirection', orderDirection);

  const url = `${PAYROLL_URL}/payroll-approval/pending${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const headers: Record<string, string> = {
    ...requestHeaders,
    ...(userRollId && { approverUserRoleId: userRollId }),
  };
  
  return crudRequest({
    url,
    method: 'GET',
    headers,
  });
};

export const useGetPendingPayrollApprovals = (
  payPeriodId?: string,
  page?: number,
  limit?: number,
  orderBy?: string,
  orderDirection?: string,
) => {
  const token = useAuthenticationStore.getState().token;
  return useQuery(
    ['pendingPayrollApprovals', payPeriodId, page, limit, orderBy, orderDirection],
    () => getPendingPayrollApprovals(payPeriodId, page, limit, orderBy, orderDirection),
    {
      keepPreviousData: true,
      enabled: !!token,
    },
  );
};

const getPayrollApprovalByPayPeriodId = async (payPeriodId: string) => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${PAYROLL_URL}/payroll-approval/pay-period`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetPayrollApprovalByPayPeriodId = (payPeriodId?: string) => {
  const token = useAuthenticationStore.getState().token;
  return useQuery(
    ['payrollApprovalByPayPeriodId', payPeriodId],
    () => getPayrollApprovalByPayPeriodId(payPeriodId!),
    {
      keepPreviousData: true,
      enabled: !!token && !!payPeriodId,
    },
  );
};

