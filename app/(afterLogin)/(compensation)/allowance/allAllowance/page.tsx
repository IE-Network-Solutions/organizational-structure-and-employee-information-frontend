'use client';
import React, { useState } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button, Select } from 'antd';
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
    <div className="bg-white rounded-lg px-1 py-4 sm:px-6">
      <div>
        {/* Mobile: PageHeader on top */}
        <div className="block sm:hidden pb-3">
          <PageHeader title="All Allowance" horizontalPadding="0px" />
        </div>

        {/* Main layout for sm and up */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          {/* Desktop PageHeader */}
          <div className="hidden sm:block bg-white">
            <PageHeader title="All Allowance" horizontalPadding="0px" />
          </div>

          {/* Right Section: Select + Button */}
          <div className="flex w-full sm:w-auto sm:flex-row sm:gap-4">
            {/* Select: 75% on mobile */}
            <div className="w-10/12 sm:w-72 mr-2">
              <Select
                showSearch
                allowClear
                className="h-10 w-full"
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
              />
            </div>

            {/* Button: 25% on mobile */}
            <div className="w-auto">
              <AccessGuard
                permissions={[Permissions.CreateAllowanceEntitlement]}
              >
                <Button
                  size="large"
                  type="primary"
                  className="h-10 w-10 sm:w-auto"
                  id="createNewClosedHolidayFieldId"
                  icon={<FaPlus />}
                  onClick={() => {}}
                  disabled
                >
                  <span className="hidden sm:inline">Employees</span>
                </Button>
              </AccessGuard>
            </div>
          </div>
        </div>
      </div>

      <div>
        <AllAllowanceTable searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default AllAllowancePage;
