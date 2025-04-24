'use client';
import React, { useState } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button, Select, Space } from 'antd';
import { LuPlus } from 'react-icons/lu';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import AllAllowanceTable from './_components/allAllowanceTable';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { FaPlus } from 'react-icons/fa';

const AllAllowancePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: employeeData } = useGetAllUsers();

  const handleSearchChange = (value: any) => {
    setSearchQuery(value);
  };
  const options =
    employeeData?.items?.map((emp: any) => ({
      value: emp.id,
      label: `${emp.firstName || ''}  ${emp?.middleName} ${emp.lastName}`, // Full name as label
      employeeData: emp,
    })) || [];

  return (
    <>
      <div className="flex justify-between">
        <PageHeader title="All Allowance" size="small" />
        <Space direction="horizontal" size="large">
          <Select
            showSearch
            allowClear
            className="min-h-12"
            placeholder="Search by name"
            onChange={handleSearchChange}
            filterOption={(input, option) => {
              const label = option?.label;
              return (
                typeof label === 'string' &&
                label.toLowerCase().includes(input.toLowerCase())
              );
            }}
            options={options}
            style={{ width: 300 }} // Set a width for better UX
          />
          <AccessGuard permissions={[Permissions.CreateAllowanceEntitlement]}>
            <Button
              size="large"
              type="primary"
              className="min-h-12"
              id="createNewClosedHolidayFieldId"
              icon={<FaPlus />}
              onClick={() => {}}
              disabled
            >
              <span className='hidden sm:inline'>
                Employees
              </span>
            </Button>
          </AccessGuard>
        </Space>
      </div>
<div className='overflow-x-auto'>
      <AllAllowanceTable searchQuery={searchQuery} />
      </div>
    </>
  );
};

export default AllAllowancePage;
