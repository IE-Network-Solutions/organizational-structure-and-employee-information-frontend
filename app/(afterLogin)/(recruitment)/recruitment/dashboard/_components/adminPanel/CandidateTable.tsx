'use client';
import React from 'react';
import { Table, Spin } from 'antd';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { LoadingOutlined } from '@ant-design/icons';
import CustomPagination from '@/components/customPagination';
import { useRecruitmentDashboardStore } from '@/store/uistate/features/recruitment/dashboard';

export default function CandidateTable({
  data,
  isLoading,
}: {
  data: any;
  isLoading: boolean;
}) {
  const { data: departments, isLoading: departmentsLoading } =
    useGetDepartments();
  const { page, limit, setPage, setLimit } = useRecruitmentDashboardStore();
  const getDepartmentName = (id: string) => {
    const department = departments?.find(
      (department: any) => department.id === id,
    );
    if (departmentsLoading) return <LoadingOutlined />;
    return department?.name;
  };
  const columns = [
    {
      title: 'Candidate',
      dataIndex: 'candidate',
      key: 'candidate',
    },
    {
      title: 'Job',
      dataIndex: 'job',
      key: 'job',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (text: string, record: any) => {
        return getDepartmentName(record.department);
      },
    },
    {
      title: 'Stage',
      dataIndex: 'stage',
      key: 'stage',
    },
    {
      title: 'Days to hire',
      dataIndex: 'daysToHire',
      key: 'daysToHire',
    },
  ];
  return (
    <div>
      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={data?.results}
          pagination={false}
          bordered={false}
          className="rounded-none [&_.ant-table-thead_.ant-table-cell]:rounded-none [&_.ant-table-thead_.ant-table-cell]:border-r-0 [&_.ant-table-thead_.ant-table-cell]:border-l-0"
        />
        <CustomPagination
          total={data?.total}
          pageSize={limit}
          current={page}
          onChange={(page: number, pageSize?: number) => {
            setPage(page);
            if (pageSize) setLimit(pageSize);
          }}
          onShowSizeChange={(size: number) => {
            setPage(1);
            setLimit(size);
          }}
        />
      </Spin>
    </div>
  );
}
