import React from 'react';
import { Table, TableColumnsType } from 'antd';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { EmployeeData } from '@/types/dashboard/adminManagement';
const columns: TableColumnsType<EmployeeData> = [
  {
    title: 'Employee Name',
    dataIndex: 'employee_name',
    ellipsis: true,
  },
  {
    title: 'Job Title',
    dataIndex: 'job_title',
    // sorter: (a, b) => a.job_title.localeCompare(b.job_title),
  },
  {
    title: 'Department',
    dataIndex: 'department',
    // sorter: (a, b) => a.department.localeCompare(b.department),
  },
  {
    title: 'Office',
    dataIndex: 'office',
    // sorter: (a, b) => a.office.localeCompare(b.office),
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
    // sorter: (a, b) => a.role.localeCompare(b.role),
  },
  {
    title: 'Action',
    dataIndex: 'action',
  },
];
const SuccesseionPlanTable = () => {
  const {} = useOrganizationalDevelopment();

  return (
    <div className="mt-2">
      <Table
        className="w-full"
        columns={columns}
        dataSource={[]}
        // pagination={{
        //   total: allFilterData?.meta?.totalItems,
        //   current: allFilterData?.meta?.currentPage,
        //   pageSize: pageSize,
        //   onChange: onPageChange,
        //   showSizeChanger: true,
        //   onShowSizeChange: onPageChange,
        // }}
        // loading={isEmployeeLoading}
        // rowSelection={{
        //   type: selectionType,
        //   ...rowSelection,
        // }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};
export default SuccesseionPlanTable;
