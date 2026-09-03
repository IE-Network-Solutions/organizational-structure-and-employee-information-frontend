'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, DatePicker, Popover, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useParams, useRouter } from 'next/navigation';
import dayjs, { Dayjs } from 'dayjs';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { MdOutlineFilterAlt } from 'react-icons/md';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PaymentsIcon from '@mui/icons-material/Payments';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import { MdCardGiftcard } from 'react-icons/md';
import PayrollCard from '../_components/cards';
import EmptyState from '@/components/empty';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  useGetActivePayroll,
  useGetActivePayrollsForExport,
  useGetPayPeriod,
} from '@/store/server/features/payroll/payroll/queries';
import PayrollApprovalStatusBar from '../_components/PayrollApprovalStatusBar';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { usePayrollStore } from '@/store/uistate/features/payroll/payroll';
import PayrollSummaryCardsSkeleton from '../_components/PayrollSummaryCardsSkeleton';
import { useGetAggregateAuditPostLogs } from '@/store/server/features/tenant-management/audit-logs/queries';
import { AggregateAuditLogParams } from '@/store/server/features/tenant-management/audit-logs/interface';
import { AuditLog } from '@/types/tenant-management';
import { TableSkeleton } from '@/components/tableSkeleton';

const { Option } = Select;

const PAYROLL_AUDIT_MODULE = 'PayrollAuditLog';

const PAYROLL_SUMMARY_CARDS_ROW_CLASS =
  'mb-8 flex flex-nowrap gap-4 overflow-x-auto overflow-y-visible pb-2 scroll-smooth snap-x snap-mandatory [-webkit-overflow-scrolling:touch] touch-pan-x lg:grid lg:grid-cols-5 lg:overflow-x-visible lg:snap-none';

const PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS =
  'min-w-[228px] w-[min(88vw,304px)] shrink-0 snap-start lg:min-w-0 lg:h-full lg:w-full lg:shrink lg:max-w-none';

const getActionColor = (action: string) => {
  const actionLower = action?.toLowerCase();
  if (actionLower === 'create' || actionLower === 'created') return 'green';
  if (actionLower === 'update' || actionLower === 'updated') return 'blue';
  if (actionLower === 'delete' || actionLower === 'deleted') return 'red';
  if (actionLower?.includes('regenerat')) return 'blue';
  if (actionLower?.includes('generat')) return 'green';
  return 'default';
};

const formatActionLabel = (action: string) => {
  const actionLower = action?.toLowerCase();
  if (!actionLower) return '--';
  if (actionLower === 'create' || actionLower === 'created') return 'Create';
  if (actionLower === 'update' || actionLower === 'updated') return 'Update';
  if (actionLower === 'delete' || actionLower === 'deleted') return 'Delete';
  return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
};

const mentionsPayPeriod = (log: AuditLog, payPeriodId: string) => {
  if (!payPeriodId) return true;
  if (log.entityId === payPeriodId) return true;
  const haystack = JSON.stringify({
    previousValue: log.previousValue,
    newValue: log.newValue,
    changes: log.changes,
    metadata: log.metadata,
    remarks: log.remarks,
  });
  return haystack.includes(payPeriodId);
};

