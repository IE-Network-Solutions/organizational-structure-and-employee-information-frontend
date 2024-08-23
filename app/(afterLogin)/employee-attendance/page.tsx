import React from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import EmployeeAttendanceTable from '@/app/(afterLogin)/employee-attendance/_components/table';
import { Button, Space } from 'antd';
import { TbFileDownload, TbFileUpload } from 'react-icons/tb';
const Page = () => {
  return (
    <>
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
    </>
  );
};

export default Page;
