'use client';

import React, { useMemo, useState } from 'react';
import { Button, Modal, Skeleton, Tag, notification } from 'antd';
import { CheckOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import Link from 'next/link';
import dayjs from 'dayjs';
import { MOCK_PAYROLL_ROWS } from '@/config/homeApprovalsMock';
import MockApprovalInboxTable from './MockApprovalInboxTable';
import PayrollApprovalStatusBar from '@/app/(afterLogin)/(payroll)/payroll/_components/PayrollApprovalStatusBar';
import {
  useGetActivePayroll,
  useGetPayPeriod,
} from '@/store/server/features/payroll/payroll/queries';
import { PayPeriod } from '@/store/server/features/payroll/payroll/interface';
import {
  useApprovePayrollApproval,
  useLastApprovingPayroll,
} from '@/store/server/features/payroll/payrollApproval/mutation';
import { useGetPendingPayrollApprovals } from '@/store/server/features/payroll/payrollApproval/queries';
import { usePayrollApproveVisibility } from '@/store/server/features/payroll/payrollApproval/usePayrollApproveVisibility';
import { isCurrentApproverForItem } from '@/store/server/features/payroll/payrollApproval/payrollApprovalVisibility';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

type PayrollApprovalPeriodCardProps = {
  payPeriodId: string;
  payPeriod?: PayPeriod;
  pendingItem: any;
};

function PayrollApprovalPeriodCard({
  payPeriodId,
  payPeriod,
  pendingItem,
}: PayrollApprovalPeriodCardProps) {
  const { userId } = useAuthenticationStore();
  const authStore = useAuthenticationStore.getState();
  const tenantId = authStore.tenantId;
  const userRollId = authStore.userData?.roleId;

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const searchQuery = payPeriodId ? `&payPeriodId=${payPeriodId}` : '';
  const { data: payroll, refetch: refetchPayroll } = useGetActivePayroll(
    searchQuery,
    1,
    1,
  );
  const hasPayroll = (payroll?.items?.length || 0) > 0;
  const employeeCount =
    payroll?.meta?.totalItems ?? payroll?.items?.length ?? 0;

  const {
    showApproveButton,
    pendingApproval,
    refetchPendingApprovals,
    refetchPayrollApprovalForPeriod,
  } = usePayrollApproveVisibility(payPeriodId, hasPayroll);

  const { mutate: approvePayroll, isLoading: isApproving } =
    useApprovePayrollApproval();
  const { mutate: lastApproving, isLoading: isLastApproving } =
    useLastApprovingPayroll();

  const stepOrder = Number(pendingItem?.nextApprover?.[0]?.stepOrder || 0);
  const periodLabel = payPeriod
    ? dayjs(payPeriod.startDate).format('MMMM YYYY')
    : 'Pay period';
  const payDateLabel = payPeriod?.updatedAt
    ? dayjs(payPeriod.updatedAt).format('MMM D, YYYY')
    : payPeriod?.endDate
      ? dayjs(payPeriod.endDate).format('MMM D, YYYY')
      : '—';

  const handleApprovePayroll = () => {
    if (!pendingApproval) return;

    const approvalWorkflowId = String(pendingApproval.approvalWorkflowId || '');
    const approvalStepOrder = Number(
      pendingApproval.nextApprover?.[0]?.stepOrder || 0,
    );

    if (!approvalWorkflowId || approvalStepOrder === 0) {
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
      refetchPayroll();
    };

    approvePayroll(
      {
        approvalWorkflowId,
        stepOrder: approvalStepOrder,
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
    <article
      className="flex flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-none"
      data-cy={`home-approvals-payroll-period-${payPeriodId}`}
    >
      <div
        className="flex items-start justify-between gap-3"
        data-cy={`home-approvals-payroll-period-header-${payPeriodId}`}
      >
        <div data-cy={`home-approvals-payroll-period-copy-${payPeriodId}`}>
          <h3
            className="text-base font-semibold text-gray-900"
            data-cy={`home-approvals-payroll-period-title-${payPeriodId}`}
          >
            {periodLabel}
          </h3>
          <p
            className="text-xs text-gray-500"
            data-cy={`home-approvals-payroll-period-date-${payPeriodId}`}
          >
            Pay date: {payDateLabel}
          </p>
        </div>
        <div
          className="flex items-center gap-2"
          data-cy={`home-approvals-payroll-period-status-${payPeriodId}`}
        >
          <ExclamationCircleFilled className="text-base text-[#F97316]" />
          <Tag color="gold" className="m-0">
            Pending{stepOrder ? ` · Level ${stepOrder}` : ''}
          </Tag>
        </div>
      </div>

      {employeeCount > 0 ? (
        <p
          className="text-sm text-gray-600"
          data-cy={`home-approvals-payroll-period-employees-${payPeriodId}`}
        >
          {employeeCount} employees in this run
        </p>
      ) : null}

      <PayrollApprovalStatusBar payPeriodId={payPeriodId} />

      <div
        className="flex flex-wrap gap-2"
        data-cy={`home-approvals-payroll-period-actions-${payPeriodId}`}
      >
        {showApproveButton ? (
          <Button
            type="primary"
            icon={<CheckOutlined />}
            className="!h-9"
            onClick={() => setIsApproveModalOpen(true)}
            data-cy={`home-approvals-payroll-approve-button-${payPeriodId}`}
          >
            Approve Payroll
          </Button>
        ) : null}
        <Link
          href={`/payroll/${payPeriodId}/payroll`}
          data-cy={`home-approvals-payroll-link-${payPeriodId}`}
        >
          <Button className="!h-9">Open in Payroll</Button>
        </Link>
      </div>

      <Modal
        open={isApproveModalOpen}
        onCancel={() => setIsApproveModalOpen(false)}
        footer={null}
        centered
        width={600}
        data-cy={`home-approvals-payroll-approve-modal-${payPeriodId}`}
      >
        <div
          className="flex flex-col items-center justify-center gap-4"
          data-cy={`home-approvals-payroll-approve-modal-content-${payPeriodId}`}
        >
          <h2
            className="text-2xl font-bold"
            data-cy={`home-approvals-payroll-approve-modal-title-${payPeriodId}`}
          >
            Approve Payroll
          </h2>
          <p
            className="text-lg text-gray-600"
            data-cy={`home-approvals-payroll-approve-modal-description-${payPeriodId}`}
          >
            Do you wish to approve payroll for {periodLabel}?
          </p>
          <div
            className="mt-4 flex w-full justify-center gap-4"
            data-cy={`home-approvals-payroll-approve-modal-actions-${payPeriodId}`}
          >
            <Button
              className="h-12 w-full text-lg font-semibold"
              onClick={() => setIsApproveModalOpen(false)}
              data-cy={`home-approvals-payroll-approve-modal-cancel-${payPeriodId}`}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="h-12 w-full bg-primary text-lg font-semibold"
              onClick={handleApprovePayroll}
              loading={isApproving || isLastApproving}
              data-cy={`home-approvals-payroll-approve-modal-confirm-${payPeriodId}`}
            >
              Approve
            </Button>
          </div>
        </div>
      </Modal>
    </article>
  );
}

export default function PayrollApprovalsPanel() {
  const { userId } = useAuthenticationStore();
  const { data: payPeriodData, isLoading: isPayPeriodLoading } =
    useGetPayPeriod();
  const { data: pendingApprovals, isLoading: isPendingLoading } =
    useGetPendingPayrollApprovals(undefined, 1, 50);

  const pendingForUser = useMemo(() => {
    const items = pendingApprovals?.items ?? [];
    return items.filter((item: any) =>
      isCurrentApproverForItem(item, userId || ''),
    );
  }, [pendingApprovals?.items, userId]);

  const payPeriodById = useMemo(() => {
    const map = new Map<string, PayPeriod>();
    (payPeriodData ?? []).forEach((period: PayPeriod) => {
      map.set(period.id, period);
    });
    return map;
  }, [payPeriodData]);

  const isLoading = isPayPeriodLoading || isPendingLoading;

  return (
    <div
      className="flex min-w-0 max-w-full w-full flex-col gap-3"
      data-cy="home-approvals-payroll-panel"
    >
      <h2
        className="text-sm font-semibold text-gray-900"
        data-cy="home-approvals-payroll-title"
      >
        Pay periods
      </h2>

      {isLoading ? (
        <div
          className="grid grid-cols-1 gap-3 lg:grid-cols-2"
          data-cy="home-approvals-payroll-loading"
        >
          {Array.from({ length: 2 }).map((unusedItem, index) => (
            <div
              key={index}
              className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-none"
              data-cy={`home-approvals-payroll-skeleton-${index}`}
            >
              <Skeleton active paragraph={{ rows: 3 }} />
            </div>
          ))}
        </div>
      ) : (
        <>
          {pendingForUser.length > 0 ? (
            <div
              className="grid grid-cols-1 gap-3 lg:grid-cols-2"
              data-cy="home-approvals-payroll-period-grid"
            >
              {pendingForUser.map((pendingItem: any) => {
                const payPeriodId = String(pendingItem.payPeriodId || '');
                if (!payPeriodId) return null;
                return (
                  <PayrollApprovalPeriodCard
                    key={payPeriodId}
                    payPeriodId={payPeriodId}
                    payPeriod={payPeriodById.get(payPeriodId)}
                    pendingItem={pendingItem}
                  />
                );
              })}
            </div>
          ) : null}
          <MockApprovalInboxTable
            rows={MOCK_PAYROLL_ROWS}
            inboxLabel="Pending payroll approvals"
            dataCyPrefix="home-approvals-payroll-mock"
            hidePrototypeNote={pendingForUser.length > 0}
            actionVariant="payroll"
          />
        </>
      )}
    </div>
  );
}
