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
    <div className="bg-white rounded-lg px-1 py-4 sm:px-6 sm:mr-4">
      <div>
        {/* PageHeader for mobile */}
        <div className="block sm:hidden mb-4">
          <PageHeader
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="hidden sm:block">
            <PageHeader
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

          <div className="flex w-full sm:w-auto sm:flex-row sm:gap-4">
            <div className="w-10/12 mr-2 sm:hidden">
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
                  onClick={() => {
                    setIsAllowanceEntitlementSidebarOpen(true);
                  }}
                  disabled={isAllowanceGlobal}
                >
                  <span className="hidden sm:inline">Employees</span>
                </Button>
              </AccessGuard>
            </div>
          </div>
        </div>
        <div className="w-full hidden sm:block mt-2">
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
      </div>

      <div>
        <AllowanceEntitlementTable />
      </div>
    </div>
  );
};

export default SingleAllowancePage;
