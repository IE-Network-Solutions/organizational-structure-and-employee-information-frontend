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
import { Button, Tooltip } from 'antd';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetEmployeeStatus } from '@/store/server/features/dashboard/employee-status/queries';

const ManageEmployees: React.FC<any> = () => {
  const { setOpen } = useEmployeeManagementStore();
  const { data: employeeStatus, isLoading } = useGetEmployeeStatus("");

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const tenantId = useAuthenticationStore.getState().tenantId;
  const { data: subscriptionData, isLoading: subscriptionLoading } = useGetSubscriptions(
    {
      filter: {
        tenantId: [tenantId],
      },
    },
    true,
    true,
  );

  const totalSlots = subscriptionData?.items?.find((sub: any) => sub.isActive)?.slotTotal || 0;
  const allUsers = (employeeStatus?.reduce((acc, status) => acc + Number(status.count), 0) || 0);
  const isAvailableSlots = totalSlots >= allUsers;
  console.log({ totalSlots, allUsers, isAvailableSlots, subscriptionData }, "availableSlots");
  return (
    <div className="h-auto w-full px-3 sm:px-6">
      <BlockWrapper className="h-auto w-full bg-white">
        <div className="flex flex-wrap justify-between items-center">
          <CustomBreadcrumb
            title="Employees"
            subtitle="Manage your Employees"
          />
          <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
            <AccessGuard permissions={[Permissions.RegisterNewEmployee]}>
              <Tooltip title={isAvailableSlots ? null : "User limit reached. Purchase additional slots or contact support."}>
                <Button
                  type="primary"
                  size="large"
                  id="createUserButton"
                  className="h-10 w-10 sm:w-auto"
                  icon={<FaPlus />}
                  onClick={showDrawer}
                  loading={isLoading || subscriptionLoading}
                  disabled={!isAvailableSlots}
                >
                  <span className="hidden sm:inline">Create user</span>
                </Button>
              </Tooltip>

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
