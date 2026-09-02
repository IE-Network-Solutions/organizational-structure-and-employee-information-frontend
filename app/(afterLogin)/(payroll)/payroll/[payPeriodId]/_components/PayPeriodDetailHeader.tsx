'use client';

import React, { useState } from 'react';
import { Button, Modal, notification } from 'antd';
import { CheckOutlined, FileSyncOutlined } from '@ant-design/icons';
import { useParams } from 'next/navigation';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import {
  useGetActivePayroll,
  useGetAllActiveBasicSalary,
} from '@/store/server/features/payroll/payroll/queries';
import {
  useCreatePayroll,
  useDeletePayroll,
} from '@/store/server/features/payroll/payroll/mutation';
import {
  useApprovePayrollApproval,
  useLastApprovingPayroll,
} from '@/store/server/features/payroll/payrollApproval/mutation';
import { usePayrollApproveVisibility } from '@/store/server/features/payroll/payrollApproval/usePayrollApproveVisibility';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import GeneratePayrollModal, { Incentive } from '../../_components/modal';
import { useIsMobile } from '@/hooks/useIsMobile';

const PayPeriodDetailHeader = () => {
  const params = useParams();
  const payPeriodId = String(params?.payPeriodId || '');
  const { isMobile, isTablet } = useIsMobile();
  const { userId } = useAuthenticationStore();
  const authStore = useAuthenticationStore.getState();
  const tenantId = authStore.tenantId;
  const userRollId = authStore.userData?.roleId;

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);

  const searchQuery = payPeriodId ? `&payPeriodId=${payPeriodId}` : '';
  const { data: payroll, refetch } = useGetActivePayroll(searchQuery, 1, 1);
  const { data: allActiveSalary } = useGetAllActiveBasicSalary();
  const hasPayroll = (payroll?.items?.length || 0) > 0;
  const {
    showApproveButton,
    pendingApproval,
    payrollApprovalForPeriod,
    refetchPendingApprovals,
    refetchPayrollApprovalForPeriod,
  } = usePayrollApproveVisibility(payPeriodId, hasPayroll);

  const { mutate: createPayroll, isLoading: isCreatingPayroll } =
    useCreatePayroll();
  const { isLoading: deleteLoading } = useDeletePayroll();
  const { mutate: approvePayroll, isLoading: isApproving } =
    useApprovePayrollApproval();
  const { mutate: lastApproving, isLoading: isLastApproving } =
    useLastApprovingPayroll();

  const canGenerateOrRegenerate =
    !payrollApprovalForPeriod || payrollApprovalForPeriod?.approved === false;

  const handleGeneratePayroll = async (data: Incentive) => {
    if (!allActiveSalary || allActiveSalary?.length === 0) {
      notification.error({
        message: 'No Active Salaries',
        description:
          'There is no active salary data available to generate payroll.',
      });
      return;
    }

    createPayroll(
      {
        values: {
          payrollItems: allActiveSalary.map((item: any) => ({
            ...item,
            basicSalary: parseInt(item.basicSalary, 10),
          })),
          includeIncentive: data.includeIncentive,
        },
      },
      {
        onSuccess: () => {
          setIsPayrollModalOpen(false);
          refetch();
          refetchPayrollApprovalForPeriod();
        },
      },
    );
  };

  const handleApprovePayroll = () => {
    if (!pendingApproval) return;

    const approvalWorkflowId = String(pendingApproval.approvalWorkflowId || '');
    const stepOrder = Number(pendingApproval.nextApprover?.[0]?.stepOrder || 0);

    if (!approvalWorkflowId || stepOrder === 0) {
      notification.error({
        message: 'Invalid Approval Data',
        description: 'Missing required approval information. Please try again.',
      });
      return;
    }

    const handleSuccess = () => {
      setIsApproveModalOpen(false);
      refetchPendingApprovals();
      refetchPayrollApprovalForPeriod();
      refetch();
    };

    approvePayroll(
      {
        approvalWorkflowId,
        stepOrder,
        requestId: pendingApproval.id,
        approvedUserId: userId,
        approverRoleId: userRollId,
        action: 'Approved',
        tenantId,
      },
      {
        onSuccess: (data) => {
          if (data?.last === true) {
            lastApproving(payPeriodId, { onSuccess: handleSuccess });
          } else {
            handleSuccess();
          }
        },
      },
    );
  };

  return (
    <div
      className="flex flex-wrap items-center gap-3"
      data-cy="payroll-period-detail-header-actions"
    >
      {showApproveButton && (
        <Button
          type="primary"
          icon={<CheckOutlined />}
          className="h-10"
          onClick={() => setIsApproveModalOpen(true)}
          data-cy="payroll-period-approve-button"
        >
          {isMobile || isTablet ? 'Approve' : 'Approve Payroll'}
        </Button>
      )}

      {canGenerateOrRegenerate && (
        <AccessGuard
          permissions={[Permissions.GeneratePayroll, Permissions.DeletePayroll]}
        >
          {/* <Popconfirm
            title={
              hasPayroll
                ? 'Are you sure you want to regenerate the payroll ?'
                : 'Are you sure you want to generate the payroll ?'
            }
            onConfirm={() => {
              if (hasPayroll) deletePayroll(payPeriodId);
            }}
            okText="Yes"
            cancelText="No"
            disabled={!hasPayroll}
          > */}
          <Button
            type="primary"
            icon={<FileSyncOutlined />}
            className="h-10"
            onClick={() => setIsPayrollModalOpen(true)}
            loading={isCreatingPayroll || deleteLoading}
            data-cy="payroll-period-regenerate-button"
          >
            {hasPayroll ? 'Regenerate' : 'Generate'}
          </Button>
          {/* </Popconfirm> */}
        </AccessGuard>
      )}

      {isPayrollModalOpen && (
        <GeneratePayrollModal
          onGenerate={handleGeneratePayroll}
          onClose={() => setIsPayrollModalOpen(false)}
          loading={isCreatingPayroll}
          isRegenerate={hasPayroll}
        />
      )}

      <Modal
        open={isApproveModalOpen}
        onCancel={() => setIsApproveModalOpen(false)}
        footer={null}
        centered
        width={600}
      >
        <div
          className="flex flex-col items-center justify-center gap-4"
          data-cy="payroll-approve-modal-content"
        >
          <h2
            className="text-2xl font-bold"
            data-cy="payroll-approve-modal-title"
          >
            Approve Payroll
          </h2>
          <p
            className="text-lg text-gray-600"
            data-cy="payroll-approve-modal-description"
          >
            Do you wish to Approve this payroll
          </p>
          <div
            className="mt-4 flex w-full justify-center gap-4"
            data-cy="payroll-approve-modal-actions"
          >
            <Button
              className="h-12 w-full text-lg font-semibold"
              onClick={() => setIsApproveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="h-12 w-full bg-primary text-lg font-semibold"
              onClick={handleApprovePayroll}
              loading={isApproving || isLastApproving}
            >
              Approve
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PayPeriodDetailHeader;
