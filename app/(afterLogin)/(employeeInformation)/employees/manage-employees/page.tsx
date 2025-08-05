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
import { Button, Popover } from 'antd';
import { BsFileEarmarkArrowDownFill } from 'react-icons/bs';
import { CiBookmark } from 'react-icons/ci';
import { TbLayoutList } from 'react-icons/tb';
import { useDownloadEmployeeDataByFilter } from '@/store/server/features/employees/employeeManagment/mutations';
const ManageEmployees: React.FC<any> = () => {
  const { setOpen } = useEmployeeManagementStore();
  const { searchParams } = useEmployeeManagementStore();
  const { mutate: downloadAllFilterData } = useDownloadEmployeeDataByFilter();
  // const { data: employeeStatus, isLoading } = useGetEmployeeStatus('');

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  // const tenantId = useAuthenticationStore.getState().tenantId;
  // const { data: subscriptionData, isLoading: subscriptionLoading } =
  //   useGetSubscriptions(
  //     {
  //       filter: {
  //         tenantId: [tenantId],
  //       },
  //     },
  //     true,
  //     true,
  //   );

  // const totalSlots =
  //   subscriptionData?.items?.find((sub: any) => sub.isActive)?.slotTotal || 0;
  // const allUsers =
  //   employeeStatus?.reduce((acc, status) => acc + Number(status.count), 0) || 0;
  // const isAvailableSlots = totalSlots >= allUsers;
  const handleDownloadUserData = (downloadFormat: string) => {
    // Convert searchParams to Record<string, string>
    const params: Record<string, string> = Object.fromEntries(
      Object.entries(searchParams).map(([k, v]) => [
        k,
        v == null ? '' : String(v),
      ]),
    );
    downloadAllFilterData({ downloadFormat, searchParams: params });
  };

  return (
    <div className="h-auto w-full px-3 sm:px-6">
      <BlockWrapper className="h-auto w-full bg-white">
        <div className="flex flex-wrap justify-between items-center">
          <CustomBreadcrumb
            title="Employees"
            subtitle="Manage your Employees"
          />
          <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
            <AccessGuard permissions={[Permissions.DownloadEmployeeDocument]}>
              <Popover
                placement="bottom"
                trigger="click"
                content={
                  <div className="flex flex-col items-center gap-4 min-w-[220px] p-2">
                    <div className="font-medium text-gray-700 mb-1">
                      What file you want to export?
                    </div>
                    <div className="flex gap-2 w-full">
                      <Button
                        type="primary"
                        size="large"
                        className="flex-1 !border-[#7C3AED] !text-white"
                        icon={<CiBookmark size={18} />}
                        onClick={() => {
                          handleDownloadUserData('excel');
                        }}
                      >
                        Excel
                      </Button>
                      <Button
                        type="primary"
                        size="large"
                        className="flex-1 !border-[#7C3AED] !text-white"
                        icon={<TbLayoutList size={18} />}
                        onClick={() => {
                          handleDownloadUserData('pdf');
                        }}
                      >
                        PDF
                      </Button>
                    </div>
                  </div>
                }
              >
                <Button
                  type="default"
                  size="large"
                  id="downloadUserButton"
                  className="h-10 w-10 sm:w-auto"
                  icon={<BsFileEarmarkArrowDownFill />}
                >
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </Popover>
            </AccessGuard>
            <AccessGuard permissions={[Permissions.RegisterNewEmployee]}>
              {/* <Tooltip
                title={
                  isAvailableSlots
                    ? null
                    : 'User limit reached. Purchase additional slots or contact support.'
                }
              > */}
              <Button
                type="primary"
                size="large"
                id="createUserButton"
                className="h-10 w-10 sm:w-auto"
                icon={<FaPlus />}
                onClick={showDrawer}
                // loading={isLoading}
                // disabled={!isAvailableSlots}
              >
                <span className="hidden sm:inline">Create user</span>
              </Button>
              {/* </Tooltip> */}
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
