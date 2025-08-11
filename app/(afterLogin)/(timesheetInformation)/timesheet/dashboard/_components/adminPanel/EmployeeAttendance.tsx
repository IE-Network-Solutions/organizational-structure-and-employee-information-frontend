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
        <div className="flex items-center space-x-3">
          {record?.profileImage ? (
            <Avatar src={record?.profileImage} />
          ) : (
            <Avatar>{record?.name?.charAt(0)?.toUpperCase()}</Avatar>
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
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-medium mb-2">Filter</h3>

      {/* Attendance Type */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Status</label>
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
        />
      </div>

      {/* Date Range */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Date Range</label>
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
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {employee?.profileImage ? (
            <Avatar src={employee?.profileImage} className="flex-shrink-0" />
          ) : (
            <Avatar className="flex-shrink-0">
              {employee?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm text-black truncate">
              {employee?.name}
            </p>
            <p className="text-xs text-gray-600 truncate">
              {employee?.department}
            </p>
          </div>
        </div>
        <Tag
          className={`capitalize px-2 py-1 font-medium rounded-md border-none text-xs ${statusColors[employee?.currentStatus as keyof typeof statusColors]}`}
        >
          {employee?.currentStatus === 'onleave'
            ? 'On Leave'
            : employee?.currentStatus}
        </Tag>
      </div>

      <div className="flex justify-between text-xs text-gray-600">
        <span>Absent: {employee?.absentDays} days</span>
        <span>Late: {employee?.totalLateRecords} days</span>
      </div>
    </div>
  );

  return (
    <div className="p-3 sm:p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Desktop Filters */}
        <div className="hidden md:block">
          <div className="grid grid-cols-12 gap-4 mb-6">
            <div className="col-span-6">
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
              />
            </div>
            <div className="col-span-3">
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
              />
            </div>
            <div className="col-span-3">
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
              />
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        <div className="md:hidden">
          <div className="flex justify-between gap-4 w-full mb-4">
            <div className="flex-1">
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
              />
            </div>
            <div>
              <CustomButton
                type="default"
                size="small"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg h-10"
                title=""
                icon={<LuSettings2 size={20} />}
              />
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
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
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-500 text-sm">Loading...</div>
            </div>
          ) : adminAttendanceUsers?.users?.length > 0 ? (
            adminAttendanceUsers.users.map((employee: any) => (
              <MobileEmployeeCard key={employee.userId} employee={employee} />
            ))
          ) : (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-500 text-sm">No employees found</div>
            </div>
          )}
        </div>

        {/* Pagination and Result Count */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-4 text-sm text-gray-600">
          <Pagination
            current={adminAttendanceUsers?.pagination?.page}
            total={adminAttendanceUsers?.pagination?.total}
            pageSize={adminAttendanceUsers?.pagination?.limit}
            onChange={(page) => setCurrentPageOnAttendance(page)}
            showSizeChanger={false}
            className="self-center sm:self-start"
            size="small"
          />
          <div className="text-center sm:text-right">
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
          <div className="flex gap-2 justify-center mt-4">
            <CustomButton
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 border rounded-lg text-sm text-gray-900"
              title="Cancel"
              type="default"
            />
            <CustomButton
              title="Apply Filter"
              type="primary"
              onClick={() => {
                setIsModalOpen(false);
              }}
              className="px-6 py-2 text-white rounded-lg text-sm"
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
      >
        <MobileFilterContent />
      </Modal>
    </div>
  );
}
