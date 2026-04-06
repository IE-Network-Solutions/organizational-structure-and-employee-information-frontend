'use client';
import React, { useEffect } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import AllowanceEntitlementTable from './_components/allowanceEntitlementTable';
import { useParams } from 'next/navigation';
import { useFetchAllowance } from '@/store/server/features/compensation/allowance/queries';
import { useAllowanceEntitlementStore } from '@/store/uistate/features/compensation/allowance';
import { Button, Select } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

const SingleAllowancePage = () => {
  const { id } = useParams();
  const { data: allowanceData } = useFetchAllowance(id);
  const { setIsAllowanceGlobal } = useAllowanceEntitlementStore();
  const {
    setIsAllowanceEntitlementSidebarOpen,
    isAllowanceGlobal,
    setSearchQuery,
  } = useAllowanceEntitlementStore();
  const { data: employeeData } = useGetAllUsers();

  useEffect(() => {
    if (allowanceData?.applicableTo === 'GLOBAL') {
      setIsAllowanceGlobal(true);
    } else {
      setIsAllowanceGlobal(false);
    }
  }, [allowanceData, setIsAllowanceGlobal]);

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
      id="compensation-allowance-single-wrapper"
      data-cy="compensation-allowance-single-wrapper"
    >
      <div
        id="compensation-allowance-single-inner"
        data-cy="compensation-allowance-single-inner"
      >
        {/* PageHeader for mobile */}
        <div
          className="block sm:hidden mb-4"
          id="compensation-allowance-mobile-header-wrapper"
          data-cy="compensation-allowance-mobile-header-wrapper"
        >
          <PageHeader
            data-cy="compensation-allowance-single-page-header"
            title={
              allowanceData?.name
                ? allowanceData?.name.length > 15
                  ? allowanceData.name.slice(0, 15) + '...'
                  : allowanceData.name
                : ''
            }
            size="small"
            toolTip={allowanceData?.name}
            horizontalPadding="0px"
          />
        </div>

        {/* Main layout for larger screens */}
        <div
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
          id="compensation-allowance-desktop-header-section"
          data-cy="compensation-allowance-desktop-header-section"
        >
          <div
            className="hidden sm:block"
            id="compensation-allowance-desktop-header-wrapper"
            data-cy="compensation-allowance-desktop-header-wrapper"
          >
            <PageHeader
              data-cy="compensation-allowance-desktop-page-header"
              title={
                allowanceData?.name
                  ? allowanceData?.name.length > 15
                    ? allowanceData.name.slice(0, 15) + '...'
                    : allowanceData.name
                  : ''
              }
              size="small"
              toolTip={allowanceData?.name}
              horizontalPadding="0px"
            />
          </div>

          <div
            className="flex w-full sm:w-auto sm:flex-row sm:gap-4"
            id="compensation-allowance-actions-row"
            data-cy="compensation-allowance-actions-row"
          >
            <div
              className="w-10/12 mr-2 sm:hidden"
              id="compensation-allowance-mobile-search-wrapper"
              data-cy="compensation-allowance-mobile-search-wrapper"
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
                id="compensation-allowance-mobile-search-select"
                data-cy="compensation-allowance-mobile-search-select"
              />
            </div>

            {/* Button: 25% on mobile */}
            <div
              className="w-auto"
              id="compensation-allowance-create-button-wrapper"
              data-cy="compensation-allowance-create-button-wrapper"
            >
              <AccessGuard
                data-cy="compensation-allowance-create-button-access-guard"
                permissions={[Permissions.CreateAllowanceEntitlement]}
              >
                <Button
                  size="large"
                  type="primary"
                  className="h-10 w-10 sm:w-auto"
                  id="createNewClosedHolidayFieldId"
                  data-cy="compensation-allowance-create-button"
                  icon={<FaPlus />}
                  onClick={() => {
                    setIsAllowanceEntitlementSidebarOpen(true);
                  }}
                  disabled={isAllowanceGlobal}
                >
                  <span
                    className="hidden sm:inline"
                    id="compensation-allowance-create-button-text"
                    data-cy="compensation-allowance-create-button-text"
                  >
                    Employees
                  </span>
                </Button>
              </AccessGuard>
            </div>
          </div>
        </div>
        <div
          className="w-full hidden sm:block mt-2"
          id="compensation-allowance-desktop-search-wrapper"
          data-cy="compensation-allowance-desktop-search-wrapper"
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
            id="compensation-allowance-desktop-search-select"
            data-cy="compensation-allowance-desktop-search-select"
          />
        </div>
      </div>

      <div
        id="compensation-allowance-entitlement-table-wrapper"
        data-cy="compensation-allowance-entitlement-table-wrapper"
      >
        <AllowanceEntitlementTable data-cy="compensation-allowance-entitlement-table" />
      </div>
    </div>
  );
};

export default SingleAllowancePage;
