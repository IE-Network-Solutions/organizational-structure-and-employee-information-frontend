'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import React from 'react';
import UserSidebar from './_components/userSidebar';
import { FaPlus } from 'react-icons/fa';
import UserTable from './_components/userTable';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import EmployeeSearch from './_components/userSearch';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const ManageEmployees: React.FC<any> = () => {
  const { setOpen } = useEmployeeManagementStore();

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  return (
    <div className="h-auto w-full p-4">
      <BlockWrapper>
        <div className="flex flex-wrap justify-between items-center">
          <CustomBreadcrumb
            title="Employees"
            subtitle="Manage your Employees"
          />
          <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
              <CustomButton
                title="Create user"
                id="createUserButton"
                icon={<FaPlus className="mr-2" />}
                onClick={showDrawer}
                className="bg-blue-600 hover:bg-blue-700"
              />
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
