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
    title: 'Applied To',
    dataIndex: 'applied_to',
    sorter: (a, b) => a.applied_to.localeCompare(b.applied_to),
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

const ApproverListTableComponent = ({
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
    applied_to: string;
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
    <div>
    <div className="mt-2 w-[900px]">
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        loading={isEmployeeLoading}
        scroll={{ x: 100 }}
      />
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
                  onShowSizeChange={onPageChange}
          />
        )}
    </div>
  );
};

export default ApproverListTableComponent;
