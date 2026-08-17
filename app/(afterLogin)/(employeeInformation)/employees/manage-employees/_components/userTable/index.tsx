import React, { useMemo } from 'react';
import { Table, TableColumnsType, Avatar as AntAvatar, Empty, Tag } from 'antd';
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
import { DEMO_LOGGED_IN_EMPLOYEE_ID } from '@/types/timesheet/workSchedule';
import { MOCK_EMPLOYEES } from '@/store/server/features/timesheet/workSchedule/mockData';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/mockService';

const MOCK_DEMO_EMPLOYEE =
  MOCK_EMPLOYEES.find((item) => item.id === DEMO_LOGGED_IN_EMPLOYEE_ID) ??
  MOCK_EMPLOYEES[0];

const MOCK_EMPLOYEE_ROUTE_KEY = 'mock-demo';

const tableClassName = 'text-[#4d4d4d] text-base font-bold';

const getBaseColumns = (
  isMobileView: boolean,
): TableColumnsType<Record<string, unknown>> => [
  {
    title: (
      <span data-cy="user-table-id-span" className={tableClassName}>
        ID
      </span>
    ),
    dataIndex: 'employee_attendance_id',
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
  },
  {
    title: (
      <span data-cy="user-table-department-span" className={tableClassName}>
        Department
      </span>
    ),
    dataIndex: 'department',
    width: isMobileView ? undefined : 250,
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
  },
];

const UserTable = () => {
  const { userCurrentPage, pageSize, setUserCurrentPage, setPageSize } =
    useEmployeeManagementStore();
  const { searchParams } = useEmployeeManagementStore();
  const {
    data: allFilterData,
    isLoading,
    isFetching,
    isError,
  } = useEmployeeAllFilter(
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

  const mockEmployeeName = getEmployeeDisplayName(MOCK_DEMO_EMPLOYEE);
  const matchesMockSearch =
    !searchParams.employee_name ||
    mockEmployeeName
      .toLowerCase()
      .includes(searchParams.employee_name.toLowerCase());

  const mockRow = useMemo(() => {
    if (!matchesMockSearch) return null;
    return {
      key: MOCK_EMPLOYEE_ROUTE_KEY,
      isMock: true,
      employee_attendance_id: 'M-001',
      employee_name: (
        <div
          className="flex items-center flex-wrap sm:flex-row justify-start gap-2"
          id="user-table-employee-name-mock-demo"
          data-cy="user-table-employee-name-mock-demo"
        >
          <div
            className="relative w-6 h-6 rounded-full overflow-hidden"
            id="user-table-employee-avatar-wrapper-mock-demo"
            data-cy="user-table-employee-avatar-wrapper-mock-demo"
          >
            <AntAvatar
              size={24}
              icon={<UserOutlined />}
              className="w-6 h-6"
              data-cy="user-table-employee-avatar-mock-demo"
            />
          </div>
          <div
            className="flex items-center gap-2"
            id="user-table-employee-info-mock-demo"
            data-cy="user-table-employee-info-mock-demo"
          >
            <span
              id="user-table-employee-display-name-mock-demo"
              data-cy="user-table-employee-display-name-mock-demo"
              className="text-[#4d4d4d] text-sm font-normal"
            >
              {mockEmployeeName}
            </span>
            <Tag color="blue" className="!m-0 !text-[10px] !leading-4 !px-1.5">
              Mock
            </Tag>
          </div>
        </div>
      ),
      job_title: (
        <span
          data-cy="user-table-employee-job-title-span"
          className="text-[#4d4d4d] text-sm font-normal"
        >
          {MOCK_DEMO_EMPLOYEE.jobTitle}
        </span>
      ),
      department: (
        <span
          data-cy="user-table-employee-department-span"
          className="text-[#4d4d4d] text-sm font-normal"
        >
          Operations
        </span>
      ),
      account: (
        <div data-cy="user-table-employee-account-div" className="pr-2">
          {userTypeButton('Active')}
        </div>
      ),
      role: (
        <div data-cy="user-table-employee-role-div" className="pr-2">
          <span
            data-cy="user-table-employee-role-span"
            className="text-[#4d4d4d] text-sm font-normal"
          >
            Employee
          </span>
        </div>
      ),
    };
  }, [matchesMockSearch, mockEmployeeName]);

  const data = useMemo(() => {
    const items = allFilterData?.items ?? [];
    const rows = items.map((item: any) => {
      const first = item?.firstName ?? '';
      const middle = item?.middleName ?? '';
      const fullName = `${first} ${middle}`.trim() || '—';
      const displayName =
        fullName.length > MAX_NAME_LENGTH
          ? fullName.slice(0, MAX_NAME_LENGTH) + '...'
          : fullName;
      return {
        key: item?.id,
        isMock: false,
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
                          unoptimized
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
                          unoptimized
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
            {item?.employeeJobInformation?.[0]?.position?.name
              ? item?.employeeJobInformation?.[0]?.position?.name
              : '-'}
          </span>
        ),
        department: (
          <span
            data-cy="user-table-employee-department-span"
            className="text-[#4d4d4d] text-sm font-normal"
          >
            {' '}
            {item?.employeeJobInformation?.[0]?.department?.name
              ? item?.employeeJobInformation?.[0]?.department?.name
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

    if (userCurrentPage === 1 && mockRow) {
      return [mockRow, ...rows];
    }
    return rows;
  }, [allFilterData?.items, mockRow, userCurrentPage]);

  const baseColumns = getBaseColumns(isMobile);
  const columns = isMobile
    ? baseColumns.filter((col) => {
        if (!('dataIndex' in col)) return true;
        return col.dataIndex !== 'account' && col.dataIndex !== 'job_title';
      })
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
        {isLoading || (isFetching && !allFilterData) ? (
          <TableSkeleton columns={columns} />
        ) : isError && !mockRow ? (
          <div
            className="py-8 text-center text-[#4d4d4d]"
            data-cy="user-table-error"
          >
            Could not load employees. Check that the API is running and try
            again.
          </div>
        ) : !data?.length ? (
          <div className="py-12" data-cy="user-table-empty">
            <Empty description="No employees found" />
          </div>
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
                      if (record?.isMock) {
                        router.push('manage-employees/mock-demo');
                        return;
                      }
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
            totalResults={
              (allFilterData?.meta?.totalItems ?? 0) + (mockRow ? 1 : 0)
            }
            pageSize={pageSize}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
            data-cy="user-table-mobile-pagination"
          />
        ) : (
          <CustomPagination
            current={userCurrentPage}
            total={(allFilterData?.meta?.totalItems ?? 0) + (mockRow ? 1 : 0)}
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
