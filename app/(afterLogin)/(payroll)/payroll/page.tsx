'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Breadcrumb, Button, Form, Popover, Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  UserOutlined,
} from '@ant-design/icons';
import CustomBreadcrumb from '@/components/common/breadCramp';
import EmptyState from '@/components/empty';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useGetPayPeriod } from '@/store/server/features/payroll/payroll/queries';
import { PayPeriod } from '@/store/server/features/payroll/payroll/interface';
import {
  useGetAllPayrollApprovals,
  useGetPendingPayrollApprovals,
} from '@/store/server/features/payroll/payrollApproval/queries';
import {
  useGetAllFiscalYears,
  useGetActiveFiscalYears,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';

type PeriodStatusFilter = 'ALL' | 'OPEN' | 'CLOSED';

interface PayPeriodListRow extends PayPeriod {
  key: string;
}

const ApproverPerson = ({ userId }: { userId?: string }) => {
  const { data: employee } = useGetEmployee(userId || '');
  if (!userId) return null;

  const fullName = [
    employee?.firstName,
    employee?.middleName,
    employee?.lastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <div
      className="mt-1 flex items-center gap-2"
      data-cy="payroll-pay-period-approver-person"
    >
      <Avatar
        size={22}
        src={employee?.profileImage}
        icon={<UserOutlined />}
        className="shrink-0"
      />
      <span
        className="text-sm text-gray-700"
        data-cy="payroll-pay-period-approver-name"
      >
        {fullName || 'Approver'}
      </span>
    </div>
  );
};

const ApprovalStatusCell = ({
  approval,
  pendingItem,
}: {
  period: PayPeriodListRow;
  approval?: { approved?: boolean };
  pendingItem?: any;
}) => {
  const isApproved = approval?.approved === true;

  if (isApproved) {
    return (
      <div
        className="flex items-center gap-2"
        data-cy="payroll-pay-period-approval-approved"
      >
        <CheckCircleFilled className="text-base text-[#22C55E]" />
        <span
          className="text-sm font-medium text-gray-900"
          data-cy="payroll-pay-period-approval-approved-label"
        >
          Approved
        </span>
      </div>
    );
  }

  const stepOrder = pendingItem?.nextApprover?.[0]?.stepOrder;
  const approverUserId =
    pendingItem?.nextApprover?.[0]?.userId ||
    pendingItem?.nextApprover?.[0]?.approverId ||
    pendingItem?.nextApprover?.[0]?.approverUserId;

  return (
    <div data-cy="payroll-pay-period-approval-pending">
      <div
        className="flex items-center gap-2"
        data-cy="payroll-pay-period-approval-pending-row"
      >
        <ExclamationCircleFilled className="text-base text-[#F97316]" />
        <span
          className="text-sm font-medium text-[#EA580C]"
          data-cy="payroll-pay-period-approval-pending-label"
        >
          Pending{stepOrder ? ` · Level ${stepOrder}` : ''}
        </span>
      </div>
      <ApproverPerson userId={approverUserId} />
    </div>
  );
};

const PayPeriodListPage = () => {
  const router = useRouter();
  const { isMobile } = useIsMobile();
  const { data: payPeriodData, isLoading } = useGetPayPeriod();
  const { data: approvals } = useGetAllPayrollApprovals();
  const { data: pendingApprovals } = useGetPendingPayrollApprovals(
    undefined,
    1,
    10,
  );
  const { data: fiscalYears } = useGetAllFiscalYears(50, 1);
  const { data: activeFiscalYear } = useGetActiveFiscalYears();

  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PeriodStatusFilter>('ALL');
  const [fiscalYearId, setFiscalYearId] = useState<string | undefined>();
  const [form] = Form.useForm();
  const hasInitializedFiscalYear = useRef(false);

  useEffect(() => {
    if (hasInitializedFiscalYear.current || !activeFiscalYear?.id) return;
    hasInitializedFiscalYear.current = true;
    setFiscalYearId(activeFiscalYear.id);
    form.setFieldsValue({ fiscalYearId: activeFiscalYear.id });
  }, [activeFiscalYear?.id, form]);

  const approvalByPeriodId = useMemo(() => {
    const map = new Map<string, any>();
    (Array.isArray(approvals) ? approvals : []).forEach((item: any) => {
      if (item?.payPeriodId) map.set(item.payPeriodId, item);
    });
    return map;
  }, [approvals]);

  const pendingByPeriodId = useMemo(() => {
    const map = new Map<string, any>();
    (pendingApprovals?.items || []).forEach((item: any) => {
      if (item?.payPeriodId) map.set(item.payPeriodId, item);
    });
    return map;
  }, [pendingApprovals]);

  const rows: PayPeriodListRow[] = useMemo(() => {
    const periods: PayPeriod[] = Array.isArray(payPeriodData)
      ? [...payPeriodData]
      : [];

    return periods
      .filter((period) => {
        if (statusFilter !== 'ALL' && period.status !== statusFilter) {
          return false;
        }
        if (fiscalYearId && period.activeFiscalYearId !== fiscalYearId) {
          return false;
        }
        return true;
      })
      .sort(
        (a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf(),
      )
      .map((period) => ({ ...period, key: period.id }));
  }, [payPeriodData, statusFilter, fiscalYearId]);

  const columns: ColumnsType<PayPeriodListRow> = [
    {
      title: 'Pay Period',
      dataIndex: 'startDate',
      key: 'payPeriod',
      render: (notused, record) => (
        <span
          className="text-sm font-medium text-gray-900"
          data-cy={`payroll-pay-period-label-${record.id}`}
        >
          {dayjs(record.startDate).format('MMMM YYYY')}
        </span>
      ),
    },
    {
      title: 'Date Range',
      key: 'dateRange',
      render: (notused, record) => (
        <span
          className="text-sm text-gray-700"
          data-cy={`payroll-pay-period-date-range-${record.id}`}
        >
          {dayjs(record.startDate).format('MMMM D, YYYY')} -{' '}
          {dayjs(record.endDate).format('MMMM D, YYYY')}
        </span>
      ),
    },
    {
      title: 'Period Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: PayPeriod['status']) => (
        <span
          className={
            status === 'OPEN'
              ? 'text-sm font-medium text-[#16A34A]'
              : 'text-sm text-gray-900'
          }
          data-cy="payroll-pay-period-status-cell"
        >
          {status === 'OPEN' ? 'Open' : 'Closed'}
        </span>
      ),
    },
    {
      title: 'Approval Status',
      key: 'approvalStatus',
      render: (notused, record) => (
        <ApprovalStatusCell
          period={record}
          approval={approvalByPeriodId.get(record.id)}
          pendingItem={pendingByPeriodId.get(record.id)}
        />
      ),
    },
  ];

  const applyFilters = (values: {
    status?: PeriodStatusFilter;
    fiscalYearId?: string;
  }) => {
    setStatusFilter(values.status || 'ALL');
    setFiscalYearId(values.fiscalYearId);
    setFilterOpen(false);
  };

  const resetFilters = () => {
    const defaultFiscalYearId = activeFiscalYear?.id;
    form.setFieldsValue({
      status: 'ALL',
      fiscalYearId: defaultFiscalYearId,
    });
    setStatusFilter('ALL');
    setFiscalYearId(defaultFiscalYearId);
    setFilterOpen(false);
  };

  const filterContent = (
    <div className="w-[280px] p-1" data-cy="payroll-pay-periods-filter-content">
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: 'ALL' }}
        onFinish={applyFilters}
      >
        <Form.Item name="status" label="Period status" className="mb-3">
          <Select
            options={[
              { value: 'ALL', label: 'All' },
              { value: 'OPEN', label: 'Open' },
              { value: 'CLOSED', label: 'Closed' },
            ]}
          />
        </Form.Item>
        <Form.Item name="fiscalYearId" label="Fiscal year" className="mb-4">
          <Select
            allowClear
            placeholder="All fiscal years"
            options={(fiscalYears?.items || []).map((year) => ({
              value: year.id,
              label: year.name,
            }))}
          />
        </Form.Item>
        <div
          className="flex justify-end gap-2"
          data-cy="payroll-pay-periods-filter-actions"
        >
          <Button
            htmlType="button"
            onClick={resetFilters}
            data-cy="payroll-pay-periods-filter-reset-button"
          >
            Reset
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            data-cy="payroll-pay-periods-filter-apply-button"
          >
            Apply
          </Button>
        </div>
      </Form>
    </div>
  );

  return (
    <div
      id="payroll-pay-periods-view-container"
      data-cy="payroll-pay-periods-view-container"
      className={
        isMobile
          ? 'bg-white overflow-x-hidden pb-2 [padding-top:max(1.5rem,env(safe-area-inset-top,0px))] py-4 w-full'
          : ''
      }
    >
      <CustomBreadcrumb
        title="Payroll"
        subtitle={
          <Breadcrumb
            data-cy="payroll-pay-periods-breadcrumb"
            className="mt-2 mb-0 whitespace-nowrap"
            items={[
              {
                title: (
                  <Link href="/payroll" className="text-xs sm:text-sm">
                    Payroll
                  </Link>
                ),
              },
              {
                title: (
                  <span
                    className="text-xs sm:text-sm"
                    data-cy="payroll-pay-periods-breadcrumb-current"
                  >
                    Pay Periods
                  </span>
                ),
              },
            ]}
          />
        }
      />

      <div
        className={
          isMobile
            ? 'bg-white rounded-xl shadow-sm border border-gray-100 p-4'
            : 'bg-white rounded-xl shadow-sm border border-gray-100 p-6'
        }
        data-cy="payroll-pay-periods-card"
      >
        <div
          className="mb-6 flex items-start justify-between gap-3"
          data-cy="payroll-pay-periods-header"
        >
          <div data-cy="payroll-pay-periods-header-text">
            <h2
              className="m-0 text-lg font-semibold text-gray-900"
              data-cy="payroll-pay-periods-title"
            >
              Select a pay period
            </h2>
            <p
              className="m-0 mt-1 text-sm text-gray-500"
              data-cy="payroll-pay-periods-subtitle"
            >
              Latest pay periods appear first. Open a row to view payroll.
            </p>
          </div>
          <Popover
            content={filterContent}
            trigger="click"
            open={filterOpen}
            onOpenChange={setFilterOpen}
            placement="bottomRight"
          >
            <Button
              data-cy="payroll-pay-periods-filter-button"
              className="flex items-center gap-2 h-10 border-gray-200 text-gray-600 rounded-[6px] px-3 md:px-4 font-medium"
              icon={
                <FilterAltOutlinedIcon
                  className="text-gray-600"
                  fontSize="small"
                />
              }
            >
              <span
                className="hidden sm:inline"
                data-cy="payroll-pay-periods-filter-button-label"
              >
                Filter
              </span>
            </Button>
          </Popover>
        </div>

        <Table<PayPeriodListRow>
          data-cy="payroll-pay-periods-table"
          columns={columns}
          dataSource={rows}
          loading={isLoading}
          pagination={false}
          scroll={{ x: true }}
          rowClassName="cursor-pointer"
          locale={{
            emptyText: (
              <EmptyState
                title="No pay periods"
                description="No pay periods found."
                compact
              />
            ),
          }}
          onRow={(record) => ({
            onClick: () => router.push(`/payroll/${record.id}`),
          })}
        />
      </div>
    </div>
  );
};

export default PayPeriodListPage;
