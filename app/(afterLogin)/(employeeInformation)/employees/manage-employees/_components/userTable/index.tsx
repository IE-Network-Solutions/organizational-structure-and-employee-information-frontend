import React from 'react';
import { Table, TableColumnsType, Tooltip } from 'antd';
import { EmployeeData } from '@/types/dashboard/adminManagement';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useEmployeeAllFilter } from '@/store/server/features/employees/employeeManagment/queries';
import userTypeButton from '../userTypeButton';
import Image from 'next/image';
const Avatar = '/gender_neutral_avatar.jpg';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useRouter } from 'next/navigation';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

const columns: TableColumnsType<EmployeeData> = [
  {
    title: 'ID',
    dataIndex: 'employee_attendance_id',
    // sorter: (a, b) => {
    //   const idA = a.employee_attendance_id ?? 0;
    //   const idB = b.employee_attendance_id ?? 0;
    //   return idA - idB;
    // },
    width: 70,
  },
  {
    title: 'Employee Name',
    dataIndex: 'employee_name',
    ellipsis: true,
    width: 200,
  },
  {
    title: 'Position',
    dataIndex: 'job_title',
    width: 260,
    // sorter: (a, b) => a.job_title.localeCompare(b.job_title),
  },
  {
    title: 'Department',
    dataIndex: 'department',
    width: 250,
    // sorter: (a, b) => a.department.localeCompare(b.department),
  },

  {
    title: 'Type',
    dataIndex: 'employee_status',
    width: 120,
  },
  {
    title: 'Status',
    dataIndex: 'account',
    width: 120,
  },
  {
    title: 'Role',
    dataIndex: 'role',
    width: 120,
    // sorter: (a, b) => a.role.localeCompare(b.role),
  },
];

