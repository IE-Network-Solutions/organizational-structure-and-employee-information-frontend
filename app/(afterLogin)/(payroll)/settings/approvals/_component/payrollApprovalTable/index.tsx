import { Table, TableColumnsType } from 'antd';
import React from 'react';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { TableSkeleton } from '@/components/tableSkeleton';

const columns: TableColumnsType<any> = [
  {
    title: 'Workflow Name',
    dataIndex: 'workflow_name',
    ellipsis: true,
  },

  {
    title: 'Assigned',
    dataIndex: 'assigned',
  },
  {
    title: 'Level',
    dataIndex: 'level',
    sorter: (a, b) => a.level - b.level,
  },
  {
    title: 'Action',
    dataIndex: 'action',
  },
];

const PayrollApprovalTable = ({
  onPageChange,
  pageSize,
  data,
  isEmployeeLoading,
  allFilterData,
}: {
  onPageChange: (a: number, b?: number) => void;
  pageSize: number;
  data: {
    workflow_name: string;
    assigned: string;
    level: number;
    action: string;
  }[];
  isEmployeeLoading: boolean;
  allFilterData?: {
    meta?: {
      totalItems: number;
      currentPage: number;
    };
  };
}) => {
  const { isMobile, isTablet } = useIsMobile();
  return (
    <div
      id="approval-payroll-list-table-container"
      data-cy="approval-payroll-list-table-container"
    >
      <div
        className="mt-2 w-full"
        id="approval-payroll-list-table-wrapper"
        data-cy="approval-payroll-list-table-wrapper"
      >
        <div
          className="overflow-x-auto scrollbar-none"
          id="approval-payroll-list-table-scroll-container"
          data-cy="approval-payroll-list-table-scroll-container"
        >
          {isEmployeeLoading ? (
            <TableSkeleton columns={columns} />
          ) : (
            <Table
              columns={columns}
              dataSource={data}
              pagination={false}
              scroll={{ x: 730 }}
              id="approval-payroll-list-table-scroll"
              data-cy="approval-payroll-list-table-scroll"
            />
          )}
        </div>
      </div>
      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={allFilterData?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
          id="approval-payroll-list-table-mobile-pagination"
          data-cy="approval-payroll-list-table-mobile-pagination"
        />
      ) : (
        <CustomPagination
          current={allFilterData?.meta?.currentPage ?? 1}
          total={allFilterData?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={(pageSize) => {
            onPageChange(1, pageSize);
          }}
          id="approval-payroll-list-table-pagination"
          data-cy="approval-payroll-list-table-pagination"
        />
      )}
    </div>
  );
};

export default PayrollApprovalTable;
