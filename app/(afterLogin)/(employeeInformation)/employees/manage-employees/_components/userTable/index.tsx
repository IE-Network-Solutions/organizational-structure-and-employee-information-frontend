import React from 'react';
import { Table, TableColumnsType, Avatar as AntAvatar } from 'antd';
import { EmployeeData } from '@/types/dashboard/adminManagement';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useEmployeeAllFilter } from '@/store/server/features/employees/employeeManagment/queries';
import userTypeButton from '../userTypeButton';
import Image from 'next/image';
import { UserOutlined } from '@ant-design/icons';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useRouter } from 'next/navigation';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { TableSkeleton } from '@/components/tableSkeleton';

const tableClassName = 'text-[#4d4d4d] text-base font-bold';

const getBaseColumns = (isMobileView: boolean): TableColumnsType<EmployeeData> => [
  {
    title: (
      <span data-cy="user-table-id-span" className={tableClassName}>
        ID
      </span>
    ),
    dataIndex: 'employee_attendance_id',
    // sorter: (a, b) => {
    //   const idA = a.employee_attendance_id ?? 0;
    //   const idB = b.employee_attendance_id ?? 0;
    //   return idA - idB;
    // },
    width: isMobileView ? undefined : 70,
  },
  {
    title: (
      <span data-cy="user-table-employee-name-span" className={tableClassName}>
        Employee Name
      </span>
    ),
    dataIndex: 'employee_name',
    ellipsis: true,
    width: isMobileView ? undefined : 200,
  },
  {
    title: (
      <span data-cy="user-table-position-span" className={tableClassName}>
        Position
      </span>
    ),
    dataIndex: 'job_title',
    width: isMobileView ? undefined : 300,
    // sorter: (a, b) => a.job_title.localeCompare(b.job_title),
  },
  {
    title: (
      <span data-cy="user-table-department-span" className={tableClassName}>
        Department
      </span>
    ),
    dataIndex: 'department',
    width: isMobileView ? undefined : 250,
    // sorter: (a, b) => a.department.localeCompare(b.department),
  },

  {
    title: (
      <span data-cy="user-table-status-span" className={tableClassName}>
        Status
      </span>
    ),
    dataIndex: 'account',
    width: isMobileView ? undefined : 120,
  },
  {
    title: (
      <span data-cy="user-table-role-span" className={tableClassName}>
        Role
      </span>
    ),
    dataIndex: 'role',
    width: isMobileView ? undefined : 100,
    // sorter: (a, b) => a.role.localeCompare(b.role),
  },
];

const UserTable = () => {
  const { userCurrentPage, pageSize, setUserCurrentPage, setPageSize } =
    useEmployeeManagementStore();
  const { searchParams } = useEmployeeManagementStore();
  const { data: allFilterData, isLoading } = useEmployeeAllFilter(
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
    const displayName =
      fullName.length > MAX_NAME_LENGTH
        ? fullName.slice(0, MAX_NAME_LENGTH) + '...'
        : fullName;
    return {
      key: item?.id,
      employee_attendance_id: item?.employeeInformation?.employeeAttendanceId,
      employee_name: (
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
            {(() => {
              if (
                item?.profileImage &&
                typeof item?.profileImage === 'string'
              ) {
                try {
                  const parsed = JSON.parse(item.profileImage);
                  const url =
                    parsed.url && parsed.url.startsWith('http')
                      ? parsed.url
                      : null;

                  if (url) {
                    return (
                      <Image
                        src={url}
                        alt="Employee avatar"
                        layout="fill"
                        className="object-cover"
                        id={`user-table-employee-avatar-${item?.id}`}
                        data-cy={`user-table-employee-avatar-${item?.id}`}
                      />
                    );
                  }
                } catch {
                  if (item.profileImage.startsWith('http')) {
                    return (
                      <Image
                        src={item.profileImage}
                        alt="Employee avatar"
                        layout="fill"
                        className="object-cover"
                        id={`user-table-employee-avatar-${item?.id}`}
                        data-cy={`user-table-employee-avatar-${item?.id}`}
                      />
                    );
                  }
                }
              }

              // Fallback: Ant Design default avatar when no valid profile image
              return (
                <AntAvatar
                  size={24}
                  icon={<UserOutlined />}
                  className="w-6 h-6"
                  data-cy={`user-table-employee-avatar-${item?.id}`}
                />
              );
            })()}
          </div>
          <div
            className="flex flex-col justify-center"
            id={`user-table-employee-info-${item?.id}`}
            data-cy={`user-table-employee-info-${item?.id}`}
          >
            <span
              id={`user-table-employee-display-name-${item?.id}`}
              data-cy={`user-table-employee-display-name-${item?.id}`}
              className="text-[#4d4d4d] text-sm font-normal"
            >
              {displayName}
            </span>
          </div>
        </div>
      ),
      job_title: (
        <span
          data-cy="user-table-employee-job-title-span"
          className="text-[#4d4d4d] text-sm font-normal"
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
          className="text-[#4d4d4d] text-sm font-normal"
        >
          {' '}
          {item?.employeeJobInformation[0]?.department?.name
            ? item?.employeeJobInformation[0]?.department?.name
            : '-'}
        </span>
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
            className="text-[#4d4d4d] text-sm font-normal"
          >
            {item?.role?.name ? item?.role?.name : ' - '}
          </span>
        </div>
      ),
    };
  });

  const baseColumns = getBaseColumns(isMobile);
  const columns = isMobile
    ? baseColumns.filter(
        (col) => col.dataIndex !== 'account' && col.dataIndex !== 'job_title',
      )
    : baseColumns;

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
        {isLoading ? (
          <TableSkeleton columns={columns} />
        ) : (
          <Table
            className="w-full cursor-pointer"
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ x: isMobile ? 'max-content' : 1000 }}
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
            rowHoverable={false}
            rowClassName={(notUsed, index) =>
              index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
            }
          />
        )}
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
