'use client';
import React, { useState } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button, Input, Space } from 'antd';
import { LuPlus } from 'react-icons/lu';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import AllAllowanceTable from './_components/allAllowanceTable';
import { SearchOutlined } from '@ant-design/icons';

const AllAllowancePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: any) => {
    setSearchQuery(e.target.value);
  };
  return (
    <>
      <PageHeader title="All Allowance Entitlement" size="small" />
      <Space
        direction="horizontal"
        size="large"
        style={{ width: '100%', justifyContent: 'end', marginBottom: 16 }}
      >
        <Input
          addonBefore={<SearchOutlined />}
          placeholder="Search by name"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <AccessGuard permissions={[Permissions.CreateAllowanceEntitlement]}>
          <Button
            size="large"
            type="primary"
            id="createNewClosedHolidayFieldId"
            icon={<LuPlus size={18} />}
            onClick={() => {}}
            disabled
          >
            Employees
          </Button>
        </AccessGuard>
      </Space>
      <AllAllowanceTable searchQuery={searchQuery} />
    </>
  );
};

export default AllAllowancePage;
