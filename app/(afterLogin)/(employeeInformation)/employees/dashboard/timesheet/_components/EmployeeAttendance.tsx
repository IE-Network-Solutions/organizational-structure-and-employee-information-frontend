import React, { useEffect, useState } from 'react';
import { Table, Select, Avatar, Tag, DatePicker, Popover } from 'antd';
import { useGetAdminAttendanceUsers } from '@/store/server/features/timesheet/dashboard/queries';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import { useGetEmployees } from '@/store/server/features/employees/employeeManagment/queries';
import CustomButton from '@/components/common/buttons/customButton';
import { MdOutlineFilterAlt } from 'react-icons/md';
import dayjs, { Dayjs } from 'dayjs';
import CustomPagination from '@/components/customPagination';
import { UserOutlined } from '@ant-design/icons';

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(
    undefined,
  );
  const [filterDateRange, setFilterDateRange] = useState<[Dayjs, Dayjs] | null>(
    null,
  );
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
    setPageSizeOnAttendance,
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

  useEffect(() => {
    if (!isFilterOpen) return;

    setFilterStatus(currentStatusOnAttendance || undefined);

    if (startDateOnAttendance && endDateOnAttendance) {
      setFilterDateRange([
        dayjs(startDateOnAttendance),
        dayjs(endDateOnAttendance),
      ]);
    } else {
      setFilterDateRange(null);
    }
  }, [
    isFilterOpen,
    currentStatusOnAttendance,
    startDateOnAttendance,
    endDateOnAttendance,
  ]);

  const handleResetFilters = () => {
    setFilterStatus(undefined);
    setFilterDateRange(null);
    setCurrentStatusOnAttendance('');
    setStartDateOnAttendance('');
    setEndDateOnAttendance('');
    setCurrentPageOnAttendance(1);
  };

  const handleSaveFilters = () => {
    setCurrentStatusOnAttendance(filterStatus || '');

    if (filterDateRange?.length === 2) {
      setStartDateOnAttendance(filterDateRange[0].format('YYYY-MM-DD'));
      setEndDateOnAttendance(filterDateRange[1].format('YYYY-MM-DD'));
    } else {
      setStartDateOnAttendance('');
      setEndDateOnAttendance('');
    }

    setCurrentPageOnAttendance(1);
    setIsFilterOpen(false);
  };

  const columns = [
    {
      title: 'Employee Name',
      dataIndex: 'name',
      key: 'name',
      // sorter: (a: Employee, b: Employee) => a?.name?.localeCompare(b?.name),
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
              icon={<UserOutlined size={24} />}
            />
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
      // sorter: (a: Employee, b: Employee) =>
      //   a?.department?.localeCompare(b?.department),
    },
    {
      title: 'Status',
      dataIndex: 'currentStatus',
      key: 'currentStatus',
      // sorter: (a: Employee, b: Employee) => a?.status?.localeCompare(b?.status),
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
      title: "Absenteeism's",
      dataIndex: 'absentDays',
      key: 'absentDays',
      // sorter: (a: Employee, b: Employee) => a?.absentDays - b?.absentDays,
      render: (days: number) => `${days} days`,
    },
    {
      title: 'Late Arrivals',
      dataIndex: 'totalLateRecords',
      key: 'totalLateRecords',
      // sorter: (a: Employee, b: Employee) => a?.lateDays - b?.lateDays,
      render: (days: number) => `${days} days`,
    },
  ];

  const FilterContent = () => (
    <div
      className="px-1 sm:px-2 py-1"
      data-cy="time-attendance-employee-attendance-mobile-filter-content-div"
    >
      <div
        className="mb-4 relative"
        data-cy="time-attendance-employee-attendance-mobile-filter-header-div"
        id="time-attendance-employee-attendance-mobile-filter-header-div"
      >
        <button
          type="button"
          aria-label="Close filters"
          className="absolute -top-1 -right-1 h-8 w-8 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-2xl leading-none"
          onClick={() => setIsFilterOpen(false)}
          data-cy="time-attendance-employee-attendance-mobile-filter-close-button"
          id="time-attendance-employee-attendance-mobile-filter-close-button"
        >
          ×
        </button>
        <h3
          className="text-base font-semibold text-gray-800 m-0"
          data-cy="time-attendance-employee-attendance-mobile-filter-title"
          id="time-attendance-employee-attendance-mobile-filter-title"
        >
          Filter
        </h3>
        <p
          className="text-[14px] text-gray-500 mt-1 mb-0"
          data-cy="time-attendance-employee-attendance-mobile-filter-subtitle"
          id="time-attendance-employee-attendance-mobile-filter-subtitle"
        >
          Select All filters that apply
        </p>
      </div>

      <div
        data-cy="time-attendance-employee-attendance-mobile-filter-content-div"
        className="space-y-5"
      >
        <div
          className="flex flex-col gap-2"
          data-cy="time-attendance-employee-attendance-mobile-filter-date-range-div"
        >
          <label
            className="text-[14px] text-gray-900"
            data-cy="time-attendance-employee-attendance-mobile-filter-date-range-label"
          >
            Date
          </label>
          <RangePicker
            allowClear
            value={filterDateRange}
            placeholder={['Start date', 'End date']}
            className="w-full h-12 rounded-lg"
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setFilterDateRange([dates[0], dates[1]]);
              } else {
                setFilterDateRange(null);
              }
            }}
            id="time-attendance-employee-attendance-date-range-picker"
            data-cy="time-attendance-employee-attendance-date-range-picker"
          />
        </div>

        <div
          className="flex flex-col gap-2"
          data-cy="time-attendance-employee-attendance-mobile-filter-status-div"
        >
          <label
            className="text-[14px] text-gray-900"
            data-cy="time-attendance-employee-attendance-mobile-filter-status-label"
          >
            Status
          </label>
          <Select
            showSearch
            placeholder="Select Status"
            allowClear
            value={filterStatus}
            className="w-full h-12"
            onChange={(value) => setFilterStatus(value)}
            filterOption={(input: string, option?: { label: string }) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={attendanceTypeOptions}
            id="time-attendance-employee-attendance-status-select"
            data-cy="time-attendance-employee-attendance-status-select"
          />
        </div>
      </div>
      <div
        className="flex gap-3 justify-end mt-6"
        data-cy="time-attendance-employee-attendance-filter-popover-footer-div"
      >
        <CustomButton
          onClick={handleResetFilters}
          className="px-6 py-2 border rounded-lg text-sm text-gray-700 bg-white"
          title="Reset"
          type="default"
          data-cy="time-attendance-employee-attendance-filter-popover-reset-button"
        />
        <CustomButton
          title="Save Filter"
          type="primary"
          onClick={handleSaveFilters}
          className="px-6 py-2 text-white rounded-lg text-sm"
          data-cy="time-attendance-employee-attendance-filter-popover-save-button"
        />
      </div>
    </div>
  );

  return (
    <div
      className=" bg-white rounded-lg border border-gray-200"
      data-cy="time-attendance-employee-attendance-container-div"
    >
      <div
        className="flex flex-col gap-0"
        data-cy="time-attendance-employee-attendance-content-div"
      >
        {/* Desktop Filters */}
        <div
          className="px-4 pt-4 block"
          data-cy="time-attendance-employee-attendance-desktop-filters-div"
        >
          <div
            className="flex items-center justify-between gap-4 mb-4"
            data-cy="time-attendance-employee-attendance-desktop-filters-grid-div"
          >
            <div
              className="w-full max-w-sm"
              data-cy="time-attendance-employee-attendance-desktop-filters-employee-select-div"
            >
              <Select
                showSearch
                placeholder="Search Employee"
                allowClear
                value={searchOnAttendance || undefined}
                className="w-full h-10"
                onChange={(value) => setsearchOnAttendance(value)}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={employeeOptions}
                suffixIcon={
                  <span
                    className="text-gray-400"
                    data-cy="time-attendance-employee-attendance-desktop-filters-employee-select-suffix"
                    id="time-attendance-employee-attendance-desktop-filters-employee-select-suffix"
                  >
                    ⌕
                  </span>
                }
                showArrow={false}
                data-cy="time-attendance-employee-attendance-desktop-filters-employee-select"
              />
            </div>
            <Popover
              content={<FilterContent />}
              trigger="click"
              open={isFilterOpen}
              onOpenChange={setIsFilterOpen}
              placement="bottomRight"
              overlayStyle={{ padding: 0 }}
              overlayInnerStyle={{
                padding: 16,
                borderRadius: 16,
                width: 'min(640px, calc(100vw - 32px))',
                maxWidth: 640,
              }}
              getPopupContainer={() => document.body}
              data-cy="time-attendance-employee-attendance-desktop-filter-popover"
            >
              <div data-cy="time-attendance-employee-attendance-desktop-filters-settings-button-div">
                <CustomButton
                  type="default"
                  size="small"
                  className="flex items-center gap-2 px-4 py-1 border border-gray-300 rounded-lg h-10 bg-white text-black/70"
                  title="Filter"
                  icon={<MdOutlineFilterAlt size={16} />}
                  data-cy="time-attendance-employee-attendance-desktop-filters-settings-button"
                />
              </div>
            </Popover>
          </div>
        </div>

        {/* Desktop Table */}
        <div
          className="block overflow-x-auto"
          data-cy="time-attendance-employee-attendance-desktop-table-div"
        >
          <Table
            columns={columns}
            dataSource={adminAttendanceUsers?.users}
            pagination={false}
            loading={loading}
            rowKey="userId"
            scroll={{ x: 900 }}
            className="ant-table-thead-bg-white"
            // Zebra striping for even rows
            rowClassName={(unusedRecord, index) =>
              index % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
            }
            // onRow={(record: Employee) => ({
            //   onClick: () => {
            //     router.push(
            //       `/timesheet/dashboard?employeeAttendance&user=${record.userId}`,
            //     );
            //   },
            //   style: { cursor: 'pointer' },
            // })}
            data-cy="time-attendance-employee-attendance-desktop-table"
          />
        </div>

        {/* Pagination and Result Count */}
        <div
          className="px-4"
          data-cy="time-attendance-employee-attendance-pagination-div"
        >
          <CustomPagination
            current={currentPageOnAttendance}
            total={adminAttendanceUsers?.pagination?.total}
            pageSize={adminAttendanceUsers?.pagination?.limit}
            onChange={(page) => setCurrentPageOnAttendance(page)}
            onShowSizeChange={(pageSize) => {
              setPageSizeOnAttendance(pageSize);
              setCurrentPageOnAttendance(1);
            }}
            data-cy="time-attendance-employee-attendance-pagination"
          />
        </div>
      </div>
    </div>
  );
}
