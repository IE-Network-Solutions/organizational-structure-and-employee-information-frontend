'use client';

import React, { useMemo, useState } from 'react';
import { Table, Avatar, Tag, Button } from 'antd';
import { ArrowLeftOutlined, FilterOutlined } from '@ant-design/icons';
import { useGetAllUsersData } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetAllAssignedUserGroupedByUser } from '@/store/server/features/employees/planning/planningPeriod/queries';
import CustomPagination from '@/components/customPagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { TableSkeleton } from '@/components/tableSkeleton';

interface NotReportedEmployeesListProps {
  userIds: string[];
  onBack: () => void;
}

const NotReportedEmployeesList: React.FC<NotReportedEmployeesListProps> = ({
  userIds,
  onBack,
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: employeeData, isLoading: employeeLoading } =
    useGetAllUsersData();
  // We need to know the type (Daily/Weekly), which comes from planning assignations
  const { data: planningData, isLoading: planningLoading } =
    useGetAllAssignedUserGroupedByUser(1, 1000, '');

  const { isMobile, isTablet } = useIsMobile();

  const filteredUsers = useMemo(() => {
    const users = Array.isArray(employeeData)
      ? employeeData
      : employeeData?.items || [];
    if (!users.length) return [];

    return users
      .filter((user: any) => userIds.includes(user.id))
      .map((user: any) => {
        const planningInfo = planningData?.items?.find(
          (p: any) => p.userId === user.id,
        );
        const type =
          planningInfo?.planningPeriod?.[0]?.planningPeriod?.intervalType ||
          'Daily';

        return {
          id: user.id,
          key: user.id,
          employeeId: user.employeeId || '1234', // Mocking ID as in screenshot if not present
          name: `${user.firstName || ''} ${user.lastName || ''}`,
          fullName: `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`,
          avatar: user.profileImage,
          position: user.jobTitle || 'Software Developer',
          department:
            user.departmentName || 'Property and Inventory Management',
          type: type.charAt(0).toUpperCase() + type.slice(1),
        };
      });
  }, [employeeData, userIds, planningData]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 80,
    },
    {
      title: 'Employee Name',
      key: 'name',
      render: (recordItem: any, record: any) => (
        <div
          className="flex items-center gap-3"
          data-cy={`not-reported-employee-row-${record.id}`}
        >
          <Avatar
            src={record.avatar}
            size={32}
            className="border border-gray-100"
            data-cy={`not-reported-employee-avatar-${record.id}`}
          >
            {record.name[0]}
          </Avatar>
          <span
            className="font-medium text-[#262626]"
            data-cy={`not-reported-employee-name-${record.id}`}
          >
            {record.name}
          </span>
        </div>
      ),
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag className="rounded-md px-3 py-0.5 border-[#d9d9d9] bg-white text-[#8c8c8c] font-normal">
          {type}
        </Tag>
      ),
    },
  ];

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  return (
    <div className="w-full" data-cy="not-reported-employees-list-container">
      {/* Header */}
      <div
        className="flex items-center justify-between mb-6"
        data-cy="not-reported-employees-list-header"
      >
        <div
          className="flex items-center gap-4"
          data-cy="not-reported-employees-list-header-left"
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            className="flex items-center justify-center rounded-lg border-[#d9d9d9] h-9 w-9"
            data-cy="not-reported-employees-list-back-button"
          />
          <h2
            className="text-[20px] font-bold text-[#262626] m-0"
            data-cy="not-reported-employees-list-title"
          >
            Employees that have not Reported Their Plans
          </h2>
        </div>
        <Button
          icon={<FilterOutlined />}
          className="flex items-center gap-2 rounded-lg border-[#d9d9d9] h-9 px-4"
          data-cy="not-reported-employees-list-filter-button"
        >
          Filter
        </Button>
      </div>

      {/* Table Container */}
      <div
        className="bg-white border border-[#f0f0f0] rounded-xl overflow-hidden shadow-sm"
        data-cy="not-reported-employees-list-table-container"
      >
        <div
          className="overflow-x-auto"
          data-cy="not-reported-employees-list-table-wrapper"
        >
          {employeeLoading || planningLoading ? (
            <TableSkeleton columns={columns} />
          ) : (
            <Table
              columns={columns}
              dataSource={paginatedData}
              pagination={false}
              className="custom-report-table"
              rowClassName={(record, index) =>
                index % 2 === 1 ? 'bg-[#fafafa]' : ''
              }
            />
          )}
        </div>

        <div
          className="custom-pagination-container"
          data-cy="not-reported-employees-list-pagination"
        >
          {isMobile || isTablet ? (
            <CustomMobilePagination
              totalResults={filteredUsers.length}
              pageSize={pageSize}
              onChange={setPage}
            />
          ) : (
            <CustomPagination
              current={page}
              total={filteredUsers.length}
              pageSize={pageSize}
              onChange={setPage}
              onShowSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )}
        </div>
      </div>

      <style jsx global data-cy="not-reported-employees-list-styles">{`
        .custom-report-table .ant-table-thead > tr > th {
          background-color: #fafafa !important;
          color: #8c8c8c !important;
          font-weight: 500 !important;
          font-size: 13px !important;
          padding: 18px 24px !important;
          border-bottom: 1px solid #f0f0f0 !important;
          text-transform: none !important;
        }
        .custom-report-table .ant-table-tbody > tr > td {
          padding: 20px 24px !important;
          font-size: 14px !important;
          color: #595959 !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }
        .custom-report-table .ant-table-tbody > tr:hover > td {
          background-color: #f5f8ff !important;
        }
        .custom-report-table .ant-table {
          background: transparent !important;
        }

        /* Force white background and remove padding for mobile pagination in this specific view */
        .custom-pagination-container .bg-gray-100 {
          background-color: #ffffff !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default NotReportedEmployeesList;
