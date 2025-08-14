'use client';

import React from 'react';
import { Card, Select, Avatar, Tag, Spin, DatePicker } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js';
import { useGetAdminOnLeave } from '@/store/server/features/timesheet/dashboard/queries';
import { useGetEmployees } from '@/store/server/features/employees/employeeManagment/queries';
import dayjs from 'dayjs';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import LeaveSectionGraph from './LeaveSectionGraph';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

const LeaveSection: React.FC = () => {
  const {
    setLeaveTypeOnLeave,
    leaveTypeOnLeave,
    setUserIdOnLeave,
    departmentOnLeave,
    userIdOnLeave,
    startDate,
    endDate,
  } = TimeAndAttendaceDashboardStore();
  const { data: employeeAdminLeave, isLoading: loading } = useGetAdminOnLeave({
    userId: userIdOnLeave,
    startDate: startDate,
    endDate: endDate,
    departmentId: departmentOnLeave,
    leaveTypeId: leaveTypeOnLeave,
  });
  const { RangePicker } = DatePicker;

  // Line chart data for employee trends

  const { data: leaveTypes } = useGetLeaveTypes();

  const leaveTypeOption = leaveTypes?.items?.map((i: any) => ({
    value: i.id,
    label: i?.title,
  }));
  const { data: Employees } = useGetEmployees();
  const employeeOptions = Employees?.items?.map((i: any) => ({
    value: i.id,
    label: i?.firstName + ' ' + i?.middleName + ' ' + i?.lastName,
  }));
  const { data: Departments } = useGetUserDepartment();

  const departmentOptions = Departments?.map((i: any) => ({
    value: i.id,
    label: i?.name,
  }));
  const { setDepartmentOnLeave, setStartDate, setEndDate } =
    TimeAndAttendaceDashboardStore();
  return (
    <Card bodyStyle={{ padding: 0 }} className="h-full shadow-md px-5 py-4">
      {/* Leave List */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 w-full">
        <div className="font-bold text-lg mb-4">Leave</div>
        <div className="space-x-3 flex items-center">
          <Select
            showSearch
            placeholder="Department"
            allowClear
            filterOption={(input: any, option: any) =>
              (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
            }
            options={departmentOptions}
            maxTagCount={1}
            className="w-40 h-12"
            onChange={(value) => setDepartmentOnLeave(value)}
          />
          <RangePicker
            allowClear
            className="w-40 h-12"
            onChange={(value) => {
              if (value) {
                setStartDate(value[0]?.format('YYYY-MM-DD') || '');
                setEndDate(value[1]?.format('YYYY-MM-DD') || '');
              } else {
                setStartDate('');
                setEndDate('');
              }
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start relative top-[-18px]">
        <div className="space-y-3 mb-4 col-span-5">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mb-4">
            <Select
              showSearch
              placeholder="search employee"
              allowClear
              filterOption={(input: any, option: any) =>
                (option?.label ?? '')
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={employeeOptions}
              maxTagCount={1}
              className="w-full h-12"
              onChange={(value) => setUserIdOnLeave(value)}
            />
            <Select
              showSearch
              placeholder="Leave Type"
              allowClear
              filterOption={(input: any, option: any) =>
                (option?.label ?? '')
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={leaveTypeOption}
              maxTagCount={1}
              className="w-52 h-12"
              onChange={(value) => setLeaveTypeOnLeave(value)}
            />
          </div>
          <Spin spinning={loading}>
            {employeeAdminLeave?.users?.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 text-[14px] font-semibold">
                  No Record Found
                </p>
              </div>
            ) : (
              <div className="h-72 overflow-y-auto scrollbar-none space-y-4 m">
                {employeeAdminLeave?.users?.map((leave: any, index: any) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 py-1   bg-white border   rounded-lg gap-3 "
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Avatar
                          src={leave.profileImage}
                          className="bg-purple-500 w-6 h-6 text-[12px]"
                        >
                          {leave.name.charAt(0)}
                        </Avatar>
                        <div>
                          <p className="font-medium text-[12px] text-black">
                            {leave.name}
                          </p>
                        </div>
                      </div>
                      <p className="text-black     text-[12px] font-semibold">
                        {`${dayjs(leave.startDate).format('DD MMM YYYY')} to ${dayjs(leave.endDate).format('DD MMM YYYY')}`}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-0">
                      <span className="text-[14px] font-semibold ">
                        {leave.days} {leave.days > 1 ? 'Days' : 'Day'}
                      </span>
                      <Tag
                        style={{ marginInlineEnd: 0 }}
                        className="ml-0 text-[#3636f0] font-bold bg-[#b2b2ff] text-[12px] font-normal py-1"
                      >
                        <strong>{leave.leaveType}</strong>
                      </Tag>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Spin>
        </div>
        <LeaveSectionGraph />
      </div>
      {/* Chart */}
    </Card>
  );
};

export default LeaveSection;