const PayrollPeriodOverviewPage = () => {
  const params = useParams();
  const router = useRouter();
  const { isMobile, isTablet } = useIsMobile();
  const payPeriodId = String(params?.payPeriodId || '');
  const { pageSize, currentPage } = usePayrollStore();
  const searchQuery = payPeriodId ? `&payPeriodId=${payPeriodId}` : '';

  const [activityPage, setActivityPage] = useState(1);
  const [activityPageSize, setActivityPageSize] = useState(10);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [selectedAction, setSelectedAction] = useState<string | undefined>();
  const [employeeOrRemarksSearch, setEmployeeOrRemarksSearch] = useState('');
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);

  const { data: payPeriodData } = useGetPayPeriod();
  const { data: payroll, isLoading: payrollLoading } = useGetActivePayroll(
    searchQuery,
    pageSize,
    currentPage,
  );
  const { data: payrollForExport, isLoading: payrollForExportLoading } =
    useGetActivePayrollsForExport(searchQuery);
  const { data: allUsers, isLoading: isLoadingUsers } = useGetAllUsers();

  const selectedPayPeriod = (payPeriodData || []).find(
    (period: { id: string }) => period.id === payPeriodId,
  );
  const selectedPayPeriodLabel = selectedPayPeriod
    ? dayjs(selectedPayPeriod.startDate).format('MMMM YYYY')
    : 'Pay Period';
  const employeeCount =
    payroll?.meta?.totalItems || payroll?.items?.length || 0;
  const isOpen = selectedPayPeriod?.status === 'OPEN';

  const auditLogParams = useMemo<AggregateAuditLogParams>(() => {
    const params: AggregateAuditLogParams = {
      modules: [PAYROLL_AUDIT_MODULE],
      page: activityPage,
      limit: activityPageSize,
      orderBy: 'performedAt',
      orderDirection: 'DESC',
      ...(selectedAction && { action: selectedAction }),
      ...(selectedUserId && { performedBy: selectedUserId }),
    };

    if (dateFrom) {
      params.startDate = dateFrom.format('YYYY-MM-DD');
    } else if (selectedPayPeriod?.startDate) {
      params.startDate = dayjs(selectedPayPeriod.startDate).format(
        'YYYY-MM-DD',
      );
    }

    if (dateTo) {
      params.endDate = dateTo.format('YYYY-MM-DD');
    } else if (selectedPayPeriod?.endDate) {
      params.endDate = dayjs(selectedPayPeriod.endDate).format('YYYY-MM-DD');
    }

    return params;
  }, [
    activityPage,
    activityPageSize,
    selectedAction,
    selectedUserId,
    dateFrom,
    dateTo,
    selectedPayPeriod?.startDate,
    selectedPayPeriod?.endDate,
  ]);

  const { data: auditLogsResponse, isLoading: isAuditLogsLoading } =
    useGetAggregateAuditPostLogs(auditLogParams, true);

  const auditLogsData = useMemo(() => {
    const items = auditLogsResponse?.items ?? [];
    const payrollOnly = items.filter(
      (log: AuditLog) => !log.module || log.module === PAYROLL_AUDIT_MODULE,
    );
    const forPeriod = payrollOnly.filter((log: AuditLog) =>
      mentionsPayPeriod(log, payPeriodId),
    );
    return forPeriod.length ? forPeriod : payrollOnly;
  }, [auditLogsResponse?.items, payPeriodId]);

  const filteredActivityRows = useMemo(() => {
    const q = employeeOrRemarksSearch.trim().toLowerCase();
    return auditLogsData
      .filter((log: AuditLog) => {
        const performedAtValue = log?.performedAt || log?.createdAt;
        if (dateFrom || dateTo) {
          if (!performedAtValue) return false;
          const performedAt = dayjs(performedAtValue);
          if (dateFrom && performedAt.isBefore(dateFrom.startOf('day'))) {
            return false;
          }
          if (dateTo && performedAt.isAfter(dateTo.endOf('day'))) {
            return false;
          }
        }

        const user = log?.performedByUser;
        const fullName = user
          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
          : '';
        const remarks = (log?.remarks || '').toString().toLowerCase();
        if (!q) return true;
        return (
          remarks.includes(q) ||
          fullName.toLowerCase().includes(q) ||
          (log?.performedBy || '').toString().toLowerCase().includes(q)
        );
      })
      .map((log: AuditLog) => ({
        ...log,
        key: log.id,
      }));
  }, [auditLogsData, employeeOrRemarksSearch, dateFrom, dateTo]);

  const totalItems = useMemo(() => {
    if (
      employeeOrRemarksSearch.trim() ||
      dateFrom !== null ||
      dateTo !== null
    ) {
      return filteredActivityRows.length;
    }
    return auditLogsResponse?.meta?.totalItems || filteredActivityRows.length;
  }, [
    auditLogsResponse?.meta?.totalItems,
    filteredActivityRows.length,
    employeeOrRemarksSearch,
    dateFrom,
    dateTo,
  ]);

  const actions = useMemo(() => {
    const defaultActions = ['CREATE', 'UPDATE', 'DELETE'];
    if (!auditLogsData?.length) return defaultActions;
    const uniqueActions = new Set<string>(defaultActions);
    auditLogsData.forEach((log: AuditLog) => {
      if (log.action) uniqueActions.add(log.action);
    });
    return Array.from(uniqueActions).sort();
  }, [auditLogsData]);

  useEffect(() => {
    setActivityPage(1);
  }, [
    selectedAction,
    selectedUserId,
    employeeOrRemarksSearch,
    dateFrom,
    dateTo,
  ]);

  const onPageChange = (page: number, size?: number) => {
    setActivityPage(page);
    if (size && size !== activityPageSize) {
      setActivityPageSize(size);
    }
  };

  const onPageSizeChange = (newPageSize: number) => {
    setActivityPageSize(newPageSize);
    setActivityPage(1);
  };

  const activityColumns: ColumnsType<AuditLog & { key: string }> = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag
          color={getActionColor(action)}
          className="capitalize text-sm"
          style={{ border: 'none' }}
        >
          {formatActionLabel(action)}
        </Tag>
      ),
    },
    {
      title: 'Performed By',
      key: 'performedBy',
      render: (notused, record) => {
        const user = record?.performedByUser;
        const fullName = user
          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
          : null;
        return (
          <div
            className="flex items-center gap-2"
            data-cy={`payroll-activity-performed-by-${record.id}`}
          >
            <Avatar
              size={22}
              src={user?.profileImage}
              icon={!user?.profileImage ? <UserOutlined /> : undefined}
            />
            <span
              className="text-sm"
              data-cy={`payroll-activity-performed-by-name-${record.id}`}
            >
              {fullName || 'Unknown User'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Performed At',
      dataIndex: 'performedAt',
      key: 'performedAt',
      render: (notused, record) => {
        const date = record?.performedAt || record?.createdAt;
        return (
          <span
            className="text-sm"
            data-cy={`payroll-activity-performed-at-${record.id}`}
          >
            {date ? dayjs(date).format('MMM D, YYYY HH:mm') : '—'}
          </span>
        );
      },
    },
    {
      title: 'Remarks',
      key: 'remarks',
      render: (notused, record) => (
        <span
          className="text-sm"
          data-cy={`payroll-activity-remarks-${record.id}`}
        >
          {record.remarks || '—'}
        </span>
      ),
    },
  ];

  const filterPopoverContent = (
    <div
      className="w-full max-w-full px-4 py-2 md:w-[440px] md:max-w-[calc(100vw-32px)]"
      data-cy="payroll-activity-filter-popover-content"
    >
      <div
        className="mb-1 flex items-start justify-between"
        data-cy="payroll-activity-filter-header"
      >
        <div data-cy="payroll-activity-filter-header-text">
          <h3
            className="m-0 text-lg font-semibold text-gray-900"
            data-cy="payroll-activity-filter-title"
          >
            Filter
          </h3>
          <p
            className="mb-0 mt-1 text-sm text-gray-500"
            data-cy="payroll-activity-filter-subtitle"
          >
            Select All filters that apply
          </p>
        </div>
        <button
          type="button"
          aria-label="Close filter"
          onClick={() => setFilterPopoverOpen(false)}
          className="text-xl font-medium leading-none text-gray-400 hover:text-gray-600"
          data-cy="payroll-activity-filter-close-button"
        >
          ×
        </button>
      </div>

      <div
        className="mt-4 flex flex-col gap-5"
        data-cy="payroll-activity-filter-fields"
      >
        <div data-cy="payroll-activity-filter-date-field">
          <div
            className="mb-2 text-sm font-semibold text-gray-900"
            data-cy="payroll-activity-filter-date-label"
          >
            Date
          </div>
          <DatePicker.RangePicker
            value={[dateFrom, dateTo] as any}
            format="YYYY-MM-DD"
            placeholder={['Start date', 'End date']}
            className="h-10 w-full"
            onChange={(dates) => {
              setDateFrom(dates?.[0] ?? null);
              setDateTo(dates?.[1] ?? null);
              setActivityPage(1);
            }}
            data-cy="payroll-activity-date-range-picker"
          />
        </div>

        <div data-cy="payroll-activity-filter-action-field">
          <div
            className="mb-2 text-sm font-semibold text-gray-900"
            data-cy="payroll-activity-filter-action-label"
          >
            Action
          </div>
          <Select
            placeholder="Create"
            value={selectedAction}
            onChange={(value) => {
              setSelectedAction(value);
              setActivityPage(1);
            }}
            allowClear
            className="h-10 w-full"
            data-cy="payroll-activity-action-select"
          >
            {actions.map((action) => (
              <Option key={action} value={action}>
                {formatActionLabel(action)}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <div
        className="mt-6 flex justify-end gap-3"
        data-cy="payroll-activity-filter-footer"
      >
        <Button
          onClick={() => {
            setDateFrom(null);
            setDateTo(null);
            setSelectedAction(undefined);
            setSelectedUserId(undefined);
            setEmployeeOrRemarksSearch('');
            setActivityPage(1);
          }}
          className="transition-colors hover:border-gray-300 hover:bg-gray-100 active:border-gray-400 active:bg-gray-200"
          data-cy="payroll-activity-filter-reset-button"
        >
          Reset
        </Button>
        <Button
          type="primary"
          onClick={() => setFilterPopoverOpen(false)}
          className="transition-colors hover:opacity-90 hover:brightness-110 active:opacity-95 active:brightness-105"
          data-cy="payroll-activity-filter-save-button"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );

  return (
    <div data-cy="payroll-period-overview-page">
      <div
        className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        data-cy="payroll-period-overview-status-bar"
      >
        <div
          className="flex flex-wrap items-center gap-3 lg:flex-1 lg:min-w-0"
          data-cy="payroll-period-overview-status-left"
        >
          <h3
            className="m-0 text-lg font-semibold text-gray-900"
            data-cy="payroll-period-overview-title"
          >
            {selectedPayPeriodLabel}
          </h3>
          <span
            className={
              isOpen
                ? 'rounded-full bg-green-50 px-2.5 py-0.5 text-sm font-medium text-[#16A34A]'
                : 'rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700'
            }
            data-cy="payroll-period-overview-status-badge"
          >
            {isOpen ? 'Open' : 'Closed'}
          </span>
          <span
            className="text-sm text-gray-500"
            data-cy="payroll-period-overview-employee-count"
          >
            {employeeCount} employees
          </span>
        </div>

        <PayrollApprovalStatusBar payPeriodId={payPeriodId} />
      </div>

      {payrollForExportLoading || payrollLoading ? (
        <PayrollSummaryCardsSkeleton />
      ) : (
        <div
          className={PAYROLL_SUMMARY_CARDS_ROW_CLASS}
          data-cy="payroll-overview-summary-cards-row"
        >
          <div
            className={PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS}
            data-cy="payroll-overview-total-amount-item"
          >
            <PayrollCard
              title="Total Amount"
              data-cy="payroll-overview-total-amount-card"
              value={payrollForExport?.totalGrossPaymentAmount}
              icon={<LocalAtmIcon className="h-5 w-5" />}
              iconBg="bg-[#E6F4FF]"
              iconText="text-[#1677FF]"
            />
          </div>
          <div
            className={PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS}
            data-cy="payroll-overview-net-paid-item"
          >
            <PayrollCard
              title="Net Paid Amount"
              data-cy="payroll-overview-net-paid-card"
              value={payrollForExport?.totalNetPayAmount}
              icon={<LocalAtmIcon className="h-5 w-5" />}
              iconBg="bg-[#F9F0FF]"
              iconText="text-[#722ED1]"
            />
          </div>
          <div
            className={PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS}
            data-cy="payroll-overview-total-allowance-item"
          >
            <PayrollCard
              title="Total Allowance"
              data-cy="payroll-overview-total-allowance-card"
              value={payrollForExport?.totalAllowanceAmount}
              icon={<PaymentsIcon className="h-5 w-5" />}
              iconBg="bg-[#F6FFED]"
              iconText="text-[#52C41A]"
            />
          </div>
          <div
            className={PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS}
            data-cy="payroll-overview-total-benefit-item"
          >
            <PayrollCard
              title="Total Benefit"
              data-cy="payroll-overview-total-benefit-card"
              value={payrollForExport?.totalMeritAmount}
              icon={<MdCardGiftcard className="h-5 w-5" />}
              iconBg="bg-[#FFFBE6]"
              iconText="text-[#FBB221]"
            />
          </div>
          <div
            className={PAYROLL_SUMMARY_CARD_SCROLL_ITEM_CLASS}
            data-cy="payroll-overview-total-deduction-item"
          >
            <PayrollCard
              title="Total Deduction"
              data-cy="payroll-overview-total-deduction-card"
              value={payrollForExport?.totalDeductionsAmount}
              icon={<MoneyOffIcon className="h-5 w-5" />}
              iconBg="bg-[#FFF2F0]"
              iconText="text-[#FF4D4F]"
            />
          </div>
        </div>
      )}

      <div
        className={
          isMobile
            ? 'rounded-xl border border-gray-100 bg-white p-4 shadow-sm'
            : 'rounded-xl border border-gray-100 bg-white p-6 shadow-sm'
        }
        data-cy="payroll-period-activity-log-card"
      >
        <h3
          className="mb-4 text-base font-semibold text-gray-900"
          data-cy="payroll-period-activity-log-title"
        >
          Activity Log
        </h3>

        <div
          className="mb-4 flex items-center justify-between gap-4"
          data-cy="payroll-activity-filters-row"
        >
          <Select
            placeholder="Search Employee / Remarks"
            value={selectedUserId}
            onChange={(value) => {
              setSelectedUserId(value || undefined);
              setEmployeeOrRemarksSearch('');
              setActivityPage(1);
            }}
            onSearch={(value) => {
              setEmployeeOrRemarksSearch(value);
              setActivityPage(1);
            }}
            allowClear
            showSearch
            loading={isLoadingUsers}
            suffixIcon={
              <div
                className="flex h-8 items-center justify-center border-l border-gray-200"
                data-cy="payroll-activity-search-suffix"
              >
                <SearchOutlined className="ml-2 text-gray-600" />
              </div>
            }
            filterOption={(input, option) => {
              const label = String(option?.children ?? '');
              return label.toLowerCase().includes(input.toLowerCase());
            }}
            className="h-8 w-full md:w-80"
            data-cy="payroll-activity-search-person-select"
          >
            {allUsers?.items &&
            Array.isArray(allUsers.items) &&
            allUsers.items.length > 0
              ? allUsers.items.map((user: any) => {
                  const fullName =
                    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                    'Unknown User';
                  return (
                    <Option key={user.id} value={user.id}>
                      {fullName}
                    </Option>
                  );
                })
              : !isLoadingUsers && (
                  <Option disabled value="">
                    No users found
                  </Option>
                )}
          </Select>

          <Popover
            content={filterPopoverContent}
            trigger="click"
            open={filterPopoverOpen}
            onOpenChange={setFilterPopoverOpen}
            placement="bottomRight"
            align={{
              offset: [0, 4],
              overflow: { adjustX: true, adjustY: true },
            }}
            getPopupContainer={() => document.body}
            data-cy="payroll-activity-filter-popover"
          >
            <Button
              className="flex h-8 items-center gap-2 border border-gray-200 bg-white leading-none text-gray-700 transition-colors hover:border-[#4096FF] hover:text-[#4096FF] hover:[&_.ant-btn-icon]:text-[#4096FF] [&_.ant-btn-icon]:flex [&_.ant-btn-icon]:items-center [&_.ant-btn-icon]:leading-none [&_.ant-btn-icon>*]:block"
              data-cy="payroll-activity-filter-button"
              htmlType="button"
              icon={<MdOutlineFilterAlt className="text-gray-600" />}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setFilterPopoverOpen(true);
              }}
            >
              <span
                className="hidden leading-none md:block"
                data-cy="payroll-activity-filter-button-label"
              >
                Filter
              </span>
            </Button>
          </Popover>
        </div>

        {isAuditLogsLoading ? (
          <TableSkeleton columns={activityColumns} />
        ) : (
          <>
            <Table
              columns={activityColumns}
              dataSource={filteredActivityRows}
              pagination={false}
              rowKey="id"
              rowClassName={(unusedRecord, index) =>
                index % 2 === 1 ? 'bg-gray-50 cursor-pointer' : 'cursor-pointer'
              }
              scroll={{ x: true }}
              data-cy="payroll-period-activity-log-table"
              onRow={(record) => ({
                onClick: () => {
                  sessionStorage.setItem(
                    `audit-log-${record.id}`,
                    JSON.stringify(record),
                  );
                  router.push(`/audit-log/${record.id}`);
                },
              })}
              locale={{
                emptyText: (
                  <EmptyState
                    title="No activity yet"
                    description="Payroll audit activity for this pay period will appear here."
                    compact
                  />
                ),
              }}
            />
            <div
              className="mt-2"
              data-cy="payroll-activity-pagination-container"
            >
              {isMobile || isTablet ? (
                <CustomMobilePagination
                  totalResults={totalItems}
                  pageSize={activityPageSize}
                  onChange={onPageChange}
                  onShowSizeChange={onPageChange}
                  data-cy="payroll-activity-mobile-pagination"
                />
              ) : (
                <CustomPagination
                  current={activityPage}
                  total={totalItems}
                  pageSize={activityPageSize}
                  onChange={onPageChange}
                  onShowSizeChange={onPageSizeChange}
                  data-cy="payroll-activity-desktop-pagination"
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PayrollPeriodOverviewPage;
