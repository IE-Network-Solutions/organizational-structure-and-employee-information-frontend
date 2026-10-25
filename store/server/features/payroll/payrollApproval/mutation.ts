import { useMutation, useQueryClient } from 'react-query';
import { requestHeader } from '@/helpers/requestHeader';
import { crudRequest } from '@/utils/crudRequest';
import { APPROVER_URL, PAYROLL_URL } from '@/utils/constants';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import type { PayrollGenerationType } from './generationTypes';

const approvePayrollApproval = async (data: any) => {
  const requestHeaders = await requestHeader();
  return await crudRequest({
    url: `${APPROVER_URL}/approver/approvalLog`,
    method: 'POST',
    headers: requestHeaders,
    data,
  });
};

const lastApprovingPayroll = async ({
  payPeriodId,
  generationType = 'PAYROLL',
}: {
  payPeriodId?: string;
  generationType?: PayrollGenerationType;
}) => {
  const requestHeaders = await requestHeader();
  const params = new URLSearchParams({ generationType });
  if (payPeriodId) params.append('payPeriodId', payPeriodId);
  const query = `?${params.toString()}`;
  return await crudRequest({
    url: `${PAYROLL_URL}/payroll-approval/lastapproving${query}`,
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
      queryClient.invalidateQueries('payrollApprovalsOfPayPeriod');
      queryClient.invalidateQueries('payrollApprovals');
      queryClient.invalidateQueries('payrollApprovalStatus');
      queryClient.invalidateQueries('payrollApprovalLogs');
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
  return useMutation(lastApprovingPayroll, {
    onSuccess: () => {
      queryClient.invalidateQueries('pendingPayrollApprovals');
      queryClient.invalidateQueries('payroll');
      queryClient.invalidateQueries('payrollApprovalByPayPeriodId');
      queryClient.invalidateQueries('payrollApprovalsOfPayPeriod');
      queryClient.invalidateQueries('payrollApprovals');
      queryClient.invalidateQueries('payrollApprovalStatus');
      queryClient.invalidateQueries('payrollApprovalLogs');
      NotificationMessage.success({
        message: 'Payroll Approved',
        description: 'Payroll has been successfully approved.',
      });
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message: 'Final Approval Failed',
        description:
          error?.response?.data?.message || 'Failed to complete final approval',
      });
    },
  });
};

const revokePayrollApproval = async ({
  payPeriodId,
  generationType = 'PAYROLL',
}: {
  payPeriodId?: string;
  generationType?: PayrollGenerationType;
}) => {
  const requestHeaders = await requestHeader();
  const params = new URLSearchParams({ generationType });
  if (payPeriodId) params.append('payPeriodId', payPeriodId);
  return await crudRequest({
    url: `${PAYROLL_URL}/payroll-approval/revoke?${params.toString()}`,
    method: 'PUT',
    headers: requestHeaders,
  });
};

/** Takes back the final approval of one generation and restarts its approval chain. */
export const useRevokePayrollApproval = () => {
  const queryClient = useQueryClient();
  return useMutation(revokePayrollApproval, {
    onSuccess: () => {
      queryClient.invalidateQueries('pendingPayrollApprovals');
      queryClient.invalidateQueries('payroll');
      queryClient.invalidateQueries('payrollApprovalByPayPeriodId');
      queryClient.invalidateQueries('payrollApprovalsOfPayPeriod');
      queryClient.invalidateQueries('payrollApprovals');
      queryClient.invalidateQueries('payrollApprovalStatus');
      queryClient.invalidateQueries('payrollApprovalLogs');
      NotificationMessage.success({
        message: 'Approval Revoked',
        description:
          'The approval was taken back and has to be approved again from the first level.',
      });
    },
    onError: (error: any) => {
      NotificationMessage.error({
        message: 'Revoke Failed',
        description:
          error?.response?.data?.message || 'Failed to revoke the approval',
      });
    },
  });
};
