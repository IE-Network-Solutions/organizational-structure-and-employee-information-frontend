'use client';
import React from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { Button, Space } from 'antd';
import { TbFileDownload, TbFileUpload } from 'react-icons/tb';
import EmployeeAttendanceTable from './_components/employeeAttendanceTable';
const EmployeeAttendance = () => {
  return (
    <div className="h-auto w-auto pr-6 pb-6 pl-3">
      <PageHeader
        title="Employee Attendance"
        description="Manage your Team Attendance"
      >
        <Space>
          <Button icon={<TbFileUpload size={18} />} size="large">
            Import
          </Button>
          <Button
            icon={<TbFileDownload size={18} />}
            size="large"
            type="primary"
          >
            Export
          </Button>
        </Space>
      </PageHeader>
      <BlockWrapper className="mt-8">
        <EmployeeAttendanceTable />
      </BlockWrapper>
    </div>
  );
};

export default EmployeeAttendance;
