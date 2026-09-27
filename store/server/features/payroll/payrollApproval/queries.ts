import { useQuery } from 'react-query';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { crudRequest } from '@/utils/crudRequest';
import { APPROVER_URL, PAYROLL_URL } from '@/utils/constants';
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
  if (payPeriodId) queryParams.append('payPeriodId', payPeriodId);

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
    [
      'pendingPayrollApprovals',
      payPeriodId,
      page,
      limit,
      orderBy,
      orderDirection,
    ],
    () =>
      getPendingPayrollApprovals(
        payPeriodId,
        page,
        limit,
        orderBy,
        orderDirection,
      ),
    {
      keepPreviousData: true,
      enabled: !!token,
    },
  );
};

const getAllPayrollApprovals = async () => {
  const requestHeaders = await requestHeader();
  return crudRequest({
    url: `${PAYROLL_URL}/payroll-approval`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetAllPayrollApprovals = () => {
  const token = useAuthenticationStore.getState().token;
  return useQuery(['payrollApprovals'], () => getAllPayrollApprovals(), {
    keepPreviousData: true,
    enabled: !!token,
  });
};

const getPayrollApprovalByPayPeriodId = async (payPeriodId?: string) => {
  const requestHeaders = await requestHeader();
  const query = payPeriodId
    ? `?payPeriodId=${encodeURIComponent(payPeriodId)}`
    : '';
  return crudRequest({
    url: `${PAYROLL_URL}/payroll-approval/pay-period${query}`,
    method: 'GET',
    headers: requestHeaders,
  });
};

export const useGetPayrollApprovalByPayPeriodId = (payPeriodId?: string) => {
  const token = useAuthenticationStore.getState().token;
  return useQuery(
    ['payrollApprovalByPayPeriodId', payPeriodId],
    () => getPayrollApprovalByPayPeriodId(payPeriodId),
    {
      keepPreviousData: true,
      enabled: !!token && !!payPeriodId,
    },
  );
};

const getPayrollApprovalStatus = async (
  requestId: string,
  workflowId: string,
) => {
  const requestHeaders = await requestHeader();
  try {
    return await crudRequest({
      url: `${APPROVER_URL}/approver/status/${requestId}/${workflowId}`,
      method: 'GET',
      headers: requestHeaders,
    });
  } catch (error: any) {
    const statusCode = error?.response?.status ?? error?.statusCode;
    if (statusCode === 404) {
      return [];
    }
    throw error;
  }
};

export const useGetPayrollApprovalStatus = (
  requestId?: string,
  workflowId?: string,
  enabled = true,
) => {
  const token = useAuthenticationStore.getState().token;
  return useQuery(
    ['payrollApprovalStatus', requestId, workflowId],
    () => getPayrollApprovalStatus(requestId!, workflowId!),
    {
      keepPreviousData: true,
      enabled: !!token && !!requestId && !!workflowId && enabled,
      retry: false,
    },
  );
};

const getPayrollApprovalLogs = async (requestId: string) => {
  const requestHeaders = await requestHeader();
  try {
    return await crudRequest({
      url: `${APPROVER_URL}/approval-logs/${requestId}`,
      method: 'GET',
      headers: requestHeaders,
    });
  } catch (error: any) {
    const statusCode = error?.response?.status ?? error?.statusCode;
    if (statusCode === 404) {
      return { items: [] };
    }
    throw error;
  }
};

export const useGetPayrollApprovalLogs = (requestId?: string) => {
  const token = useAuthenticationStore.getState().token;
  return useQuery(
    ['payrollApprovalLogs', requestId],
    () => getPayrollApprovalLogs(requestId!),
    {
      keepPreviousData: true,
      enabled: !!token && !!requestId,
    },
  );
};
