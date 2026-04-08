import React, { useState } from 'react';
import {
  Table,
  Select,
  Pagination,
  Avatar,
  Tag,
  DatePicker,
  Modal,
} from 'antd';
import { useRouter } from 'next/navigation';
import { useGetAdminAttendanceUsers } from '@/store/server/features/timesheet/dashboard/queries';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import { useGetEmployees } from '@/store/server/features/employees/employeeManagment/queries';
import CustomButton from '@/components/common/buttons/customButton';
import { TableSkeleton } from '@/components/tableSkeleton';
import { LuSettings2 } from 'react-icons/lu';

const { RangePicker } = DatePicker;

interface Employee {
  userId: string;
  key: string;
  name: string;
  profileImage: string;
  department: string;
  status: 'late' | 'active' | 'absent' | 'onleave';
  currentStatus: 'late' | 'active' | 'absent' | 'onleave';
  absentDays: number;
  lateDays: number;
  totalLateRecords: number;
}

const statusColors = {
  late: 'bg-yellow-100 text-yellow-600',
  active: 'bg-green-100 text-green-600',
  absent: 'bg-red-100 text-red-600',
  onleave: 'bg-light_purple text-purple',
};

export default function EmployeeAttendanceTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const {
    searchOnAttendance,
    setsearchOnAttendance,
    currentStatusOnAttendance,
    setCurrentStatusOnAttendance,
    startDateOnAttendance,
    setStartDateOnAttendance,
    endDateOnAttendance,
    setEndDateOnAttendance,
    pageSizeOnAttendance,
    currentPageOnAttendance,
    setCurrentPageOnAttendance,
  } = TimeAndAttendaceDashboardStore();

  const { data: adminAttendanceUsers, isLoading: loading } =
    useGetAdminAttendanceUsers({
      sortBy: 'name',
      sortOrder: 'asc',
      userId: searchOnAttendance,
      ...(currentStatusOnAttendance && {
        currentStatus: currentStatusOnAttendance,
      }),
      startDate: startDateOnAttendance,
      endDate: endDateOnAttendance,
      page: currentPageOnAttendance,
      limit: pageSizeOnAttendance,
    });

  const { data: employees } = useGetEmployees();
  const employeeOptions = employees?.items?.map((i: any) => ({
    value: i.id,
    label: `${i?.firstName} ${i?.middleName} ${i?.lastName}`,
  }));

  // Attendance type options
  const attendanceTypeOptions = [
    { value: 'active', label: 'Active' },
    { value: 'late', label: 'Late' },
    { value: 'absent', label: 'Absent' },
    { value: 'onleave', label: 'On Leave' },
  ];

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Employee, b: Employee) => a?.name?.localeCompare(b?.name),
      render: (notused: any, record?: Employee) => (
        <div
          className="flex items-center space-x-3"
          id={`time-attendance-employee-attendance-row-${record?.userId ?? 'unknown'}-profile-div`}
          data-cy={`time-attendance-employee-attendance-row-${record?.userId ?? 'unknown'}-profile-div`}
        >
          {record?.profileImage ? (
            <Avatar
              src={record?.profileImage}
              data-cy={`time-attendance-employee-attendance-row-${record?.userId ?? 'unknown'}-avatar-image`}
            />
          ) : (
            <Avatar
              data-cy={`time-attendance-employee-attendance-row-${record?.userId ?? 'unknown'}-avatar-fallback`}
            >
              {record?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          )}
          <span
            id={`time-attendance-employee-attendance-row-${record?.userId ?? 'unknown'}-name-text`}
            data-cy={`time-attendance-employee-attendance-row-${record?.userId ?? 'unknown'}-name-text`}
          >
            {record?.name}
          </span>
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      sorter: (a: Employee, b: Employee) =>
        a?.department?.localeCompare(b?.department),
    },
    {
      title: 'Status',
      dataIndex: 'currentStatus',
      key: 'currentStatus',
      sorter: (a: Employee, b: Employee) => a?.status?.localeCompare(b?.status),
      render: (status: Employee['status']) => (
        <Tag
          className={`capitalize px-3 font-semibold rounded-md border-none ${statusColors[status]}`}
          id={`time-attendance-employee-attendance-status-${status}-tag`}
          data-cy={`time-attendance-employee-attendance-status-${status}-tag`}
        >
          {status === 'onleave' ? 'On Leave' : status}
        </Tag>
      ),
    },
    {
      title: 'Absentisms',
      dataIndex: 'absentDays',
      key: 'absentDays',
      sorter: (a: Employee, b: Employee) => a?.absentDays - b?.absentDays,
      render: (days: number) => `${days} days`,
    },
    {
      title: 'Late Arrivals',
      dataIndex: 'totalLateRecords',
      key: 'totalLateRecords',
      sorter: (a: Employee, b: Employee) => a?.lateDays - b?.lateDays,
      render: (days: number) => `${days} days`,
    },
  ];

  const MobileFilterContent = () => (
    <div
      className="flex flex-col gap-4"
      data-cy="time-attendance-employee-attendance-mobile-filter-content-div"
    >
      <h3
        className="text-lg font-medium mb-2"
        data-cy="time-attendance-employee-attendance-mobile-filter-title-h3"
      >
        Filter
      </h3>

      {/* Attendance Type */}
      <div
        className="flex flex-col gap-2"
        data-cy="time-attendance-employee-attendance-mobile-filter-status-div"
      >
        <label
          className="text-sm text-gray-600"
          data-cy="time-attendance-employee-attendance-mobile-filter-status-label"
        >
          Status
        </label>
        <Select
          showSearch
          placeholder="Select Status"
          allowClear
          value={currentStatusOnAttendance}
          className="w-full h-12"
          onChange={(value) => setCurrentStatusOnAttendance(value)}
          filterOption={(input: any, option: any) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={attendanceTypeOptions}
          id="time-attendance-employee-attendance-status-select"
          data-cy="time-attendance-employee-attendance-status-select"
        />
      </div>

      {/* Date Range */}
      <div
        className="flex flex-col gap-2"
        data-cy="time-attendance-employee-attendance-mobile-filter-date-range-div"
      >
        <label
          className="text-sm text-gray-600"
          data-cy="time-attendance-employee-attendance-mobile-filter-date-range-label"
        >
          Date Range
        </label>
        <RangePicker
          allowClear
          className="w-full h-12"
          onChange={(dates) => {
            if (dates) {
              setStartDateOnAttendance(dates[0]?.format('YYYY-MM-DD') || '');
              setEndDateOnAttendance(dates[1]?.format('YYYY-MM-DD') || '');
            } else {
              setStartDateOnAttendance('');
              setEndDateOnAttendance('');
            }
          }}
          id="time-attendance-employee-attendance-date-range-picker"
          data-cy="time-attendance-employee-attendance-date-range-picker"
        />
      </div>
    </div>
  );

  // Mobile Employee Card Component
  const MobileEmployeeCard = ({ employee }: { employee: any }) => (
    <div
      className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
      onClick={() => {
        router.push(
          `/timesheet/dashboard?employeeAttendance&user=${employee.userId}`,
        );
      }}
      data-cy={`time-attendance-employee-attendance-mobile-card-${employee.userId}`}
    >
      <div
        className="flex items-center justify-between mb-3"
        data-cy={`time-attendance-employee-attendance-mobile-card-${employee.userId}-header-div`}
      >
        <div
          className="flex items-center gap-3"
          data-cy={`time-attendance-employee-attendance-mobile-card-${employee.userId}-profile-div`}
        >
          {employee?.profileImage ? (
            <Avatar
              src={employee?.profileImage}
              className="flex-shrink-0"
              data-cy={`time-attendance-employee-attendance-mobile-card-${employee.userId}-avatar-image`}
            />
          ) : (
            <Avatar
              className="flex-shrink-0"
              data-cy={`time-attendance-employee-attendance-mobile-card-${employee.userId}-avatar-fallback`}
            >
              {employee?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          )}
          <div
            className="min-w-0 flex-1"
            data-cy={`time-attendance-employee-attendance-mobile-card-${employee.userId}-info-div`}
          >
            <p
              className="font-medium text-sm text-black truncate"
              data-cy={`time-attendance-employee-attendance-mobile-card-${employee.userId}-name-text`}
            >
              {employee?.name}
            </p>
            <p
              className="text-xs text-gray-600 truncate"
              data-cy={`time-attendance-employee-attendance-mobile-card-${employee.userId}-department-text`}
            >
              {employee?.department}
            </p>
          </div>
        </div>
        <Tag
          className={`capitalize px-2 py-1 font-medium rounded-md border-none text-xs ${statusColors[employee?.currentStatus as keyof typeof statusColors]}`}
          data-cy={`time-attendance-employee-attendance-mobile-card-${employee.userId}-status-tag`}
        >
          {employee?.currentStatus === 'onleave'
            ? 'On Leave'
            : employee?.currentStatus}
        </Tag>
      </div>

      <div
        className="flex justify-between text-xs text-gray-600"
        data-cy={`time-attendance-employee-attendance-mobile-card-${employee.userId}-stats-div`}
      >
        <span
          data-cy={`time-attendance-employee-attendance-mobile-card-${employee.userId}-absent-span`}
        >
          Absent: {employee?.absentDays} days
        </span>
        <span
          data-cy={`time-attendance-employee-attendance-mobile-card-${employee.userId}-late-span`}
        >
          Late: {employee?.totalLateRecords} days
        </span>
      </div>
    </div>
  );

  return (
    <div
      className="p-3 sm:p-6 bg-white rounded-lg shadow-sm"
      data-cy="time-attendance-employee-attendance-container-div"
    >
      <div
        className="flex flex-col gap-4"
        data-cy="time-attendance-employee-attendance-content-div"
      >
        {/* Desktop Filters */}
        <div
          className="hidden md:block"
          data-cy="time-attendance-employee-attendance-desktop-filters-div"
        >
          <div
            className="grid grid-cols-12 gap-4 mb-6"
            data-cy="time-attendance-employee-attendance-desktop-filters-grid-div"
          >
            <div
              className="col-span-6"
              data-cy="time-attendance-employee-attendance-desktop-filters-employee-select-div"
            >
              <Select
                showSearch
                placeholder="Search Employee"
                allowClear
                className="w-full h-12"
                onChange={(value) => setsearchOnAttendance(value)}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={employeeOptions}
                data-cy="time-attendance-employee-attendance-desktop-filters-employee-select"
              />
            </div>
            <div
              className="col-span-3"
              data-cy="time-attendance-employee-attendance-desktop-filters-status-select-div"
            >
              <Select
                showSearch
                placeholder="Status"
                allowClear
                value={currentStatusOnAttendance}
                className="w-full h-12"
                onChange={(value) => setCurrentStatusOnAttendance(value)}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={attendanceTypeOptions}
                data-cy="time-attendance-employee-attendance-desktop-filters-status-select"
              />
            </div>
            <div
              className="col-span-3"
              data-cy="time-attendance-employee-attendance-desktop-filters-date-range-div"
            >
              <RangePicker
                allowClear
                className="w-full h-12"
                onChange={(dates) => {
                  if (dates) {
                    setStartDateOnAttendance(
                      dates[0]?.format('YYYY-MM-DD') || '',
                    );
                    setEndDateOnAttendance(
                      dates[1]?.format('YYYY-MM-DD') || '',
                    );
                  } else {
                    setStartDateOnAttendance('');
                    setEndDateOnAttendance('');
                  }
                }}
                data-cy="time-attendance-employee-attendance-desktop-filters-date-range-picker"
              />
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        <div
          className="md:hidden"
          data-cy="time-attendance-employee-attendance-mobile-filters-div"
        >
          <div
            className="flex justify-between gap-4 w-full mb-4"
            data-cy="time-attendance-employee-attendance-mobile-filters-row-div"
          >
            <div
              className="flex-1"
              data-cy="time-attendance-employee-attendance-mobile-filters-employee-select-div"
            >
              <Select
                showSearch
                placeholder="Search Employee"
                className="w-full h-10"
                allowClear
                onChange={(value) => setsearchOnAttendance(value)}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={employeeOptions}
                data-cy="time-attendance-employee-attendance-mobile-filters-employee-select"
              />
            </div>
            <div data-cy="time-attendance-employee-attendance-mobile-filters-settings-button-div">
              <CustomButton
                type="default"
                size="small"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg h-10"
                title=""
                icon={<LuSettings2 size={20} />}
                data-cy="time-attendance-employee-attendance-mobile-filters-settings-button"
              />
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div
          className="hidden md:block"
          data-cy="time-attendance-employee-attendance-desktop-table-div"
        >
          {loading ? (
            <TableSkeleton columns={columns} />
          ) : (
            <Table
              columns={columns}
              dataSource={adminAttendanceUsers?.users}
              pagination={false}
              rowKey="userId"
              className="ant-table-thead-bg-white"
              onRow={(record) => ({
                onClick: () => {
                  router.push(
                    `/timesheet/dashboard?employeeAttendance&user=${record.userId}`,
                  );
                },
                style: { cursor: 'pointer' },
              })}
              data-cy="time-attendance-employee-attendance-desktop-table"
            />
          )}
        </div>

        {/* Mobile Cards */}
        <div
          className="md:hidden space-y-3"
          data-cy="time-attendance-employee-attendance-mobile-cards-div"
        >
          {loading ? (
            <div
              className="flex justify-center items-center h-32"
              data-cy="time-attendance-employee-attendance-mobile-cards-loading-div"
            >
              <div
                className="text-gray-500 text-sm"
                data-cy="time-attendance-employee-attendance-mobile-cards-loading-text"
              >
                Loading...
              </div>
            </div>
          ) : adminAttendanceUsers?.users?.length > 0 ? (
            adminAttendanceUsers.users.map((employee: any) => (
              <MobileEmployeeCard key={employee.userId} employee={employee} />
            ))
          ) : (
            <div
              className="flex justify-center items-center h-32"
              data-cy="time-attendance-employee-attendance-mobile-cards-empty-div"
            >
              <div
                className="text-gray-500 text-sm"
                data-cy="time-attendance-employee-attendance-mobile-cards-empty-text"
              >
                No employees found
              </div>
            </div>
          )}
        </div>

        {/* Pagination and Result Count */}
        <div
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-4 text-sm text-gray-600"
          data-cy="time-attendance-employee-attendance-pagination-div"
        >
          <Pagination
            current={adminAttendanceUsers?.pagination?.page}
            total={adminAttendanceUsers?.pagination?.total}
            pageSize={adminAttendanceUsers?.pagination?.limit}
            onChange={(page) => setCurrentPageOnAttendance(page)}
            showSizeChanger={false}
            className="self-center sm:self-start"
            size="small"
            data-cy="time-attendance-employee-attendance-pagination"
          />
          <div
            className="text-center sm:text-right"
            data-cy="time-attendance-employee-attendance-result-count-div"
          >
            {adminAttendanceUsers?.pagination?.total} Result
            {adminAttendanceUsers?.pagination?.total !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={
          <div
            className="flex gap-2 justify-center mt-4"
            data-cy="time-attendance-employee-attendance-mobile-filter-modal-footer-div"
          >
            <CustomButton
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 border rounded-lg text-sm text-gray-900"
              title="Cancel"
              type="default"
              data-cy="time-attendance-employee-attendance-mobile-filter-modal-cancel-button"
            />
            <CustomButton
              title="Apply Filter"
              type="primary"
              onClick={() => {
                setIsModalOpen(false);
              }}
              className="px-6 py-2 text-white rounded-lg text-sm"
              data-cy="time-attendance-employee-attendance-mobile-filter-modal-apply-button"
            />
          </div>
        }
        className="!m-4 md:hidden"
        style={{
          top: '20%',
          transform: 'translateY(-50%)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        width="90%"
        centered
        data-cy="time-attendance-employee-attendance-mobile-filter-modal"
      >
        <MobileFilterContent />
      </Modal>
    </div>
  );
}
