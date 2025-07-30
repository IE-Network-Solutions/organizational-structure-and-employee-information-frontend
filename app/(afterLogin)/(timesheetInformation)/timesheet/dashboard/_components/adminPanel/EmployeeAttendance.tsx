import React from 'react';
import { Table, Select, Pagination, Avatar, Tag, DatePicker } from 'antd';
import { useRouter } from 'next/navigation';
import { useGetAdminAttendanceUsers } from '@/store/server/features/timesheet/dashboard/queries';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import { useGetEmployees } from '@/store/server/features/employees/employeeManagment/queries';

const { RangePicker } = DatePicker;

interface Employee {
  userId: string;
  key: string;
  name: string;
  profileImage: string;
  department: string;
  status: 'late' | 'active' | 'absent' | 'onleave';
  absentDays: number;
  lateDays: number;
}

const statusColors = {
  late: 'bg-yellow-100 text-yellow-600',
  active: 'bg-green-100 text-green-600',
  absent: 'bg-red-100 text-red-600',
  onleave: 'bg-purple text-light_purple',
};

export default function EmployeeAttendanceTable() {
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
      sorter: (a: Employee, b: Employee) => a.name.localeCompare(b.name),
      render: (notused: any, record?: Employee) => (
        <div className="flex items-center space-x-3">
          {record?.profileImage ? (
            <Avatar src={record.profileImage} />
          ) : (
            <Avatar>{record?.name?.charAt(0).toUpperCase()}</Avatar>
          )}
          <span>{record?.name}</span>
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      sorter: (a: Employee, b: Employee) =>
        a.department.localeCompare(b.department),
    },
    {
      title: 'Status',
      dataIndex: 'currentStatus',
      key: 'currentStatus',
      sorter: (a: Employee, b: Employee) => a.status.localeCompare(b.status),
      render: (status: Employee['status']) => (
        <Tag
          className={`uppercase px-3 font-semibold rounded-md border-none ${statusColors[status]}`}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Absentisms',
      dataIndex: 'absentDays',
      key: 'absentDays',
      sorter: (a: Employee, b: Employee) => a.absentDays - b.absentDays,
      render: (days: number) => `${days} days`,
    },
    {
      title: 'Late Arrivals',
      dataIndex: 'totalLateRecords',
      key: 'totalLateRecords',
      sorter: (a: Employee, b: Employee) => a.lateDays - b.lateDays,
      render: (days: number) => `${days} days`,
    },
  ];
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mb-6">
        <Select
          showSearch
          placeholder="Select employee"
          allowClear
          filterOption={(input: any, option: any) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={employeeOptions}
          onChange={(value) => setsearchOnAttendance(value)}
          className="flex-1 h-12"
        />
        <Select
          showSearch
          placeholder="Type"
          allowClear
          filterOption={(input: any, option: any) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={attendanceTypeOptions}
          onChange={(value) => setCurrentStatusOnAttendance(value)}
          className="w-52 h-12"
        />
        <RangePicker
          className="w-52 h-12 "
          onChange={(dates) => {
            if (dates) {
              setStartDateOnAttendance(dates[0]?.format('YYYY-MM-DD') || '');
              setEndDateOnAttendance(dates[1]?.format('YYYY-MM-DD') || '');
            } else {
              setStartDateOnAttendance('');
              setEndDateOnAttendance('');
            }
          }}
        />
      </div>
      {/* Table */}
      <Table
        columns={columns}
        dataSource={adminAttendanceUsers?.users}
        pagination={false}
        loading={loading}
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
      />

      {/* Pagination and Result Count */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <Pagination
          current={adminAttendanceUsers?.pagination?.page}
          total={adminAttendanceUsers?.pagination?.total}
          pageSize={adminAttendanceUsers?.pagination?.limit}
          onChange={(page) => setCurrentPageOnAttendance(page)}
          showSizeChanger={false}
          className="flex"
        />
        <div>
          {adminAttendanceUsers?.pagination?.total} Result
          {adminAttendanceUsers?.pagination?.total !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
