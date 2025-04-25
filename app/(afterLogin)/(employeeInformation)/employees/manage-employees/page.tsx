'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import React from 'react';
import UserSidebar from './_components/userSidebar';
import { FaPlus } from 'react-icons/fa';
import UserTable from './_components/userTable';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import EmployeeSearch from './_components/userSearch';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { Button } from 'antd';

const ManageEmployees: React.FC<any> = () => {
  const { setOpen } = useEmployeeManagementStore();

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  return (
    <div className="h-auto w-full">
      <BlockWrapper>
        <div className="flex flex-wrap justify-between items-center">
          <CustomBreadcrumb
            title="Employees"
            subtitle="Manage your Employees"
          />
          <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
            <AccessGuard permissions={[Permissions.RegisterNewEmployee]}>
              <Button
                type="primary"
                size="large"
                id="createUserButton"
                icon={<FaPlus />}
                onClick={showDrawer}
              >
                <span className="hidden sm:inline">Create user</span>
              </Button>
            </AccessGuard>
            <UserSidebar onClose={onClose} />
          </div>
        </div>
        <div className="w-full h-auto">
          <EmployeeSearch />
          <UserTable />
        </div>
      </BlockWrapper>
    </div>
  );
};

export default ManageEmployees;