'use client';
import React from 'react';
import UserTable from './_components/userTable';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import EmployeeSearch from './_components/userSearch';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { SearchOutlined } from '@ant-design/icons';
import CustomBreadcrumb from '@/components/common/breadCramp';

import {
  Button,
  Popover,
  Input,
  Tag,
  Tooltip,
  Typography,
  Dropdown,
} from 'antd';
import {
  useEmployeeBranches,
  useEmployeeDepartments,
  useGetEmployeeStatus,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useGetEmployementTypes } from '@/store/server/features/employees/employeeManagment/employmentType/queries';
import { CiBookmark } from 'react-icons/ci';
import { TbLayoutList } from 'react-icons/tb';
import { useDownloadEmployeeDataByFilter } from '@/store/server/features/employees/employeeManagment/mutations';
import AddEmployeeModal from './_components/add-employee-modal';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import StatsCard from './_components/statsCard';
import GroupsIcon from '@mui/icons-material/Groups';
import BusinessIcon from '@mui/icons-material/Business';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useIsMobile } from '@/hooks/useIsMobile';

const ManageEmployees: React.FC<any> = () => {
  const {
    setOpen,
    setSearchParams,
    setIsMobileFilterVisible,
    isMobileFilterVisible,
    setIsEmployeeModalFromCandidateMove,
  } = useEmployeeManagementStore();
  const { searchParams } = useEmployeeManagementStore();
  const { mutate: downloadAllFilterData } = useDownloadEmployeeDataByFilter();
  const { data: EmployeeBranches } = useEmployeeBranches();
  const { data: EmployeeDepartment } = useEmployeeDepartments();
  const { data: EmploymentTypes } = useGetEmployementTypes();
  const { data: EmployeeStatus } = useGetEmployeeStatus();
  const { isMobile } = useIsMobile();
  const showDrawer = () => {
    setIsEmployeeModalFromCandidateMove(false);
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

  // Temporary defaults while subscription feature is disabled
  const isAvailableSlots = true;
  const isLoading = false;
  const subscriptionLoading = false;

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
    <div id="manage-employees-page" data-cy="manage-employees-page">
      <div
        className="flex flex-wrap justify-between items-center pt-4"
        id="manage-employees-header"
        data-cy="manage-employees-header"
      >
        <CustomBreadcrumb
          title={
            <Typography.Title className="text-xl font-bold text-black !mb-0">
              Employee Management
            </Typography.Title>
          }
          subtitle={
            <>
              <span
                className="text-xs sm:text-sm"
                data-cy="manage-employees-breadcrumb-employee"
              >
                Employee
              </span>
              <span data-cy="manage-employees-breadcrumb-separator"> / </span>
              <span
                className="text-xs sm:text-sm text-[#4d4d4d]"
                data-cy="manage-employees-breadcrumb-employee-management"
              >
                Employee Management
              </span>
            </>
          }
          titleExtra={
            <div
              className="flex flex-wrap justify-start items-center my-2 gap-3"
              id="manage-employees-actions"
              data-cy="manage-employees-actions"
            >
              <AccessGuard
                permissions={[Permissions.DownloadEmployeeDocument]}
                id="manage-employees-download-guard"
                data-cy="manage-employees-download-guard"
              >
                <Popover
                  placement="bottom"
                  trigger="click"
                  id="manage-employees-download-popover"
                  data-cy="manage-employees-download-popover"
                  content={
                    <div
                      className="flex flex-col items-center gap-4 min-w-[220px] p-2"
                      id="manage-employees-download-content"
                      data-cy="manage-employees-download-content"
                    >
                      <div
                        className="font-medium text-gray-700 mb-1"
                        id="manage-employees-download-title"
                        data-cy="manage-employees-download-title"
                      >
                        What file you want to export?
                      </div>
                      <div
                        className="flex gap-2 w-full"
                        id="manage-employees-download-buttons"
                        data-cy="manage-employees-download-buttons"
                      >
                        <Button
                          type="primary"
                          className="flex-1 !border-[#7C3AED] !text-white"
                          icon={<CiBookmark size={18} />}
                          onClick={() => {
                            handleDownloadUserData('excel');
                          }}
                          id="manage-employees-download-excel-btn"
                          data-cy="manage-employees-download-excel-btn"
                        >
                          Excel
                        </Button>
                        <Button
                          type="primary"
                          className="flex-1 !border-[#7C3AED] !text-white"
                          icon={<TbLayoutList size={18} />}
                          onClick={() => {
                            handleDownloadUserData('pdf');
                          }}
                          id="manage-employees-download-pdf-btn"
                          data-cy="manage-employees-download-pdf-btn"
                        >
                          PDF
                        </Button>
                      </div>
                    </div>
                  }
                >
                  <Button
                    type="default"
                    id="downloadUserButton"
                    data-cy="manage-employees-download-trigger-btn"
                    className="h-10 w-10 sm:w-auto border border-[#D9D9D9]"
                    icon={<SaveAltIcon fontSize="small" />}
                  >
                    <span
                      className="hidden sm:inline text-[#4d4d4d] text-base font-normal"
                      id="manage-employees-download-btn-text"
                      data-cy="manage-employees-download-btn-text"
                    >
                      Export
                    </span>
                  </Button>
                </Popover>
              </AccessGuard>
              <AccessGuard
                permissions={[Permissions.RegisterNewEmployee]}
                id="manage-employees-create-guard"
                data-cy="manage-employees-create-guard"
              >
                <Tooltip
                  title={
                    isAvailableSlots
                      ? null
                      : 'User limit reached. Purchase additional slots or contact support.'
                  }
                  id="manage-employees-create-tooltip"
                  data-cy="manage-employees-create-tooltip"
                >
                  <Button
                    type="primary"
                    size="large"
                    id="createUserButton"
                    data-cy="manage-employees-create-btn"
                    className="h-10 w-10 sm:w-auto"
                    icon={
                      <PersonAddOutlinedIcon
                        id="manage-employees-create-icon"
                        data-cy="manage-employees-create-icon"
                      />
                    }
                    onClick={showDrawer}
                    loading={isLoading || subscriptionLoading}
                    disabled={!isAvailableSlots}
                  >
                    <span
                      className="hidden sm:inline font-normal"
                      id="manage-employees-create-btn-text"
                      data-cy="manage-employees-create-btn-text"
                    >
                      Add Employee
                    </span>
                  </Button>
                </Tooltip>
              </AccessGuard>
              <AddEmployeeModal onClose={onClose} />
            </div>
          }
          data-cy="manage-employees-breadcrumb"
        />
      </div>
      <div className="mb-6 " data-cy="manage-employees-stats-section">
        <div
          className="flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-4"
          data-cy="manage-employees-stats-grid"
        >
          <div
            className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
            data-cy="stats-total-employees-wrapper"
          >
            <StatsCard
              icon={
                <span
                  className="w-8 h-8 rounded-sm bg-lightorange flex items-center justify-center"
                  data-cy="stats-total-employees-icon-wrap"
                >
                  <GroupsIcon className="text-orangebg" fontSize="small" />
                </span>
              }
              title="Total Employees"
              value={EmployeeStatus?.totalEmployees?.value || 0}
              change={EmployeeStatus?.totalEmployees?.changeSinceLastMonth || 0}
              id="stats-total-employees"
              data-cy="stats-total-employees"
            />
          </div>
          <div
            className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
            data-cy="stats-new-hires-wrapper"
          >
            <StatsCard
              icon={
                <span
                  className="w-8 h-8 rounded-sm bg-[#F6FFED] flex items-center justify-center"
                  data-cy="stats-new-hires-icon-wrap"
                >
                  <GroupAddIcon className="text-greenbg" fontSize="small" />
                </span>
              }
              title="New Hires This Month"
              value={EmployeeStatus?.newHires?.value || 0}
              change={EmployeeStatus?.newHires?.changeSinceLastMonth || 0}
              id="stats-new-hires"
              data-cy="stats-new-hires"
            />
          </div>
          <div
            className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
            data-cy="stats-active-departments-wrapper"
          >
            <StatsCard
              icon={
                <span
                  className="w-8 h-8 rounded-sm bg-lightblue flex items-center justify-center"
                  data-cy="stats-active-departments-icon-wrap"
                >
                  <BusinessIcon className="text-blue" fontSize="small" />
                </span>
              }
              title="Active Departments"
              value={EmployeeStatus?.activeDepartments?.value || 0}
              change={
                EmployeeStatus?.activeDepartments?.changeSinceLastMonth || 0
              }
              id="stats-active-departments"
              data-cy="stats-active-departments"
            />
          </div>
          <div
            className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
            data-cy="stats-active-accounts-wrapper"
          >
            <StatsCard
              icon={
                <span
                  className="w-8 h-8 rounded-sm bg-[#F6FFED] flex items-center justify-center"
                  data-cy="stats-active-accounts-icon-wrap"
                >
                  <HowToRegIcon className="text-greenbg" fontSize="small" />
                </span>
              }
              title="Active Accounts"
              value={100}
              change={3}
              id="stats-active-accounts"
              data-cy="stats-active-accounts"
            />
          </div>
        </div>
      </div>
      <div className="rounded-lg" data-cy="manage-employees-table-section">
        <div
          className="w-full h-auto"
          id="manage-employees-content"
          data-cy="manage-employees-content"
        >
          <div
            className="flex justify-between gap-4 mb-2 pt-3"
            id="manage-employees-filter-row"
            data-cy="manage-employees-filter-row"
          >
            <Input
              placeholder="Search employee"
              allowClear
              value={searchParams.employee_name}
              onChange={(e) => setSearchParams('employee_name', e.target.value)}
              className="w-[300px] pr-0 py-0 h-10 sm:h-8"
              data-cy="manage-employees-search-input"
              suffix={
                <div
                  className="text-gray-400 border-l border-gray-300 py-1 px-2"
                  data-cy="manage-employees-search-input"
                >
                  <SearchOutlined data-cy="manage-employees-search-icon" />
                </div>
              }
            />

            <div
              className="flex items-center gap-2 flex-wrap"
              id="manage-employees-active-filters"
              data-cy="manage-employees-active-filters"
            >
              {getActiveFilters().map((filter) => (
                <Tag
                  key={filter.key}
                  className="bg-white text-primary border-primary  rounded-md px-3 h-6  flex items-center text-xs font-normal"
                  id={`manage-employees-filter-tag-${filter.key}`}
                  data-cy={`manage-employees-filter-tag-${filter.key}`}
                >
                  <span
                    onClick={() => removeFilter(filter.key)}
                    className="text-primary hover:!text-[#FF8787] mr-2 text-lg"
                    id={`manage-employees-filter-tag-close-icon-${filter.key}`}
                    data-cy={`manage-employees-filter-tag-close-icon-${filter.key}`}
                  >
                    ×
                  </span>
                  {filter.label}
                </Tag>
              ))}
            </div>

            <Dropdown
              placement="bottomRight"
              trigger={['click']}
              open={isMobileFilterVisible}
              onOpenChange={(visible) => setIsMobileFilterVisible(visible)}
              dropdownRender={() => <EmployeeSearch />}
            >
              <Button
                type="default"
                id="manage-employees-filter-toggle-btn"
                data-cy="manage-employees-filter-toggle-btn"
                className="border border-[#D9D9D9] font-normal text-[#4d4d4d]"
                icon={<FilterAltOutlinedIcon className="py-1" />}
              >
                {!isMobile && 'Filter'}
              </Button>
            </Dropdown>
          </div>
          <div
            className="overflow-x-auto"
            data-cy="manage-employees-table-wrapper"
          >
            <UserTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageEmployees;
