import React from 'react';
import { Table, TableColumnsType } from 'antd';
import { EmployeeData } from '@/types/dashboard/adminManagement';
import { useFetchCriticalPositions } from '@/store/server/features/organization-development/SuccessionPlan/queries';
const columns: TableColumnsType<EmployeeData> = [
  {
    title: 'Employee Name',
    dataIndex: 'userId',
    ellipsis: true,
  },
  {
    title: 'Job Title',
    dataIndex: 'name',
  },
  {
    title: 'Department',
    dataIndex: 'department',
  },
  {
    title: 'Office',
    dataIndex: 'office',
  },
  {
    title: 'Employee Status',
    dataIndex: 'employee_status',
  },
  {
    title: 'Account',
    dataIndex: 'account',
  },
  {
    title: 'Role',
    dataIndex: 'role',
  },
  {
    title: 'Action',
    dataIndex: 'action',
  },
];

const SuccesseionPlanTable = () => {
  const {data} = useFetchCriticalPositions();

  return (
    <div className="mt-2">
      <Table
        className="w-full"
        columns={columns}
        dataSource={data}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};
export default SuccesseionPlanTable;
