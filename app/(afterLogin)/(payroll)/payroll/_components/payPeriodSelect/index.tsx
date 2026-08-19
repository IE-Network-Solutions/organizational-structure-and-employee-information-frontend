'use client';

import React, { useMemo, useState } from 'react';
import { Skeleton, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import Image from 'next/image';
import { PayPeriod } from '@/store/server/features/payroll/payroll/interface';
import EmptyState from '@/components/empty';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import ApprovalStatusesInfo from '@/components/common/approvalStatuses/approvalStatusesInfo';
import UserCard from '@/components/common/userCard/userCard';
import {
  useGetPayrollApprovalByPayPeriodId,
  useGetPendingPayrollApprovals,
} from '@/store/server/features/payroll/payrollApproval/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import FilterPopover from '../filters/FilterPopover';
import {
  getMockPayrollApprovalWorkflow,
  isMockPayPeriodId,
  MOCK_FISCAL_YEARS,
  MOCK_PAY_PERIODS,
  MOCK_PAYROLL_APPROVERS,
  MockPayrollApprovalWorkflow,
} from './mockPayPeriods';
import {
  asApprovalList,
  overallStatusIcon,
  workflowFromApprovalRecord,
} from '../approvalWorkflow';

function asPayPeriodList(data: unknown): PayPeriod[] {
  if (Array.isArray(data)) {
    return data as PayPeriod[];
  }
  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as { items?: unknown }).items)
  ) {
    return (data as { items: PayPeriod[] }).items;
  }
  return [];
}

export function formatPayPeriodLabel(period: {
  startDate: string;
  endDate?: string;
}): string {
  return dayjs(period.startDate).format('MMMM YYYY');
}

export function formatPayPeriodRange(period: {
  startDate: string;
  endDate: string;
}): string {
  return `${dayjs(period.startDate).format('MMMM D, YYYY')} - ${dayjs(period.endDate).format('MMMM D, YYYY')}`;
}

interface PayPeriodSelectProps {
  onSelect: (payPeriodId: string) => void;
}

