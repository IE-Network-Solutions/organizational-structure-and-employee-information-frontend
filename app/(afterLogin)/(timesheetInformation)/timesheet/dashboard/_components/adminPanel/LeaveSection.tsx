'use client';

import React, { useState } from 'react';
import { Card, Select, Avatar, Tag, Spin, DatePicker, Modal } from 'antd';
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
import CustomButton from '@/components/common/buttons/customButton';
import { LuSettings2 } from 'react-icons/lu';
// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

const LeaveSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    setLeaveTypeOnLeave,
    leaveTypeOnLeave,
    setUserIdOnLeave,
    departmentOnLeave,
    userIdOnLeave,
    startDate,
    endDate,
    setDepartmentOnLeave,
    setStartDate,
    setEndDate,
  } = TimeAndAttendaceDashboardStore();
  const { data: employeeAdminLeave, isLoading: loading } = useGetAdminOnLeave({
    userId: userIdOnLeave,
    startDate: startDate,
    endDate: endDate,
    departmentId: departmentOnLeave,
    leaveTypeId: leaveTypeOnLeave,
  });
  const { RangePicker } = DatePicker;

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

  const MobileFilterContent = () => (
    <div
      className="flex flex-col gap-4"
      data-cy="time-attendance-leave-section-mobile-filter-content-div"
    >
      <h3
        className="text-lg font-medium mb-2"
        data-cy="time-attendance-leave-section-mobile-filter-title-h3"
      >
        Filter
      </h3>

      {/* Leave Type */}
      <div
        className="flex flex-col gap-2"
        data-cy="time-attendance-leave-section-mobile-filter-leave-type-div"
      >
        <label
          className="text-sm text-gray-600"
          data-cy="time-attendance-leave-section-mobile-filter-leave-type-label"
        >
          Leave Type
        </label>
        <Select
          showSearch
          placeholder="Select Leave Type"
          allowClear
          value={leaveTypeOnLeave}
          className="w-full h-12"
          onChange={(value) => setLeaveTypeOnLeave(value)}
          filterOption={(input: any, option: any) =>
            (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
          }
          options={leaveTypeOption}
          data-cy="time-attendance-leave-section-mobile-filter-leave-type-select"
        />
      </div>

      {/* Department */}
      <div
        className="flex flex-col gap-2"
        data-cy="time-attendance-leave-section-mobile-filter-department-div"
      >
        <label
          className="text-sm text-gray-600"
          data-cy="time-attendance-leave-section-mobile-filter-department-label"
        >
          Department
        </label>
        <Select
          showSearch
          placeholder="Select Department"
          allowClear
          value={departmentOnLeave}
          className="w-full h-12"
          onChange={(value) => setDepartmentOnLeave(value)}
          filterOption={(input: any, option: any) =>
            (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
          }
          options={departmentOptions}
          data-cy="time-attendance-leave-section-mobile-filter-department-select"
        />
      </div>

      {/* Date Range */}
      <div
        className="flex flex-col gap-2"
        data-cy="time-attendance-leave-section-mobile-filter-date-range-div"
      >
        <label
          className="text-sm text-gray-600"
          data-cy="time-attendance-leave-section-mobile-filter-date-range-label"
        >
          Date Range
        </label>
        <RangePicker
          allowClear
          className="w-full h-12"
          onChange={(value) => {
            if (value) {
              setStartDate(value[0]?.format('YYYY-MM-DD') || '');
              setEndDate(value[1]?.format('YYYY-MM-DD') || '');
            } else {
              setStartDate('');
              setEndDate('');
            }
          }}
          data-cy="time-attendance-leave-section-mobile-filter-date-range-picker"
        />
      </div>
    </div>
  );

  return (
    <Card
      bodyStyle={{ padding: 0 }}
      className="h-full shadow-md px-3 sm:px-5 py-4"
      id="time-attendance-leave-section-layout-card"
      data-cy="time-attendance-leave-section-layout-card"
    >
      <div
        data-cy="dashboard-components-adminpanel-leavesection-tsx-leavesection-div-163"
        className="flex flex-col gap-4"
      >
        {/* Header */}
        <div
          className="flex flex-col sm:flex-row justify-between items-start gap-4 w-full"
          data-cy="time-attendance-leave-section-header-div"
        >
          <div
            className="font-bold text-lg mb-4"
            data-cy="time-attendance-leave-section-title-div"
          >
            Leave
          </div>
          <div
            className="space-x-3 items-center hidden md:flex"
            data-cy="time-attendance-leave-section-desktop-filters-div"
          >
            <Select
              showSearch
              placeholder="Department"
              allowClear
              filterOption={(input: any, option: any) =>
                (option?.label ?? '')
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
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

        {/* Mobile Filters */}
        <div
          className="md:hidden"
          data-cy="time-attendance-leave-section-mobile-filters-div"
        >
          <div
            className="flex justify-between items-center gap-4 w-full"
            data-cy="time-attendance-leave-section-mobile-filters-row-div"
          >
            <div
              className="flex-1"
              data-cy="time-attendance-leave-section-mobile-filters-employee-select-div"
            >
              <Select
                showSearch
                placeholder="Search Employee"
                className="w-full h-12"
                allowClear
                onChange={(value) => setUserIdOnLeave(value)}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={employeeOptions}
                data-cy="time-attendance-leave-section-mobile-filters-employee-select"
              />
            </div>
            <div data-cy="time-attendance-leave-section-mobile-filters-settings-button-div">
              <CustomButton
                type="default"
                size="small"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg h-10"
                title=""
                icon={<LuSettings2 size={20} />}
                data-cy="time-attendance-leave-section-mobile-filters-settings-button"
              />
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div
          data-cy="dashboard-components-adminpanel-leavesection-tsx-leavesection-div-256"
          className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 md:relative top-[-18px]"
        >
          <div
            data-cy="dashboard-components-adminpanel-leavesection-tsx-leavesection-div-257"
            className="space-y-3 mb-4 col-span-5"
          >
            <div
              data-cy="dashboard-components-adminpanel-leavesection-tsx-leavesection-div-258"
              className="flex-col sm:flex-row gap-2 w-full sm:w-auto mb-4 hidden md:flex"
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
                  className="h-72 overflow-y-auto scrollbar-none space-y-4"
                  id="time-attendance-leave-section-users-scroll-div"
                  data-cy="time-attendance-leave-section-users-scroll-div"
                >
                  {employeeAdminLeave?.users?.map((leave: any, index: any) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-1 bg-white border rounded-lg gap-3"
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
                          className="text-black text-[12px] font-semibold"
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
                          className="text-[14px] font-semibold"
                          id={`time-attendance-leave-section-record-${index}-days-text`}
                          data-cy={`time-attendance-leave-section-record-${index}-days-text`}
                        >
                          {leave.days} {leave.days > 1 ? 'Days' : 'Day'}
                        </span>
                        <Tag
                          style={{ marginInlineEnd: 0 }}
                          className="ml-0 text-[#3636f0] font-bold bg-[#b2b2ff] text-[12px] py-1"
                          id={`time-attendance-leave-section-record-${index}-type-tag`}
                          data-cy={`time-attendance-leave-section-record-${index}-type-tag`}
                        >
                          <strong data-cy="dashboard-components-adminpanel-leavesection-tsx-leavesection-strong-380">
                            {leave.leaveType}
                          </strong>
                        </Tag>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Spin>
          </div>

          <LeaveSectionGraph data-cy="time-attendance-leave-section-graph-display-component" />
        </div>
        <LeaveSectionGraph data-cy="time-attendance-leave-section-graph-display-component" />
      </div>

      {/* Mobile Filter Modal */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={
          <div
            className="flex gap-2 justify-center mt-4"
            data-cy="time-attendance-leave-section-mobile-filter-modal-footer-div"
          >
            <CustomButton
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 border rounded-lg text-sm text-gray-900"
              title="Cancel"
              type="default"
              data-cy="time-attendance-leave-section-mobile-filter-modal-cancel-button"
            />
            <CustomButton
              title="Apply Filter"
              type="primary"
              onClick={() => {
                setIsModalOpen(false);
              }}
              className="px-6 py-2 text-white rounded-lg text-sm"
              data-cy="time-attendance-leave-section-mobile-filter-modal-apply-button"
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
        data-cy="time-attendance-leave-section-mobile-filter-modal"
      >
        <MobileFilterContent />
      </Modal>
    </Card>
  );
};

export default LeaveSection;
