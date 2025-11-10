'use client';
import React from 'react';
import { Table } from 'antd';
import CustomPagination from '@/components/customPagination';
import { useRecruitmentDashboardStore } from '@/store/uistate/features/recruitment/dashboard';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { LoadingOutlined } from '@ant-design/icons';

export default function JobPerformance({
  data,
  isLoading,
}: {
  data: any;
  isLoading: boolean;
}) {
  const { jobPostPage, setJobPostPage, jobPostLimit, setJobPostLimit } =
    useRecruitmentDashboardStore();
  const { data: departments, isLoading: departmentsLoading } =
    useGetDepartments();
  const getDepartmentName = (id: string) => {
    const department = departments?.find(
      (department: any) => department.id === id,
    );
    if (departmentsLoading) return <LoadingOutlined />;
    return department?.name;
  };

  const columns = [
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
      title: 'Recruiter',
      dataIndex: 'recruiter',
      key: 'recruiter',
    },
    {
      title: 'No of applicants',
      dataIndex: 'noOfApplicants',
      key: 'noOfApplicants',
    },
    {
      title: 'Open Date',
      dataIndex: 'openingDate',
      key: 'openingDate',
    },
    {
      title: 'Close Date',
      dataIndex: 'closedDate',
      key: 'closedDate',
      render: (notused: string, record: any) => {
        return record.closedDate ? record.closedDate : '-';
      },
    },
  ];
  return (
    <div>
      <Table
        columns={columns}
        dataSource={data?.results}
        loading={isLoading}
        pagination={false}
        bordered={false}
        className="rounded-none [&_.ant-table-thead_.ant-table-cell]:rounded-none [&_.ant-table-thead_.ant-table-cell]:border-r-0 [&_.ant-table-thead_.ant-table-cell]:border-l-0 md:w-full w-full overflow-x-auto scrollbar-hide"
      />

      <CustomPagination
        total={data?.total}
        pageSize={jobPostLimit}
        current={jobPostPage}
        onChange={(page: number, pageSize?: number) => {
          setJobPostPage(page);
          if (pageSize) setJobPostLimit(pageSize);
        }}
        onShowSizeChange={(pageSize) => {
          setJobPostPage(1);
          setJobPostLimit(pageSize);
        }}
      />
    </div>
  );
}