const PayPeriodSelect: React.FC<PayPeriodSelectProps> = ({ onSelect }) => {
  const { isMobile, isTablet } = useIsMobile();
  const [fiscalYearId, setFiscalYearId] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: employeeData } = useGetAllUsers();
  const { data: payrollApprovals } = useGetPayrollApprovalByPayPeriodId('all');
  const { data: pendingApprovals } = useGetPendingPayrollApprovals(
    undefined,
    1,
    100,
  );

  const approvalsByPeriod = useMemo(() => {
    const map: Record<string, MockPayrollApprovalWorkflow> = {};
    asApprovalList(payrollApprovals).forEach((item) => {
      const id = String(item?.payPeriodId || item?.payPeriod?.id || '');
      if (id) map[id] = workflowFromApprovalRecord(item);
    });
    asApprovalList(pendingApprovals).forEach((item) => {
      const id = String(item?.payPeriodId || item?.payPeriod?.id || '');
      if (id && !map[id]) map[id] = workflowFromApprovalRecord(item);
    });
    return map;
  }, [payrollApprovals, pendingApprovals]);

  const userName = (userId: string) => {
    const mockUser = MOCK_PAYROLL_APPROVERS[userId];
    if (mockUser) {
      return `${mockUser.firstName} ${mockUser.lastName}`.trim();
    }
    const user = employeeData?.items?.find((item: any) => item.id === userId);
    return `${user?.firstName || ''} ${user?.middleName || ''} ${user?.lastName || ''}`.trim();
  };

  const userImage = (userId: string) => {
    const user = employeeData?.items?.find((item: any) => item.id === userId);
    return user?.profileImage;
  };

  const payPeriods = useMemo(() => {
    const list = asPayPeriodList(MOCK_PAY_PERIODS);
    return [...list].sort(
      (a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf(),
    );
  }, []);

  const filteredPeriods = useMemo(() => {
    return payPeriods.filter((period) => {
      if (fiscalYearId && period.activeFiscalYearId !== fiscalYearId) {
        return false;
      }
      if (sessionId) {
        const selectedYear = MOCK_FISCAL_YEARS.find(
          (year) => year.id === fiscalYearId,
        );
        const selectedSession = selectedYear?.sessions?.find(
          (session) => session.id === sessionId,
        );
        if (!selectedSession) return false;
        const periodStart = dayjs(period.startDate);
        return (
          !periodStart.isBefore(dayjs(selectedSession.startDate), 'day') &&
          !periodStart.isAfter(dayjs(selectedSession.endDate), 'day')
        );
      }
      return true;
    });
  }, [payPeriods, fiscalYearId, sessionId]);

  const paginatedPeriods = filteredPeriods.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const onPageChange = (page: number, nextPageSize?: number) => {
    setCurrentPage(page);
    if (nextPageSize) {
      setPageSize(nextPageSize);
    }
  };

  const onPageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setCurrentPage(1);
  };

  const handleFilterSearch = (filters: {
    [key: string]: string | undefined | null;
  }) => {
    setFiscalYearId(filters.yearId || undefined);
    setSessionId(filters.sessionId || undefined);
    setCurrentPage(1);
  };

  const getWorkflow = (periodId: string): MockPayrollApprovalWorkflow => {
    if (isMockPayPeriodId(periodId)) {
      return getMockPayrollApprovalWorkflow(periodId);
    }
    return (
      approvalsByPeriod[periodId] || { overall: 'Not generated', steps: [] }
    );
  };

  const isLoading = false;

  const columns = [
    {
      title: 'Pay Period',
      dataIndex: 'id',
      key: 'payPeriod',
      minWidth: 160,
      render: (_unused: string, record: PayPeriod) => (
        <span
          id={`payroll-pay-period-select-name-${record.id}`}
          data-cy={`payroll-pay-period-select-name-${record.id}`}
          className="text-sm text-gray-800"
        >
          {formatPayPeriodLabel(record)}
        </span>
      ),
    },
    {
      title: 'Date Range',
      dataIndex: 'startDate',
      key: 'dateRange',
      minWidth: 240,
      render: (_unused: string, record: PayPeriod) => (
        <span
          id={`payroll-pay-period-select-range-${record.id}`}
          data-cy={`payroll-pay-period-select-range-${record.id}`}
          className="text-sm text-gray-600"
        >
          {formatPayPeriodRange(record)}
        </span>
      ),
    },
    {
      title: 'Period Status',
      dataIndex: 'status',
      key: 'status',
      minWidth: 120,
      render: (status: PayPeriod['status'], record: PayPeriod) => {
        const isOpen = status === 'OPEN';
        return (
          <Tag
            color={isOpen ? 'green' : 'default'}
            id={`payroll-pay-period-select-status-${record.id}`}
            data-cy={`payroll-pay-period-select-status-${record.id}`}
            className="m-0 text-sm"
            style={{ border: 'none' }}
          >
            {isOpen ? 'Open' : 'Closed'}
          </Tag>
        );
      },
    },
    {
      title: 'Approval Status',
      key: 'approvalStatus',
      minWidth: 220,
      render: (_unused: unknown, record: PayPeriod) => {
        const workflow = getWorkflow(record.id);
        const icon = overallStatusIcon(workflow.overall);
        const pendingStep = workflow.steps.find(
          (step) => step.status === 'Pending',
        );
        const rejectedStep = workflow.steps.find(
          (step) => step.status === 'Rejected',
        );
        const currentStep =
          workflow.overall === 'Pending'
            ? pendingStep
            : workflow.overall === 'Rejected'
              ? rejectedStep
              : undefined;
        const currentUserId = currentStep
          ? String(
              currentStep.displayUserId ||
                currentStep.approvedUserId ||
                currentStep.userId ||
                '',
            )
          : '';

        return (
          <div
            id={`payroll-pay-period-select-approval-${record.id}`}
            data-cy={`payroll-pay-period-select-approval-${record.id}`}
            className="flex flex-col gap-1 py-0.5"
          >
            <div
              id={`payroll-pay-period-select-approval-overall-${record.id}`}
              data-cy={`payroll-pay-period-select-approval-overall-${record.id}`}
              className="flex items-center gap-2"
            >
              {icon ? (
                <Image
                  unoptimized
                  width={24}
                  height={24}
                  src={icon}
                  alt={workflow.overall}
                  data-cy={`payroll-pay-period-select-approval-overall-icon-${record.id}`}
                />
              ) : null}
              <span
                id={`payroll-pay-period-select-approval-overall-label-${record.id}`}
                data-cy={`payroll-pay-period-select-approval-overall-label-${record.id}`}
                className="text-sm font-medium text-gray-900"
              >
                {workflow.overall}
              </span>
              {currentStep ? (
                <span
                  data-cy={`payroll-pay-period-select-approval-level-${record.id}`}
                  className="text-sm text-gray-500"
                >
                  · Level {currentStep.stepOrder}
                </span>
              ) : null}
            </div>
            {currentStep && currentUserId ? (
              <UserCard
                data={currentStep}
                name={userName(currentUserId)}
                profileImage={userImage(currentUserId)}
                size="small"
              />
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <div
      id="payroll-pay-period-select-view-container"
      data-cy="payroll-pay-period-select-view-container"
      className="w-full"
    >
      <div
        id="payroll-pay-period-select-toolbar"
        data-cy="payroll-pay-period-select-toolbar"
        className="mb-6 flex flex-wrap items-start justify-between gap-3"
      >
        <div data-cy="payroll-pay-period-select-copy">
          <p
            id="payroll-pay-period-select-title"
            data-cy="payroll-pay-period-select-title"
            className="m-0 text-base font-medium text-gray-900"
          >
            Select a pay period
          </p>
          <p
            id="payroll-pay-period-select-subtitle"
            data-cy="payroll-pay-period-select-subtitle"
            className="m-0 mt-1 text-sm text-gray-500"
          >
            Latest pay periods appear first. Open a row to view payroll.
          </p>
        </div>
        <div
          id="payroll-pay-period-select-toolbar-actions"
          data-cy="payroll-pay-period-select-toolbar-actions"
          className="flex flex-wrap items-center gap-3"
        >
          <ApprovalStatusesInfo />
          <FilterPopover
            onSearch={handleFilterSearch}
            defaultValues={{
              yearId: fiscalYearId,
              sessionId,
            }}
            autoSearch={false}
            hiddenFields={[
              'divisionId',
              'departmentId',
              'payPeriodId',
              'monthId',
            ]}
            fiscalYearsOverride={MOCK_FISCAL_YEARS}
          />
        </div>
      </div>

      <div
        id="payroll-pay-period-select-table-wrap"
        data-cy="payroll-pay-period-select-table-wrap"
        className="payroll-table-scroll-host overflow-x-auto scrollbar-none rounded-lg overflow-hidden"
      >
        {isLoading ? (
          <div data-cy="payroll-pay-period-select-table-skeleton">
            <Skeleton active title={false} paragraph={{ rows: 8 }} />
          </div>
        ) : (
          <Table
            id="payroll-pay-period-select-table"
            data-cy="payroll-pay-period-select-table"
            className="payroll-table"
            rowKey="id"
            pagination={false}
            dataSource={paginatedPeriods}
            columns={columns}
            onRow={(record) => ({
              onClick: () => onSelect(record.id),
              style: { cursor: 'pointer' },
            })}
            locale={{
              emptyText: (
                <div
                  className="payroll-table-empty-viewport-center py-10"
                  data-cy="payroll-pay-period-select-empty-wrap"
                >
                  <EmptyState
                    title="No pay periods found"
                    description="Create a pay period in Payroll Settings to get started."
                    data-cy="payroll-pay-period-select-empty-state-inner"
                    className="!py-2"
                  />
                </div>
              ),
            }}
          />
        )}
      </div>

      <div
        id="payroll-pay-period-select-pagination"
        data-cy="payroll-pay-period-select-pagination"
        className="mt-4 pt-4"
      >
        {isMobile || isTablet ? (
          <CustomMobilePagination
            data-cy="payroll-pay-period-select-mobile-pagination"
            totalResults={filteredPeriods.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
          />
        ) : (
          <CustomPagination
            data-cy="payroll-pay-period-select-desktop-pagination"
            current={currentPage}
            total={filteredPeriods.length}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageSizeChange}
          />
        )}
      </div>
    </div>
  );
};

export default PayPeriodSelect;