const UserTable = () => {
  const { userCurrentPage, pageSize, setUserCurrentPage, setPageSize } =
    useEmployeeManagementStore();
  const { searchParams } = useEmployeeManagementStore();
  const { data: allFilterData } = useEmployeeAllFilter(
    pageSize,
    userCurrentPage,
    searchParams.allOffices ? searchParams.allOffices : '',
    searchParams.allJobs ? searchParams.allJobs : '',
    searchParams.employee_name,
    searchParams.allStatus ? searchParams.allStatus : '',
    searchParams.gender ? searchParams.gender : '',
    searchParams.employmentType ? searchParams.employmentType : '',
    searchParams.joinedDate ? searchParams.joinedDate : '',
    searchParams.joinedDateType || 'after',
  );
  const router = useRouter();
  const { isMobile, isTablet } = useIsMobile();

  const hasAccess = AccessGuard.checkAccess({
    permissions: [Permissions.ViewEmployeeDetail],
  });

  const MAX_NAME_LENGTH = 20;
  const data = allFilterData?.items?.map((item: any) => {
    const fullName =
      item?.firstName + ' ' + (item?.middleName ? item?.middleName : '');
    const shortEmail = item?.email;
    const displayName =
      fullName.length > MAX_NAME_LENGTH
        ? fullName.slice(0, MAX_NAME_LENGTH) + '...'
        : fullName;
    return {
      key: item?.id,
      employee_attendance_id: item?.employeeInformation?.employeeAttendanceId,
      employee_name: (
        <Tooltip
          title={
            <div data-cy={`user-table-employee-tooltip-content-${item?.id}`}>
              <span data-cy={`user-table-employee-tooltip-name-${item?.id}`}>
                {fullName}
              </span>
              <br data-cy={`user-table-employee-tooltip-break-${item?.id}`} />
              <span data-cy={`user-table-employee-tooltip-email-${item?.id}`}>
                {shortEmail}
              </span>
            </div>
          }
          id={`user-table-employee-tooltip-${item?.id}`}
          data-cy={`user-table-employee-tooltip-${item?.id}`}
        >
          <div
            className="flex items-center flex-wrap sm:flex-row justify-start gap-2"
            id={`user-table-employee-name-${item?.id}`}
            data-cy={`user-table-employee-name-${item?.id}`}
          >
            <div
              className="relative w-6 h-6 rounded-full overflow-hidden"
              id={`user-table-employee-avatar-wrapper-${item?.id}`}
              data-cy={`user-table-employee-avatar-wrapper-${item?.id}`}
            >
              <Image
                src={
                  item?.profileImage && typeof item?.profileImage === 'string'
                    ? (() => {
                        try {
                          const parsed = JSON.parse(item.profileImage);
                          return parsed.url && parsed.url.startsWith('http')
                            ? parsed.url
                            : Avatar;
                        } catch {
                          return item.profileImage.startsWith('http')
                            ? item.profileImage
                            : Avatar;
                        }
                      })()
                    : Avatar
                }
                alt="Description of image"
                layout="fill"
                className="object-cover"
                id={`user-table-employee-avatar-${item?.id}`}
                data-cy={`user-table-employee-avatar-${item?.id}`}
              />
            </div>
            <div
              className="flex flex-col justify-center"
              id={`user-table-employee-info-${item?.id}`}
              data-cy={`user-table-employee-info-${item?.id}`}
            >
              <p
                id={`user-table-employee-display-name-${item?.id}`}
                data-cy={`user-table-employee-display-name-${item?.id}`}
              >
                {displayName}
              </p>
            </div>
          </div>
        </Tooltip>
      ),
      job_title: (
        <span
          data-cy="user-table-employee-job-title-span"
          className="text-black text-xs font-medium"
        >
          {' '}
          {item?.employeeJobInformation[0]?.position?.name
            ? item?.employeeJobInformation[0]?.position?.name
            : '-'}
        </span>
      ),
      department: (
        <span
          data-cy="user-table-employee-department-span"
          className="text-black text-xs font-medium"
        >
          {' '}
          {item?.employeeJobInformation[0]?.department?.name
            ? item?.employeeJobInformation[0]?.department?.name
            : '-'}
        </span>
      ),
      employee_status: (
        <div data-cy="user-table-employee-status-div" className="pr-2">
          {userTypeButton(
            item?.employeeJobInformation[0]?.employementType?.name,
          )}
        </div>
      ),
      account: (
        <div data-cy="user-table-employee-account-div" className="pr-2">
          {userTypeButton(!item?.deletedAt ? 'Active' : 'InActive')}
        </div>
      ),
      role: (
        <div data-cy="user-table-employee-role-div" className="pr-2">
          <span
            data-cy="user-table-employee-role-span"
            className="text-black text-xs font-medium"
          >
            {item?.role?.name ? item?.role?.name : ' - '}
          </span>
        </div>
      ),
    };
  });

  const onPageChange = (page: number, pageSize?: number) => {
    setUserCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  return (
    <div
      className="mt-2"
      id="user-table-container"
      data-cy="user-table-container"
    >
      <div
        id="user-table-wrapper"
        data-cy="user-table-wrapper"
        className="user-table-wrapper"
      >
        <Table
          className="w-full cursor-pointer"
          columns={columns}
          dataSource={data}
          pagination={false}
          scroll={{ x: 1000 }}
          id="user-table"
          data-cy="user-table"
          onRow={
            hasAccess
              ? (record) => ({
                  onClick: () => {
                    router.push(`manage-employees/${record?.key}`);
                  },
                })
              : undefined
          }
        />
        {isMobile || isTablet ? (
          <CustomMobilePagination
            totalResults={allFilterData?.meta?.totalItems ?? 0}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
            data-cy="user-table-mobile-pagination"
          />
        ) : (
          <CustomPagination
            current={userCurrentPage}
            total={allFilterData?.meta?.totalItems ?? 0}
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={(pageSize) => {
              setPageSize(pageSize);
              setUserCurrentPage(1);
            }}
            data-cy="user-table-pagination"
          />
        )}
      </div>
    </div>
  );
};
export default UserTable;
