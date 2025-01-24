import { Table, TableColumnsType } from 'antd';
import React from 'react';
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
  return (
    <div>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          total: allFilterData?.meta?.totalItems,
          current: allFilterData?.meta?.currentPage,
          pageSize: pageSize,
          onChange: onPageChange,
          showSizeChanger: true,
          onShowSizeChange: onPageChange,
        }}
        loading={isEmployeeLoading}
      />
    </div>
  );
};

export default ApproverListTableComponent;
