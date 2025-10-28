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
import { Button, Tooltip, Popover, Input, Tag } from 'antd';
import { IoMdSwitch } from 'react-icons/io';
import { useGetSubscriptions } from '@/store/server/features/tenant-management/subscriptions/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetEmployeeStatus } from '@/store/server/features/dashboard/employee-status/queries';
import {
  useEmployeeBranches,
  useEmployeeDepartments,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useGetEmployementTypes } from '@/store/server/features/employees/employeeManagment/employmentType/queries';
import { BsFileEarmarkArrowDownFill } from 'react-icons/bs';
import { CiBookmark } from 'react-icons/ci';
import { TbLayoutList } from 'react-icons/tb';
import { useDownloadEmployeeDataByFilter } from '@/store/server/features/employees/employeeManagment/mutations';
const ManageEmployees: React.FC<any> = () => {
  const { setOpen, setSearchParams, setIsMobileFilterVisible } =
    useEmployeeManagementStore();
  const { searchParams } = useEmployeeManagementStore();
  const { mutate: downloadAllFilterData } = useDownloadEmployeeDataByFilter();
  const { data: employeeStatus, isLoading } = useGetEmployeeStatus('');
  const { data: EmployeeBranches } = useEmployeeBranches();
  const { data: EmployeeDepartment } = useEmployeeDepartments();
  const { data: EmploymentTypes } = useGetEmployementTypes();

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const tenantId = useAuthenticationStore.getState().tenantId;
  const { data: subscriptionData, isLoading: subscriptionLoading } =
    useGetSubscriptions(
      {
        filter: {
          tenantId: [tenantId],
        },
      },
      true,
      true,
    );

  const totalSlots =
    subscriptionData?.items?.find((sub: any) => sub.isActive)?.slotTotal || 0;
  const allUsers =
    employeeStatus?.reduce((acc, status) => acc + Number(status.count), 0) || 0;
  const isAvailableSlots = totalSlots >= allUsers;
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

  // Function to get display name for filter values
  const getFilterDisplayName = (key: string, value: string) => {
    switch (key) {
      case 'allOffices':
        const office = EmployeeBranches?.items?.find(
          (item: any) => item.id === value,
        );
        return office?.name || value;
      case 'allJobs':
        const department = EmployeeDepartment?.find(
          (item: any) => item.id === value,
        );
        return department?.name || value;
      case 'gender':
        return value.charAt(0).toUpperCase() + value.slice(1);
      case 'employmentType':
        const employmentType = EmploymentTypes?.items?.find(
          (item: any) => item.id === value,
        );
        return employmentType?.name || value;
      case 'allStatus':
        return value === 'null' ? 'Active' : 'Inactive';
      case 'joinedDate':
        return new Date(value).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      default:
        return value;
    }
  };

  // Function to remove a filter
  const removeFilter = (key: string) => {
    setSearchParams(key as keyof typeof searchParams, '');
  };

  // Get active filters
  const getActiveFilters = () => {
    const activeFilters = [];

    if (searchParams.allOffices) {
      activeFilters.push({
        key: 'allOffices',
        label: getFilterDisplayName('allOffices', searchParams.allOffices),
      });
    }

    if (searchParams.allJobs) {
      activeFilters.push({
        key: 'allJobs',
        label: getFilterDisplayName('allJobs', searchParams.allJobs),
      });
    }

    if (searchParams.gender) {
      activeFilters.push({
        key: 'gender',
        label: getFilterDisplayName('gender', searchParams.gender),
      });
    }

    if (searchParams.employmentType) {
      activeFilters.push({
        key: 'employmentType',
        label: getFilterDisplayName(
          'employmentType',
          searchParams.employmentType,
        ),
      });
    }

    if (searchParams.allStatus) {
      activeFilters.push({
        key: 'allStatus',
        label: getFilterDisplayName('allStatus', searchParams.allStatus),
      });
    }

    if (searchParams.joinedDate) {
      activeFilters.push({
        key: 'joinedDate',
        label: getFilterDisplayName('joinedDate', searchParams.joinedDate),
      });
    }

    return activeFilters;
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
              <Tooltip
                title={
                  isAvailableSlots
                    ? null
                    : 'User limit reached. Purchase additional slots or contact support.'
                }
              >
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
          <div className="flex items-center gap-4 mb-6">
            <Input
              placeholder="Search employee"
              className="flex-1 h-12 rounded-lg border-gray-200"
              allowClear
              onChange={(e) => setSearchParams('employee_name', e.target.value)}
              value={searchParams.employee_name}
            />

            <div className="flex items-center gap-2 flex-wrap bg-blue-600">
              {getActiveFilters().map((filter) => (
                <Tag
                  key={filter.key}
                  closable
                  onClose={() => removeFilter(filter.key)}
                  className="bg-white text-blue border-blue  rounded-lg px-3 py-1 flex items-center text-sm font-medium"
                  closeIcon={
                    <span className="text-blue hover:!text-[#FF8787] ml-2 text-base">
                      ×
                    </span>
                  }
                >
                  {filter.label}
                </Tag>
              ))}
            </div>

            <Button
              type="primary"
              size="large"
              className="h-12 w-12 sm:w-auto px-0 sm:px-6 rounded-lg bg-blue-600 border-blue-600 flex items-center justify-center gap-2"
              onClick={() => setIsMobileFilterVisible(true)}
              aria-label="Open filters"
            >
              <IoMdSwitch />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
          <UserTable />
        </div>
        <EmployeeSearch />
      </BlockWrapper>
    </div>
  );
};

export default ManageEmployees;
