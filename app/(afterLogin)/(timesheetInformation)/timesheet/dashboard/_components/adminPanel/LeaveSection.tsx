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
    <Card
      bodyStyle={{ padding: 0 }}
      className="h-full shadow-md px-5 py-4"
      id="time-attendance-leave-section-layout-card"
      data-cy="time-attendance-leave-section-layout-card"
    >
      {/* Leave List */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start gap-4 w-full"
        id="time-attendance-leave-section-header-container-div"
        data-cy="time-attendance-leave-section-header-container-div"
      >
        <div
          className="font-bold text-lg mb-4"
          id="time-attendance-leave-section-title-display-div"
          data-cy="time-attendance-leave-section-title-display-div"
        >
          Leave
        </div>
        <div
          className="space-x-3 flex items-center"
          id="time-attendance-leave-section-filter-controls-div"
          data-cy="time-attendance-leave-section-filter-controls-div"
        >
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
            id="time-attendance-leave-section-department-select"
            data-cy="time-attendance-leave-section-department-select"
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
            id="time-attendance-leave-section-date-range-picker"
            data-cy="time-attendance-leave-section-date-range-picker"
          />
        </div>
      </div>

      <div
        className="grid grid-cols-12 gap-6 items-start relative top-[-18px]"
        id="time-attendance-leave-section-grid-layout-div"
        data-cy="time-attendance-leave-section-grid-layout-div"
      >
        <div
          className="space-y-3 mb-4 col-span-5"
          id="time-attendance-leave-section-list-panel-div"
          data-cy="time-attendance-leave-section-list-panel-div"
        >
          <div
            className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mb-4"
            id="time-attendance-leave-section-user-filters-div"
            data-cy="time-attendance-leave-section-user-filters-div"
          >
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
              id="time-attendance-leave-section-employee-select"
              data-cy="time-attendance-leave-section-employee-select"
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
              id="time-attendance-leave-section-type-select"
              data-cy="time-attendance-leave-section-type-select"
            />
          </div>
          <Spin
            spinning={loading}
            data-cy="time-attendance-leave-section-list-spinner"
          >
            {employeeAdminLeave?.users?.length === 0 ? (
              <div
                className="flex justify-center items-center h-64"
                id="time-attendance-leave-section-empty-state-div"
                data-cy="time-attendance-leave-section-empty-state-div"
              >
                <p
                  className="text-gray-500 text-[14px] font-semibold"
                  id="time-attendance-leave-section-empty-state-text"
                  data-cy="time-attendance-leave-section-empty-state-text"
                >
                  No Record Found
                </p>
              </div>
            ) : (
              <div
                className="h-72 overflow-y-auto scrollbar-none space-y-4 m"
                id="time-attendance-leave-section-users-scroll-div"
                data-cy="time-attendance-leave-section-users-scroll-div"
              >
                {employeeAdminLeave?.users?.map((leave: any, index: any) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 py-1   bg-white border   rounded-lg gap-3 "
                    id={`time-attendance-leave-section-record-${index}-container-div`}
                    data-cy={`time-attendance-leave-section-record-${index}-container-div`}
                  >
                    <div
                      className="flex flex-col gap-1"
                      id={`time-attendance-leave-section-record-${index}-details-div`}
                      data-cy={`time-attendance-leave-section-record-${index}-details-div`}
                    >
                      <div
                        className="flex items-center gap-1"
                        id={`time-attendance-leave-section-record-${index}-profile-row`}
                        data-cy={`time-attendance-leave-section-record-${index}-profile-row`}
                      >
                        <Avatar
                          src={leave.profileImage}
                          className="bg-purple-500 w-6 h-6 text-[12px]"
                          data-cy={`time-attendance-leave-section-record-${index}-avatar-display`}
                        >
                          {leave.name.charAt(0)}
                        </Avatar>
                        <div
                          id={`time-attendance-leave-section-record-${index}-name-container-div`}
                          data-cy={`time-attendance-leave-section-record-${index}-name-container-div`}
                        >
                          <p
                            className="font-medium text-[12px] text-black"
                            id={`time-attendance-leave-section-record-${index}-name-text`}
                            data-cy={`time-attendance-leave-section-record-${index}-name-text`}
                          >
                            {leave.name}
                          </p>
                        </div>
                      </div>
                      <p
                        className="text-black     text-[12px] font-semibold"
                        id={`time-attendance-leave-section-record-${index}-date-range-text`}
                        data-cy={`time-attendance-leave-section-record-${index}-date-range-text`}
                      >
                        {`${dayjs(leave.startDate).format('DD MMM YYYY')} to ${dayjs(leave.endDate).format('DD MMM YYYY')}`}
                      </p>
                    </div>

                    <div
                      className="flex flex-col items-end gap-0"
                      id={`time-attendance-leave-section-record-${index}-summary-div`}
                      data-cy={`time-attendance-leave-section-record-${index}-summary-div`}
                    >
                      <span
                        className="text-[14px] font-semibold "
                        id={`time-attendance-leave-section-record-${index}-days-text`}
                        data-cy={`time-attendance-leave-section-record-${index}-days-text`}
                      >
                        {leave.days} {leave.days > 1 ? 'Days' : 'Day'}
                      </span>
                      <Tag
                        style={{ marginInlineEnd: 0 }}
                        className="ml-0 text-[#3636f0] font-bold bg-[#b2b2ff] text-[12px] font-normal py-1"
                        id={`time-attendance-leave-section-record-${index}-type-tag`}
                        data-cy={`time-attendance-leave-section-record-${index}-type-tag`}
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
        <LeaveSectionGraph
          data-cy="time-attendance-leave-section-graph-display-component"
        />
      </div>
      {/* Chart */}
    </Card>
  );
};

export default LeaveSection;
