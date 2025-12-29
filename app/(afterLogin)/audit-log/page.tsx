'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Table, Select, Tag, Avatar, Row, Col } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetAggregateAuditLogs } from '@/store/server/features/tenant-management/audit-logs/queries';
import { AggregateAuditLogParams } from '@/store/server/features/tenant-management/audit-logs/interface';
import { AuditLog } from '@/types/tenant-management';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import CustomPagination from '@/components/customPagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import dayjs from 'dayjs';
import { UserOutlined } from '@ant-design/icons';

const { Option } = Select;

// Module mapping: Display name -> Audit Log Module Name
const AUDIT_LOG_MODULES = [
  { label: 'Organization & Employee', value: 'OrgAndEmpAuditLog' },
  { label: 'Recruitment', value: 'RecruitmentAuditLog' },
  { label: 'OKR', value: 'OKRAuditLog' },
  { label: 'CFR', value: 'CFRAuditLog' },
  { label: 'Learning & Growth', value: 'TNAAuditLog' },
  { label: 'Payroll', value: 'PayrollAuditLog' },
  { label: 'Time & Attendance', value: 'TimesheetAuditLog' },
];

const AuditLogPage = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const [selectedModule, setSelectedModule] = useState<string | undefined>(undefined);
  const [selectedAction, setSelectedAction] = useState<string | undefined>(undefined);
  const [orderDirection, setOrderDirection] = useState<'ASC' | 'DESC'>('DESC');
  const { isMobile, isTablet } = useIsMobile();
  const { data: allUsers, isLoading: isLoadingUsers } = useGetAllUsers();

  const queryParams = useMemo(() => {
    const params = {
      module: selectedModule ?? 'all',
      page: currentPage,
      limit: pageSize,
      orderBy: 'performedAt',
      orderDirection: orderDirection,
      ...(selectedAction && { action: selectedAction }),
      ...(selectedUserId && { performedBy: selectedUserId }),
    };
    return params as AggregateAuditLogParams;
  }, [currentPage, pageSize, selectedAction, selectedModule, selectedUserId, orderDirection]);

  // Fetch audit logs from API
  const { data: auditLogsResponse, isLoading } = useGetAggregateAuditLogs(
    queryParams,
    true,
  );

  const auditLogsData = auditLogsResponse?.items || [];
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
    if (actionLower === 'update' || actionLower === 'updated') return 'purple';
    if (actionLower === 'delete' || actionLower === 'deleted') return 'red';
    return 'default';
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
    const moduleItem = AUDIT_LOG_MODULES.find(m => m.value === moduleValue);
    return moduleItem ? moduleItem.label : moduleValue;
  };

  const columns = [
    {
      title: 'Log ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => id || 'N/A',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag 
          color={getActionColor(action)} 
          className="capitalize"
          style={{ border: 'none' }}
        >
          {action}
        </Tag>
      ),
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      render: (unusedValue: any, record: any) => {
        // If a specific module is selected, show that module's display name
        if (selectedModule) {
          return getModuleDisplayName(selectedModule);
        }
        // Otherwise, use the module field from the record (when module='all')
        return getModuleDisplayName(record?.module);
      },
    },
    {
      title: 'Performed by',
      dataIndex: 'performedBy',
      key: 'performedBy',
      render: (unusedValue: any, record: any) => {
        const user = record?.performedByUser;
        const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : null;
        return (
          <div className="flex items-center gap-2">
            <Avatar
              size={32}
              src={user?.profileImage}
              icon={!user?.profileImage ? <UserOutlined /> : undefined}
            />
            <span>{fullName || 'Unknown User'}</span>
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
        >
          <span>Performed at</span>
          {orderDirection === 'DESC' ? (
            <ArrowDownOutlined className="text-xs" />
          ) : (
            <ArrowUpOutlined className="text-xs" />
          )}
        </div>
      ),
      dataIndex: 'performedAt',
      key: 'performedAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Remarks',
      key: 'remarks',
      render: (unusedValue: any, record: AuditLog) => getRemarks(record),
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
  }, [selectedModule, selectedAction, selectedUserId, orderDirection]);


  return (
    <div
      className="bg-white min-h-screen p-4 md:p-6"
      data-cy="audit-log-page-container"
      id="audit-log-page-container"
    >
      <CustomBreadcrumb
        title="Audit log"
        subtitle="Track all the events that have happened in the system"
      />

      <div
        className="mt-6 mb-4"
        data-cy="audit-log-filters-container"
        id="audit-log-filters-container"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={16} md={14} lg={14}>
            <Select
              placeholder="Search by person"
              value={selectedUserId}
              onChange={(value) => {
                setSelectedUserId(value || undefined);
                setCurrentPage(1);
              }}
              allowClear
              showSearch
              loading={isLoadingUsers}
              filterOption={(input, option) => {
                const label = String(option?.children ?? '');
                return label.toLowerCase().includes(input.toLowerCase());
              }}
              className="w-full h-12"
              data-cy="audit-log-search-person-select"
              id="audit-log-search-person-select"
            >
              {allUsers?.items && Array.isArray(allUsers.items) && allUsers.items.length > 0
                ? allUsers.items.map((user: any) => {
                    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
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
          </Col>
          <Col xs={24} sm={8} md={5} lg={5}>
            <Select
              placeholder="All Modules"
              value={selectedModule}
              onChange={(value) => {
                setSelectedModule(value || undefined);
                setCurrentPage(1);
              }}
              allowClear
              className="w-full h-12"
              data-cy="audit-log-module-select"
              id="audit-log-module-select"
            >
              {AUDIT_LOG_MODULES.map((module) => (
                <Option key={module.value} value={module.value}>
                  {module.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={5} lg={5}>
            <Select
              placeholder="All Actions"
              value={selectedAction}
              onChange={(value) => {
                setSelectedAction(value);
                setCurrentPage(1);
              }}
              allowClear
              className="w-full h-12"
              data-cy="audit-log-action-select"
              id="audit-log-action-select"
            >
              {actions.map((action) => (
                <Option key={action} value={action}>
                  {action}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
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
          scroll={{ x: true }}
          data-cy="audit-log-table"
          id="audit-log-table"
          className="cursor-pointer"
          onRow={(record) => ({
            onClick: () => {
              // Store the record data in sessionStorage for the detail page to use
              sessionStorage.setItem(`audit-log-${record.id}`, JSON.stringify(record));
              router.push(`/audit-log/${record.id}`);
            },
          })}
          locale={{
            emptyText: 'No data available',
          }}
        />

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
  );
};

export default AuditLogPage;

