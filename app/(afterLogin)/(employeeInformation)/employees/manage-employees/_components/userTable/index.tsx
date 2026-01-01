import React from 'react';
import {
  Table,
  TableColumnsType,
  Tooltip,
} from 'antd';
import { EmployeeData } from '@/types/dashboard/adminManagement';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { useEmployeeAllFilter } from '@/store/server/features/employees/employeeManagment/queries';
import userTypeButton from '../userTypeButton';
import Image from 'next/image';
import Avatar from '@/public/gender_neutral_avatar.jpg';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useRouter } from 'next/navigation';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';

const columns: TableColumnsType<EmployeeData> = [
  {
    title: 'Id',
    dataIndex: 'employee_attendance_id',
    sorter: (a, b) => {
      const idA = a.employee_attendance_id ?? 0;
      const idB = b.employee_attendance_id ?? 0;
      return idA - idB;
    },
    width: 70,
  },
  {
    title: 'Employee Name',
    dataIndex: 'employee_name',
    ellipsis: true,
    width: 150,
  },
  {
    title: 'Job Position',
    dataIndex: 'job_title',
    sorter: (a, b) => a.job_title.localeCompare(b.job_title),
  },
  {
    title: 'Department',
    dataIndex: 'department',
    sorter: (a, b) => a.department.localeCompare(b.department),
  },
  {
    title: 'Office',
    dataIndex: 'office',
    sorter: (a, b) => a.office.localeCompare(b.office),
  },
  {
    title: 'Employee Status',
    dataIndex: 'employee_status',
  },
  {
    title: 'Account',
    dataIndex: 'account',
  },
  {
    title: 'Role',
    dataIndex: 'role',
    sorter: (a, b) => a.role.localeCompare(b.role),
  },
];

const UserTable = () => {
  const {
    userCurrentPage,
    pageSize,
    setUserCurrentPage,
    setPageSize,
  } = useEmployeeManagementStore();
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

  const MAX_NAME_LENGTH = 10;
  const MAX_EMAIL_LENGTH = 5;
  const data = allFilterData?.items?.map((item: any) => {
    const fullName =
      item?.firstName +
      ' ' +
      (item?.middleName ? item?.middleName : '') +
      ' ' +
      item?.lastName;
    const shortEmail = item?.email;
    const displayName =
      fullName.length > MAX_NAME_LENGTH
        ? fullName.slice(0, MAX_NAME_LENGTH) + '...'
        : fullName;
    const displayEmail =
      shortEmail.length > MAX_EMAIL_LENGTH
        ? shortEmail.slice(0, MAX_EMAIL_LENGTH) + '...'
        : shortEmail;
    return {
      key: item?.id,
      employee_attendance_id: item?.employeeInformation?.employeeAttendanceId,
      employee_name: (
        <Tooltip
          title={
            <>
              {fullName}
              <br />
              {shortEmail}
            </>
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
              className="flex flex-wrap flex-col justify-center"
              id={`user-table-employee-info-${item?.id}`}
              data-cy={`user-table-employee-info-${item?.id}`}
            >
              <p
                id={`user-table-employee-display-name-${item?.id}`}
                data-cy={`user-table-employee-display-name-${item?.id}`}
              >
                {displayName}
              </p>
              <p
                className="font-extralight text-[12px]"
                id={`user-table-employee-display-email-${item?.id}`}
                data-cy={`user-table-employee-display-email-${item?.id}`}
              >
                {displayEmail}
              </p>
            </div>
          </div>
        </Tooltip>
      ),
      job_title: item?.employeeJobInformation[0]?.position?.name
        ? item?.employeeJobInformation[0]?.position?.name
        : '-',
      department: item?.employeeJobInformation[0]?.department?.name
        ? item?.employeeJobInformation[0]?.department?.name
        : '-',
      office: item?.employeeJobInformation[0]?.branch?.name
        ? item?.employeeJobInformation[0]?.branch?.name
        : '-',
      employee_status: userTypeButton(
        item?.employeeJobInformation[0]?.employementType?.name,
      ),
      account: (
        <span
          className="text-sm text-gray-900"
          id={`user-table-employee-account-${item?.id}`}
          data-cy={`user-table-employee-account-${item?.id}`}
        >
          {!item?.deletedAt ? 'Active' : 'InActive'}
        </span>
      ),
      role: item?.role?.name ? item?.role?.name : ' - ',
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
      <div id="user-table-wrapper" data-cy="user-table-wrapper">
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
