'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Table, Select, Tag, Avatar, Popover, Button, DatePicker } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetAggregateAuditPostLogs } from '@/store/server/features/tenant-management/audit-logs/queries';
import { AggregateAuditLogParams } from '@/store/server/features/tenant-management/audit-logs/interface';
import { AuditLog } from '@/types/tenant-management';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import dayjs, { Dayjs } from 'dayjs';
import { UserOutlined } from '@ant-design/icons';
import { MdOutlineFilterAlt } from 'react-icons/md';

const { Option } = Select;

// Module mapping: Display name -> Audit Log Module Name
const AUDIT_LOG_MODULES = [
  { label: 'Employee Management', value: 'OrgAndEmpAuditLog' },
  { label: 'Talent Acquisition', value: 'RecruitmentAuditLog' },
  { label: 'OKR', value: 'OKRAuditLog' },
  { label: 'CFR', value: 'CFRAuditLog' },
  { label: 'Learning & Growth', value: 'TNAAuditLog' },
  { label: 'Payroll', value: 'PayrollAuditLog' },
  { label: 'Time and attendance', value: 'TimesheetAuditLog' },
];

const ALL_AUDIT_LOG_MODULE_VALUES = AUDIT_LOG_MODULES.map((m) => m.value);

const VALID_MODULE_VALUE_SET = new Set(ALL_AUDIT_LOG_MODULE_VALUES);

const AuditLogPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modulesQueryRaw = searchParams.get('modules');
  const modulesFromUrl =
    modulesQueryRaw != null && modulesQueryRaw.trim() !== ''
      ? modulesQueryRaw
      : null;
  const moduleFromUrl = searchParams.get('module');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(
    undefined,
  );
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | undefined>(
    undefined,
  );
  const [orderDirection, setOrderDirection] = useState<'ASC' | 'DESC'>('DESC');
  const { isMobile, isTablet } = useIsMobile();
  const { data: allUsers, isLoading: isLoadingUsers } = useGetAllUsers();
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);

  useEffect(() => {
    if (modulesFromUrl) {
      const parsed = modulesFromUrl
        .split(',')
        .map((s) => s.trim())
        .filter((v) => VALID_MODULE_VALUE_SET.has(v));
      setSelectedModules(parsed);
      setCurrentPage(1);
      return;
    }
    if (moduleFromUrl && VALID_MODULE_VALUE_SET.has(moduleFromUrl)) {
      setSelectedModules([moduleFromUrl]);
      setCurrentPage(1);
      return;
    }
    if (!modulesFromUrl && moduleFromUrl === null) {
      setSelectedModules([]);
    }
  }, [modulesFromUrl, moduleFromUrl]);

  const queryParams = useMemo(() => {
    const modulesForRequest =
      selectedModules.length > 0
        ? selectedModules
        : ALL_AUDIT_LOG_MODULE_VALUES;
    const params = {
      modules: modulesForRequest,
      page: currentPage,
      limit: pageSize,
      orderBy: 'performedAt',
      orderDirection: orderDirection,
      ...(selectedAction && { action: selectedAction }),
      ...(selectedUserId && { performedBy: selectedUserId }),
      ...(dateFrom && { startDate: dateFrom.format('YYYY-MM-DD') }),
      ...(dateTo && { endDate: dateTo.format('YYYY-MM-DD') }),
    };
    return params as AggregateAuditLogParams;
  }, [
    currentPage,
    pageSize,
    selectedAction,
    selectedModules,
    selectedUserId,
    orderDirection,
    dateFrom,
    dateTo,
  ]);
  // Fetch audit logs from API
  const { data: auditLogsResponse, isLoading } = useGetAggregateAuditPostLogs(
    queryParams,
    true,
  );

  const auditLogsData = useMemo(() => {
    return auditLogsResponse?.items ?? [];
  }, [auditLogsResponse]);
  const totalItems = auditLogsResponse?.meta?.totalItems || 0;

  const actions = useMemo(() => {
    const defaultActions = ['CREATE', 'UPDATE', 'DELETE'];
    if (!auditLogsData?.length) {
      return defaultActions;
    }
    const uniqueActions = new Set<string>(defaultActions);
    auditLogsData.forEach((log: AuditLog) => {
      if (log.action) uniqueActions.add(log.action);
    });
    return Array.from(uniqueActions).sort();
  }, [auditLogsData]);

  const filteredAuditLogsData = auditLogsData;

  const getActionColor = (action: string) => {
    const actionLower = action?.toLowerCase();
    if (actionLower === 'create' || actionLower === 'created') return 'green';
    if (actionLower === 'update' || actionLower === 'updated') return 'blue';
    if (actionLower === 'delete' || actionLower === 'deleted') return 'red';
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

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM DD, YYYY HH:mm:ss');
  };

  const getRemarks = (log: any) => {
    return log.remarks || '--';
  };

  // Helper function to get module display name from module value
  const getModuleDisplayName = (moduleValue: string | undefined): string => {
    if (!moduleValue) return '--';
    const moduleItem = AUDIT_LOG_MODULES.find((m) => m.value === moduleValue);
    return moduleItem ? moduleItem.label : moduleValue;
  };

  const columns = [
    {
      title: 'Log ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string, record: AuditLog) => (
        <span
          className="text-sm"
          data-cy={`audit-log-id-${record?.id ?? id ?? 'na'}`}
          id={`audit-log-id-${record?.id ?? id ?? 'na'}`}
        >
          {id || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag
          color={getActionColor(action)}
          className="capitalize text-sm"
          style={{ border: 'none' }}
          data-cy={`audit-log-action-tag-${action}`}
          id={`audit-log-action-tag-${action}`}
        >
          {formatActionLabel(action)}
        </Tag>
      ),
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      render: (unusedValue: any, record: any) => {
        // If a specific module is selected, show that module's display name
        const displayName = getModuleDisplayName(record?.module);

        return (
          <span
            className="text-sm"
            data-cy={`audit-log-module-${record?.id ?? 'na'}`}
            id={`audit-log-module-${record?.id ?? 'na'}`}
          >
            {displayName}
          </span>
        );
      },
    },
    {
      title: 'Performed By',
      dataIndex: 'performedBy',
      key: 'performedBy',
      render: (unusedValue: any, record: any) => {
        const user = record?.performedByUser;
        const fullName = user
          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
          : null;
        return (
          <div
            className="flex items-center gap-2"
            data-cy={`audit-log-performed-by-${record?.id}`}
            id={`audit-log-performed-by-${record?.id}`}
          >
            <div
              data-cy={`audit-log-user-avatar-${record?.id}`}
              id={`audit-log-user-avatar-${record?.id}`}
            >
              <Avatar
                size={32}
                src={user?.profileImage}
                icon={!user?.profileImage ? <UserOutlined /> : undefined}
              />
            </div>
            <span
              className="text-sm"
              data-cy={`audit-log-user-name-${record?.id}`}
              id={`audit-log-user-name-${record?.id}`}
            >
              {fullName || 'Unknown User'}
            </span>
          </div>
        );
      },
    },
    {
      title: (
        <div
          className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
          onClick={() => {
            setOrderDirection(orderDirection === 'DESC' ? 'ASC' : 'DESC');
            setCurrentPage(1);
          }}
          data-cy="audit-log-performed-at-header"
          id="audit-log-performed-at-header"
        >
          <span data-cy="app-afterlogin-audit-log-page-tsx-page-span-196">
            Performed At
          </span>
          {orderDirection === 'DESC' ? (
            <ArrowDownOutlined className="text-xs" />
          ) : (
            <ArrowUpOutlined className="text-xs" />
          )}
        </div>
      ),
      dataIndex: 'performedAt',
      key: 'performedAt',
      render: (date: string, record: AuditLog) => (
        <span
          className="text-sm"
          data-cy={`audit-log-performed-at-${record?.id ?? 'na'}`}
          id={`audit-log-performed-at-${record?.id ?? 'na'}`}
        >
          {formatDate(date)}
        </span>
      ),
    },
    {
      title: 'Remarks',
      key: 'remarks',
      render: (unusedValue: any, record: AuditLog) => (
        <span
          className="text-sm"
          data-cy={`audit-log-remarks-${record?.id ?? 'na'}`}
          id={`audit-log-remarks-${record?.id ?? 'na'}`}
        >
          {getRemarks(record)}
        </span>
      ),
    },
  ];

  const onPageChange = (page: number, currentPageSize?: number) => {
    if (currentPageSize && currentPageSize !== pageSize) {
      setPageSize(currentPageSize);
      setCurrentPage(1);
    } else {
      setCurrentPage(page);
    }
  };

  const onPageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedModules,
    selectedAction,
    selectedUserId,
    orderDirection,
    dateFrom,
    dateTo,
  ]);

  const filterPopoverContent = (
    <div
      className="md:w-[440px] w-full md:max-w-[calc(100vw-32px)] max-w-full px-4 py-2"
      data-cy="audit-log-filter-popover-content"
      id="audit-log-filter-popover-content"
    >
      <div
        className="flex justify-between items-start mb-1"
        data-cy="audit-log-filter-popover-header"
        id="audit-log-filter-popover-header"
      >
        <div
          data-cy="audit-log-filter-popover-title-wrap"
          id="audit-log-filter-popover-title-wrap"
        >
          <h3
            className="text-lg font-semibold text-gray-900 m-0"
            data-cy="audit-log-filter-popover-title"
            id="audit-log-filter-popover-title"
          >
            Filter
          </h3>
          <p
            className="text-sm text-gray-500 mt-1 mb-0"
            data-cy="audit-log-filter-popover-subtitle"
            id="audit-log-filter-popover-subtitle"
          >
            Select All filters that apply
          </p>
        </div>

        <button
          type="button"
          aria-label="Close filter"
          onClick={() => setFilterPopoverOpen(false)}
          className="text-gray-400 hover:text-gray-600 leading-none text-xl font-medium"
          data-cy="audit-log-filter-close-button"
          id="audit-log-filter-close-button"
        >
          ×
        </button>
      </div>

      <div
        className="mt-4 flex flex-col gap-5"
        data-cy="audit-log-filter-fields"
        id="audit-log-filter-fields"
      >
        <div
          data-cy="audit-log-filter-date-field"
          id="audit-log-filter-date-field"
        >
          <div
            className="text-sm font-semibold text-gray-900 mb-2"
            data-cy="audit-log-filter-date-label"
            id="audit-log-filter-date-label"
          >
            Date
          </div>
          <DatePicker.RangePicker
            value={[dateFrom, dateTo] as any}
            format="YYYY-MM-DD"
            placeholder={['Start date', 'End date']}
            className="w-full h-10"
            onChange={(dates) => {
              setDateFrom(dates?.[0] ?? null);
              setDateTo(dates?.[1] ?? null);
              setCurrentPage(1);
            }}
            data-cy="audit-log-date-range-picker"
            id="audit-log-date-range-picker"
          />
        </div>

        <div
          data-cy="audit-log-filter-action-field"
          id="audit-log-filter-action-field"
        >
          <div
            className="text-sm font-semibold text-gray-900 mb-2"
            data-cy="audit-log-filter-action-label"
            id="audit-log-filter-action-label"
          >
            Action
          </div>
          <Select
            placeholder="Create"
            value={selectedAction}
            onChange={(value) => {
              setSelectedAction(value);
              setCurrentPage(1);
            }}
            className="w-full h-10"
            data-cy="audit-log-action-select-popover"
            id="audit-log-action-select-popover"
          >
            {actions.map((action) => (
              <Option
                key={action}
                value={action}
                data-cy={`audit-log-action-option-popover-${action}`}
                id={`audit-log-action-option-popover-${action}`}
              >
                {formatActionLabel(action)}
              </Option>
            ))}
          </Select>
        </div>

        <div
          data-cy="audit-log-filter-module-field"
          id="audit-log-filter-module-field"
        >
          <div
            className="text-sm font-semibold text-gray-900 mb-2"
            data-cy="audit-log-filter-module-label"
            id="audit-log-filter-module-label"
          >
            Module
          </div>
          <Select
            placeholder="Time and attendance"
            value={selectedModules}
            onChange={(value) => {
              setSelectedModules(Array.isArray(value) ? value : []);
              setCurrentPage(1);
            }}
            className={`w-full  ${selectedModules.length > 0 ? 'min-h-10' : 'h-10'}`}
            data-cy="audit-log-module-select-popover"
            id="audit-log-module-select-popover"
            mode="multiple"
          >
            {AUDIT_LOG_MODULES.map((module) => (
              <Option
                key={module.value}
                value={module.value}
                data-cy={`audit-log-module-option-popover-${module.value}`}
                id={`audit-log-module-option-popover-${module.value}`}
              >
                {module.label}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <div
        className="flex justify-end gap-3 mt-6"
        data-cy="audit-log-filter-actions"
        id="audit-log-filter-actions"
      >
        <Button
          onClick={() => {
            setDateFrom(null);
            setDateTo(null);
            setSelectedModules([]);
            setSelectedAction(undefined);
            setCurrentPage(1);
          }}
          className="transition-colors hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200 active:border-gray-400"
          data-cy="audit-log-filter-reset-button"
          id="audit-log-filter-reset-button"
        >
          Reset
        </Button>
        <Button
          type="primary"
          onClick={() => setFilterPopoverOpen(false)}
          className="transition-colors hover:opacity-90 hover:brightness-110 active:opacity-95 active:brightness-105"
          data-cy="audit-log-filter-save-button"
          id="audit-log-filter-save-button"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className="bg-white min-h-screen"
      data-cy="audit-log-page-container"
      id="audit-log-page-container"
    >
      <div
        data-cy="audit-log-breadcrumb-container"
        id="audit-log-breadcrumb-container"
      >
        <CustomBreadcrumb
          title="Audit log"
          subtitle="Track all the events that have happened in the system"
        />
      </div>
      <div
        data-cy="audit-log-filters-container"
        className="border border-gray-200 rounded-md"
      >
        <div
          className=" p-3 md:p-3"
          data-cy="audit-log-filters-container"
          id="audit-log-filters-container"
        >
          <div
            className="flex items-center justify-between md:gap-2 gap-6"
            data-cy="audit-log-filters-row"
            id="audit-log-filters-row"
          >
            <Select
              placeholder="Search Employee"
              value={selectedUserId}
              onChange={(value) => {
                setSelectedUserId(value || undefined);
                setCurrentPage(1);
              }}
              allowClear
              showSearch
              loading={isLoadingUsers}
              suffixIcon={
                <div
                  className="border-l border-gray-200 h-8 flex items-center justify-center"
                  data-cy="audit-log-search-suffix"
                  id="audit-log-search-suffix"
                >
                  <SearchOutlined
                    className="text-gray-600 ml-2"
                    data-cy="audit-log-search-icon"
                  />
                </div>
              }
              filterOption={(input, option) => {
                const label = String(option?.children ?? '');
                return label.toLowerCase().includes(input.toLowerCase());
              }}
              className="md:w-80 w-full h-8"
              data-cy="audit-log-search-person-select"
              id="audit-log-search-person-select"
            >
              {allUsers?.items &&
              Array.isArray(allUsers.items) &&
              allUsers.items.length > 0
                ? allUsers.items.map((user: any) => {
                    const fullName =
                      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                      'Unknown User';
                    return (
                      <Option
                        key={user.id}
                        value={user.id}
                        data-cy={`audit-log-user-option-${user.id}`}
                        id={`audit-log-user-option-${user.id}`}
                      >
                        {fullName}
                      </Option>
                    );
                  })
                : !isLoadingUsers && (
                    <Option
                      disabled
                      value=""
                      data-cy="audit-log-no-users-option"
                      id="audit-log-no-users-option"
                    >
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
              data-cy="audit-log-filter-popover"
              id="audit-log-filter-popover"
            >
              <Button
                className="h-8 flex items-center gap-2 border border-gray-200 text-gray-700 bg-white transition-colors hover:border-[#4096FF] hover:text-[#4096FF] hover:[&_.ant-btn-icon]:text-[#4096FF]"
                id="audit-log-filter-button"
                data-cy="audit-log-filter-button"
                htmlType="button"
                icon={
                  <MdOutlineFilterAlt
                    data-cy="audit-log-filter-button-icon"
                    className="text-gray-600"
                  />
                }
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setFilterPopoverOpen(true);
                }}
              >
                <span
                  className="hidden md:block"
                  data-cy="audit-log-filter-button-text"
                  id="audit-log-filter-button-text"
                >
                  Filter
                </span>
              </Button>
            </Popover>
          </div>
        </div>

        <div
          className="overflow-x-auto"
          data-cy="audit-log-table-container"
          id="audit-log-table-container"
        >
          <Table
            columns={columns}
            dataSource={filteredAuditLogsData}
            loading={isLoading}
            pagination={false}
            rowKey="id"
            rowClassName={(unusedRecord, index) =>
              index % 2 === 1 ? 'bg-gray-50' : ''
            }
            scroll={{ x: true }}
            data-cy="audit-log-table"
            id="audit-log-table"
            className="cursor-pointer"
            onRow={(record) => ({
              onClick: () => {
                // Store the record data in sessionStorage for the detail page to use
                sessionStorage.setItem(
                  `audit-log-${record.id}`,
                  JSON.stringify(record),
                );
                router.push(`/audit-log/${record.id}`);
              },
              'data-cy': `audit-log-table-row-${record.id}`,
              id: `audit-log-table-row-${record.id}`,
            })}
            locale={{
              emptyText: 'No data available',
            }}
          />
          <div
            className="px-3 md:px-3"
            data-cy="audit-log-pagination-container"
            id="audit-log-pagination-container"
          >
            {isMobile || isTablet ? (
              <CustomMobilePagination
                totalResults={totalItems}
                pageSize={pageSize}
                onChange={onPageChange}
                onShowSizeChange={onPageChange}
                data-cy="audit-log-mobile-pagination"
              />
            ) : (
              <CustomPagination
                current={currentPage}
                total={totalItems}
                pageSize={pageSize}
                onChange={onPageChange}
                onShowSizeChange={onPageSizeChange}
                data-cy="audit-log-desktop-pagination"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;
