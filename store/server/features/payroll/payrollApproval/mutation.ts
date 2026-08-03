import { useMutation, useQueryClient } from 'react-query';
import { requestHeader } from '@/helpers/requestHeader';
import { crudRequest } from '@/utils/crudRequest';
import { APPROVER_URL, PAYROLL_URL } from '@/utils/constants';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const approvePayrollApproval = async (data: any) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${APPROVER_URL}/approver/approvalLog`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

const lastApprovingPayroll = async (queryParams = '') => {
  const requestHeaders = await requestHeader();
  const qs = queryParams ? `?${queryParams.replace(/^\?/, '')}` : '';
  return await crudRequest({
    url: `${PAYROLL_URL}/payroll-approval/lastapproving${qs}`,
    method: 'PUT',
    headers: requestHeaders,
  });
};

export const useApprovePayrollApproval = () => {
  const queryClient = useQueryClient();
  return useMutation(approvePayrollApproval, {
    onSuccess: () => {
      queryClient.invalidateQueries('pendingPayrollApprovals');
      queryClient.invalidateQueries('payroll');
      queryClient.invalidateQueries('payrollApprovalByPayPeriodId');
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message: 'Approval Failed',
        description:
          error?.response?.data?.message || 'Failed to approve payroll',
      });
    },
  });
};

export const useLastApprovingPayroll = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (queryParams?: string) => lastApprovingPayroll(queryParams || ''),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pendingPayrollApprovals');
        queryClient.invalidateQueries('payroll');
        queryClient.invalidateQueries('payrollApprovalByPayPeriodId');
        NotificationMessage.success({
          message: 'Payroll Approved',
          description: 'Payroll has been successfully approved.',
        });
      },
      onError: (error: any) => {
        NotificationMessage.error({
          message: 'Final Approval Failed',
          description:
            error?.response?.data?.message ||
            'Failed to complete final approval',
        });
      },
    },
  );
};
