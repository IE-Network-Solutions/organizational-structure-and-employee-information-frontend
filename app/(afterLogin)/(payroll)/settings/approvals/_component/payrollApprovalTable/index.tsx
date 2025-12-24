import { Table, TableColumnsType } from 'antd';
import React from 'react';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

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
    <div data-cy="approval-list-table-container">
      <div className="mt-2 w-full" data-cy="approval-list-table-wrapper">
        <div
          className="overflow-x-auto scrollbar-none"
          data-cy="approval-list-table-scroll"
        >
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            loading={isEmployeeLoading}
            scroll={{ x: 730 }}
          />
        </div>
      </div>
      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={allFilterData?.meta?.totalItems ?? 0}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
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
        />
      )}
    </div>
  );
};

export default PayrollApprovalTable;
