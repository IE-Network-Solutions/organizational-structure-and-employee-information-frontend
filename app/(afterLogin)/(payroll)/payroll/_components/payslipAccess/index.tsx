'use client';

import React, { useMemo, useState } from 'react';
import { Button, Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { IoCloseOutline } from 'react-icons/io5';
import dayjs from 'dayjs';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useGetPayrollApprovalsOfPayPeriod } from '@/store/server/features/payroll/payrollApproval/queries';
import {
  approvalType,
  GENERATION_TYPE_LABEL,
  PAYROLL_GENERATION_TYPES,
  PayrollGenerationType,
} from '@/store/server/features/payroll/payrollApproval/generationTypes';
import {
  usePublishPayslips,
  useUnpublishPayslips,
} from '@/store/server/features/payroll/payroll/mutation';

type Generation = {
  generationType: PayrollGenerationType;
  payslipsPublished: boolean;
  payslipsPublishedAt?: string | null;
};

interface Props {
  payPeriodId: string;
  /** e.g. "January 2027", used in the confirmation text. */
  periodLabel: string;
}

/**
 * One toolbar button that opens the payslip access of each generation (salary,
 * performance, incentive). Each is released or revoked on its own, behind a
 * confirmation; only the row being changed shows a spinner.
 */
const PayslipAccessPanel: React.FC<Props> = ({ payPeriodId, periodLabel }) => {
  const [open, setOpen] = useState(false);
  const { data } = useGetPayrollApprovalsOfPayPeriod(payPeriodId);
  const {
    mutate: publish,
    isLoading: isPublishing,
    variables: publishing,
  } = usePublishPayslips();
  const {
    mutate: unpublish,
    isLoading: isUnpublishing,
    variables: unpublishing,
  } = useUnpublishPayslips();

  const generations: Generation[] = useMemo(() => {
    const items: any[] = Array.isArray(data) ? data : [];
    return PAYROLL_GENERATION_TYPES.flatMap((type) => {
      const match = items.find((item) => approvalType(item) === type);
      return match
        ? [
            {
              generationType: type,
              payslipsPublished: match.payslipsPublished === true,
              payslipsPublishedAt: match.payslipsPublishedAt,
            },
          ]
        : [];
    });
  }, [data]);

  if (!generations.length) return null;

  const releasedCount = generations.filter((g) => g.payslipsPublished).length;
  const isRowBusy = (type: PayrollGenerationType) =>
    (isPublishing && publishing?.generationType === type) ||
    (isUnpublishing && unpublishing?.generationType === type);

  return (
    <AccessGuard
      permissions={[Permissions.GeneratePayroll, Permissions.DeletePayroll]}
    >
      <Button
        className="flex h-10 items-center gap-2 rounded-[6px] border-gray-200 px-3 font-medium text-gray-600 md:px-4"
        icon={<EyeOutlined />}
        onClick={() => setOpen(true)}
        data-cy="payroll-payslip-access-open-button"
      >
        <span
          className="hidden sm:inline"
          data-cy="payroll-payslip-access-open-label"
        >
          Payslip access
        </span>
        <span
          className="rounded-full bg-slate-100 px-1.5 text-[11px] font-medium leading-5 text-slate-600"
          data-cy="payroll-payslip-access-open-count"
        >
          {releasedCount}/{generations.length}
        </span>
      </Button>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        width={460}
        title={
          <h2
            className="m-0 text-base font-semibold leading-tight text-[#161A2C]"
            data-cy="payroll-payslip-access-title"
          >
            Payslip access
          </h2>
        }
        closeIcon={
          <IoCloseOutline
            size={22}
            className="text-slate-500 hover:text-[#161A2C]"
          />
        }
        data-cy="payroll-payslip-access-modal"
      >
        <p
          className="m-0 mb-2 mt-3 text-[13px] text-slate-500"
          data-cy="payroll-payslip-access-hint"
        >
          Employees only see the payslips you release for {periodLabel}.
        </p>

        <ul
          className="m-0 list-none divide-y divide-slate-100 p-0"
          data-cy="payroll-payslip-access-list"
        >
          {generations.map(
            ({ generationType, payslipsPublished, payslipsPublishedAt }) => {
              const label = GENERATION_TYPE_LABEL[generationType];
              const lowerLabel = label.toLowerCase();
              const busy = isRowBusy(generationType);

              return (
                <li
                  key={generationType}
                  className="flex items-center justify-between gap-3 py-3"
                  data-cy={`payroll-payslip-access-row-${generationType}`}
                >
                  <div
                    className="min-w-0"
                    data-cy={`payroll-payslip-access-text-${generationType}`}
                  >
                    <div
                      className="flex items-center gap-2"
                      data-cy={`payroll-payslip-access-heading-${generationType}`}
                    >
                      <span
                        className="text-sm font-medium text-[#161A2C]"
                        data-cy={`payroll-payslip-access-label-${generationType}`}
                      >
                        {label}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          payslipsPublished
                            ? 'bg-green-50 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                        data-cy={`payroll-payslip-access-chip-${generationType}`}
                      >
                        {payslipsPublished ? 'Released' : 'Not released'}
                      </span>
                    </div>
                    <p
                      className="m-0 mt-0.5 text-[12px] text-slate-500"
                      data-cy={`payroll-payslip-access-note-${generationType}`}
                    >
                      {payslipsPublished
                        ? payslipsPublishedAt
                          ? `Since ${dayjs(payslipsPublishedAt).format(
                              'MMM D, YYYY HH:mm',
                            )}`
                          : 'Employees can see these payslips'
                        : 'Employees can’t see these payslips yet'}
                    </p>
                  </div>

                  {payslipsPublished ? (
                    <Button
                      danger
                      className="shrink-0"
                      loading={busy}
                      onClick={() =>
                        Modal.confirm({
                          centered: true,
                          title: `Revoke access to ${lowerLabel} payslips?`,
                          content: `Employees will no longer see their ${lowerLabel} payslips for ${periodLabel}`,
                          okText: 'Revoke access',
                          cancelText: 'Cancel',
                          okButtonProps: { danger: true },
                          onOk: () =>
                            unpublish({ payPeriodId, generationType }),
                        })
                      }
                      data-cy={`payroll-payslip-access-revoke-button-${generationType}`}
                    >
                      Revoke
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      className="shrink-0"
                      loading={busy}
                      onClick={() =>
                        Modal.confirm({
                          centered: true,
                          title: `Release ${lowerLabel} payslips?`,
                          content: `Employees will see their ${lowerLabel} payslips for ${periodLabel} in My Payroll right away.`,
                          okText: 'Release',
                          cancelText: 'Cancel',
                          onOk: () => publish({ payPeriodId, generationType }),
                        })
                      }
                      data-cy={`payroll-payslip-access-release-button-${generationType}`}
                    >
                      Release
                    </Button>
                  )}
                </li>
              );
            },
          )}
        </ul>
      </Modal>
    </AccessGuard>
  );
};

export default PayslipAccessPanel;
