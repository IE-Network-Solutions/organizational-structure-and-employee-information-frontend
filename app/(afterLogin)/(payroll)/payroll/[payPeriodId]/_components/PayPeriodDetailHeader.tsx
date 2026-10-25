'use client';

import React, { useMemo, useState } from 'react';
import { Button, Dropdown, Modal, notification } from 'antd';
import {
  CheckOutlined,
  DownOutlined,
  FileSyncOutlined,
} from '@ant-design/icons';
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
import { usePayrollApproveVisibility } from '@/store/server/features/payroll/payrollApproval/usePayrollApproveVisibility';
import { usePayrollApproveAction } from '@/store/server/features/payroll/payrollApproval/usePayrollApproveAction';
import {
  approvalType,
  GENERATION_TYPE_LABEL,
  getLockedTypes,
  hasOpenGeneration,
  PAYROLL_GENERATION_TYPES,
} from '@/store/server/features/payroll/payrollApproval/generationTypes';
import GeneratePayrollModal, {
  PayrollGenerationOptions,
} from '../../_components/modal';
import { useIsMobile } from '@/hooks/useIsMobile';

const PayPeriodDetailHeader = () => {
  const params = useParams();
  const payPeriodId = String(params?.payPeriodId || '');
  const { isMobile, isTablet } = useIsMobile();

  // The pending approval (one per generation type) the user is confirming.
  const [approvingItem, setApprovingItem] = useState<any>(null);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);

  const searchQuery = payPeriodId ? `&payPeriodId=${payPeriodId}` : '';
  const { data: payroll, refetch } = useGetActivePayroll(searchQuery, 1, 1);
  const { data: allActiveSalary } = useGetAllActiveBasicSalary();
  const hasPayroll = (payroll?.items?.length || 0) > 0;
  const {
    approvableItems,
    periodApprovals,
    refetchPendingApprovals,
    refetchPayrollApprovalForPeriod,
  } = usePayrollApproveVisibility(payPeriodId, hasPayroll);

  const { mutate: createPayroll, isLoading: isCreatingPayroll } =
    useCreatePayroll();
  const { isLoading: deleteLoading } = useDeletePayroll();
  const { approve, isApproving } = usePayrollApproveAction(payPeriodId);

  // Approved generation types are locked; the other types can still be generated.
  const lockedTypes = useMemo(
    () => Array.from(getLockedTypes(periodApprovals)),
    [periodApprovals],
  );
  const canGenerateOrRegenerate = !PAYROLL_GENERATION_TYPES.every((type) =>
    lockedTypes.includes(type),
  );
  // "Regenerate" only while a generation is still open; otherwise this adds a new one.
  const isRegenerate = hasPayroll && hasOpenGeneration(periodApprovals);

  const handleGeneratePayroll = async (data: PayrollGenerationOptions) => {
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
          payPeriodId,
          payrollItems: allActiveSalary.map((item: any) => ({
            ...item,
            basicSalary: parseInt(item.basicSalary, 10),
          })),
          includePayroll: data.includePayroll,
          includeIncentive: data.includeIncentive,
          includeMonthlyVariablePay: data.includeMonthlyVariablePay,
          includeSessionVariablePay: data.includeSessionVariablePay,
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
    approve(approvingItem, () => {
      setApprovingItem(null);
      refetchPendingApprovals();
      refetchPayrollApprovalForPeriod();
      refetch();
    });
  };

  const approvingLabel = approvingItem
    ? GENERATION_TYPE_LABEL[approvalType(approvingItem)]
    : 'Payroll';

  return (
    <div
      className="flex flex-wrap items-center gap-3"
      data-cy="payroll-period-detail-header-actions"
    >
      {approvableItems.length === 1 && (
        <Button
          icon={<CheckOutlined />}
          className="h-10"
          onClick={() => setApprovingItem(approvableItems[0])}
          data-cy={`payroll-period-approve-button-${approvalType(
            approvableItems[0],
          )}`}
        >
          {isMobile || isTablet
            ? 'Approve'
            : `Approve ${GENERATION_TYPE_LABEL[approvalType(approvableItems[0])]}`}
        </Button>
      )}

      {approvableItems.length > 1 && (
        <Dropdown
          trigger={['click']}
          menu={{
            items: approvableItems.map((item) => ({
              key: item.id,
              label: GENERATION_TYPE_LABEL[approvalType(item)],
              icon: <CheckOutlined />,
            })),
            onClick: ({ key }) =>
              setApprovingItem(
                approvableItems.find((item) => item.id === key) ?? null,
              ),
          }}
        >
          <Button
            icon={<CheckOutlined />}
            className="h-10"
            data-cy="payroll-period-approve-menu-button"
          >
            Approve ({approvableItems.length}) <DownOutlined />
          </Button>
        </Dropdown>
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
            {isRegenerate ? 'Regenerate' : 'Generate'}
          </Button>
          {/* </Popconfirm> */}
        </AccessGuard>
      )}

      {isPayrollModalOpen && (
        <GeneratePayrollModal
          onGenerate={handleGeneratePayroll}
          onClose={() => setIsPayrollModalOpen(false)}
          loading={isCreatingPayroll}
          isRegenerate={isRegenerate}
          lockedTypes={lockedTypes}
        />
      )}

      <Modal
        open={Boolean(approvingItem)}
        onCancel={() => setApprovingItem(null)}
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
            Approve {approvingLabel}
          </h2>
          <p
            className="text-lg text-gray-600"
            data-cy="payroll-approve-modal-description"
          >
            Do you wish to approve this {approvingLabel.toLowerCase()}
          </p>
          <div
            className="mt-4 flex w-full justify-center gap-4"
            data-cy="payroll-approve-modal-actions"
          >
            <Button
              className="h-12 w-full text-lg font-semibold"
              onClick={() => setApprovingItem(null)}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="h-12 w-full bg-primary text-lg font-semibold"
              onClick={handleApprovePayroll}
              loading={isApproving}
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
