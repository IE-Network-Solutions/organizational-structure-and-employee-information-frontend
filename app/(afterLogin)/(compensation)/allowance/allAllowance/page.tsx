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
    <div
      className="bg-white rounded-lg px-1 py-4 sm:px-6 sm:mr-4"
      id="compensation-allowance-all-wrapper"
      data-cy="compensation-allowance-all-wrapper"
    >
      <div
        id="compensation-allowance-all-inner"
        data-cy="compensation-allowance-all-inner"
      >
        {/* Mobile: PageHeader on top */}
        <div
          className="block sm:hidden pb-3"
          id="compensation-allowance-all-mobile-header-wrapper"
          data-cy="compensation-allowance-all-mobile-header-wrapper"
        >
          <PageHeader
            title="All Allowance Entitlement"
            horizontalPadding="0px"
            data-cy="compensation-allowance-all-mobile-page-header"
          />
        </div>

        {/* Main layout for sm and up */}
        <div
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
          id="compensation-allowance-all-desktop-layout"
          data-cy="compensation-allowance-all-desktop-layout"
        >
          {/* Desktop PageHeader */}
          <div
            className="hidden sm:block bg-white"
            id="compensation-allowance-all-desktop-header-wrapper"
            data-cy="compensation-allowance-all-desktop-header-wrapper"
          >
            <PageHeader
              data-cy="compensation-allowance-all-desktop-page-header"
              title="All Allowance Entitlement"
              horizontalPadding="0px"
            />
          </div>

          {/* Right Section: Select + Button */}
          <div
            className="flex w-full sm:w-auto sm:flex-row sm:gap-4"
            id="compensation-allowance-all-actions-row"
            data-cy="compensation-allowance-all-actions-row"
          >
            {/* Select: 75% on mobile */}
            <div
              className="w-10/12 mr-2 sm:hidden"
              id="compensation-allowance-all-mobile-select-wrapper"
              data-cy="compensation-allowance-all-mobile-select-wrapper"
            >
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
                id="compensation-allowance-all-mobile-select"
                data-cy="compensation-allowance-all-mobile-select"
              />
            </div>

            {/* Button: 25% on mobile */}
            <div
              className="w-auto"
              id="compensation-allowance-all-button-wrapper"
              data-cy="compensation-allowance-all-button-wrapper"
            >
              <AccessGuard
                data-cy="compensation-allowance-all-create-button-access-guard"
                permissions={[Permissions.CreateAllowanceEntitlement]}
              >
                <Button
                  size="large"
                  type="primary"
                  className="h-10 w-10 sm:w-auto"
                  id="createNewClosedHolidayFieldId"
                  data-cy="compensation-allowance-all-create-button"
                  icon={<FaPlus data-cy="compensation-allowance-all-create-button-icon" />}
                  onClick={() => {}}
                  disabled
                >
                  <span
                    className="hidden sm:inline"
                    id="compensation-allowance-all-button-text"
                    data-cy="compensation-allowance-all-button-text"
                  >
                    Employees
                  </span>
                </Button>
              </AccessGuard>
            </div>
          </div>
        </div>
        <div
          className="w-full sm:block hidden mt-2"
          id="compensation-allowance-all-desktop-select-wrapper"
          data-cy="compensation-allowance-all-desktop-select-wrapper"
        >
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
            id="compensation-allowance-all-desktop-select"
            data-cy="compensation-allowance-all-desktop-select"
          />
        </div>
      </div>

      <div
        id="compensation-allowance-all-table-wrapper"
        data-cy="compensation-allowance-all-table-wrapper"
      >
        <AllAllowanceTable data-cy="compensation-allowance-all-table" searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default AllAllowancePage;
