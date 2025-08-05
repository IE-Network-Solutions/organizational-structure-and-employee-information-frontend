import React, { useMemo, useState } from 'react';
import { Card, DatePicker, Select, Avatar, Spin, Modal } from 'antd';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import dayjs from 'dayjs';
import { useGetAdminPendingLeaveRequests } from '@/store/server/features/timesheet/dashboard/queries';
import { useGetEmployees } from '@/store/server/features/employees/employeeManagment/queries';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';
import randomColor from 'random-color';
import CustomButton from '@/components/common/buttons/customButton';
import { LuSettings2 } from 'react-icons/lu';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const LeaveRequest = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    userIdOnLeaveRequest,
    setUserIdOnLeaveRequest,
    startDateOnLeaveRequest,
    endDateOnLeaveRequest,
    setStartDateOnLeaveRequest,
    setEndDateOnLeaveRequest,
    departmentOnLeaveRequest,
    setDepartmentOnLeaveRequest,
    leaveTypeOnLeaveRequest,
    setLeaveTypeOnLeaveRequest,
  } = TimeAndAttendaceDashboardStore();

  const { data: pendingLeaveRequests, isLoading: loading } =
    useGetAdminPendingLeaveRequests({
      userId: userIdOnLeaveRequest,
      startDate: startDateOnLeaveRequest,
      endDate: endDateOnLeaveRequest,
      departmentId: departmentOnLeaveRequest,
      leaveTypeId: leaveTypeOnLeaveRequest,
    });
  const generateRandomColor = () => {
    return randomColor().hexString();
  };

  // Create persistent color mapping for leave types
  const leaveTypeColors = useMemo(() => {
    const colors: { [key: string]: string } = {};
    return colors;
  }, []);
  const barData = useMemo(() => {
    const graphData = pendingLeaveRequests?.monthlyStats || [];

    const allMonths = Array.from({ length: 12 }, (notused, index) =>
      dayjs().month(index).format('MMM'),
    );

    const allLeaveTypes =
      graphData.length > 0 ? Object.keys(graphData[0].leaveTypes) : [];

    // Create a map of the actual months from the data
    const monthDataMap = graphData.reduce((acc: any, item: any) => {
      // The API returns months in "MMM" format (Jul, Aug, etc.)
      // So we use the month directly without parsing
      acc[item.month] = item.leaveTypes;
      return acc;
    }, {});

    const datasets = allLeaveTypes.map((leaveType) => {
      const data = allMonths.map(
        (monthLabel) => monthDataMap[monthLabel]?.[leaveType] || 0,
      );

      // Assign random color to leave type if not already assigned
      if (!leaveTypeColors[leaveType]) {
        leaveTypeColors[leaveType] = generateRandomColor();
      }

      return {
        label: leaveType,
        data,
        backgroundColor: leaveTypeColors[leaveType],
        stack: 'leave',
        barThickness: 12,
      };
    });

    return {
      labels: allMonths,
      datasets,
    };
  }, [pendingLeaveRequests]);

  const barOptions = useMemo(() => {
    let maxY = 100;
    if (pendingLeaveRequests?.monthlyStats) {
      const maxCount = Math.max(
        ...pendingLeaveRequests.monthlyStats.map((item: any) => item.count),
      );
      maxY = Math.ceil(maxCount * 1.2) || 10;
    }

    return {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 8,
            boxHeight: 8,
          },
        },
        datalabels: { display: false },
        title: {
          display: false,
          text: 'Leave Distribution',
        },
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            autoSkip: false,
          },
          grid: {
            borderDash: [5, 5],
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          max: maxY,
          width: 5,
          grid: {
            borderDash: [5, 5],
          },
        },
      },
    };
  }, [pendingLeaveRequests]);

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
  const { data: leaveTypes } = useGetLeaveTypes();

  const leaveTypeOption = leaveTypes?.items?.map((i: any) => ({
    value: i.id,
    label: i?.title,
  }));

  const MobileFilterContent = () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-medium mb-2">Filter</h3>

      {/* Leave Type */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Leave Type</label>
        <Select
          showSearch
          placeholder="Select Leave Type"
          allowClear
          value={leaveTypeOnLeaveRequest}
          className="w-full h-12"
          onChange={(value) => setLeaveTypeOnLeaveRequest(value)}
          filterOption={(input: any, option: any) =>
            (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
          }
          options={leaveTypeOption}
        />
      </div>

      {/* Department */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Department</label>
        <Select
          showSearch
          placeholder="Select Department"
          allowClear
          value={departmentOnLeaveRequest}
          className="w-full h-12"
          onChange={(value) => setDepartmentOnLeaveRequest(value)}
          filterOption={(input: any, option: any) =>
            (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
          }
          options={departmentOptions}
        />
      </div>

      {/* Date Range */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Date Range</label>
        <DatePicker.RangePicker
          allowClear
          className="w-full h-12"
          onChange={(value: any) => {
            if (value) {
              setStartDateOnLeaveRequest(value[0]?.format('YYYY-MM-DD') || '');
              setEndDateOnLeaveRequest(value[1]?.format('YYYY-MM-DD') || '');
            } else {
              setStartDateOnLeaveRequest('');
              setEndDateOnLeaveRequest('');
            }
          }}
        />
      </div>
    </div>
  );

  return (
    <Spin spinning={loading}>
      <Card bodyStyle={{ padding: 0 }} className="px-3 sm:px-5 py-4">
        <div className="md:grid grid-cols-12 gap-12 mb-4">
          <div className="col-span-12 md:col-span-5">
            <h2 className="text-[16px] font-bold">Leave Request</h2>
            <p className="text-[12px] mb-4">Pending Requests</p>

            <div className="md:flex items-center gap-2 mb-4 hidden">
              <Select
                showSearch
                placeholder="Select employee"
                allowClear
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={employeeOptions}
                maxTagCount={1}
                className="w-full h-12"
                onChange={(value: any) => setUserIdOnLeaveRequest(value)}
              />
              <DatePicker.RangePicker
                className="w-44 h-12"
                onChange={(value: any) => {
                  if (value) {
                    setStartDateOnLeaveRequest(
                      value[0]?.format('YYYY-MM-DD') || '',
                    );
                    setEndDateOnLeaveRequest(
                      value[1]?.format('YYYY-MM-DD') || '',
                    );
                  }
                }}
              />
            </div>
            {/* Mobile Filters */}
            <div className="md:hidden block">
              <div className="flex justify-between gap-4 w-full mb-4">
                <div className="flex-1">
                  <Select
                    showSearch
                    placeholder="Search Employee"
                    className="w-full h-12"
                    allowClear
                    onChange={(value: any) => setUserIdOnLeaveRequest(value)}
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

            {pendingLeaveRequests?.users?.length > 0 ? (
              <div className="h-64 overflow-y-auto scrollbar-none space-y-4">
                {pendingLeaveRequests.users.map((item: any, index: any) => (
                  <div
                    key={index}
                    className="bg-white border rounded-xl px-4 py-1  items-center"
                  >
                    <div className="space-y-2 flex justify-between w-full">
                      <div className="flex items-center space-x-2 mb-1 ">
                        <Avatar
                          src={item.profileImage}
                          className=" w-6 h-6 text-[12px]"
                        >
                          {item.name.charAt(0)}
                        </Avatar>
                        <p className="text-[12px] font-medium">{item.name}</p>
                      </div>
                      <p className="text-[12px]">
                        Requested: {dayjs(item.requested).format('DD MMM YYYY')}
                      </p>
                    </div>

                    <div className="flex justify-between w-full items-start">
                      <div
                        className={`text-xs px-2 py-1 rounded-md font-medium min-w-10 `}
                        style={{
                          backgroundColor: (() => {
                            if (!leaveTypeColors[item.leaveType]) {
                              leaveTypeColors[item.leaveType] =
                                generateRandomColor();
                            }
                            return leaveTypeColors[item.leaveType];
                          })(),
                          color: '#ffffff',
                          border: '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        {item.leaveType}
                      </div>
                      <p className="text-xs text-black font-bold">
                        {`${dayjs(item.leaveStartDate).format('D')}-${dayjs(item.leaveEndDate).format('D MMM YYYY')}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 text-[14px] font-semibold">
                  No leave requests found
                </p>
              </div>
            )}
          </div>

          {/* Chart Section */}
          <div className="col-span-12 md:col-span-7">
            <div className="justify-end mb-2 gap-3 hidden md:flex">
              <Select
                showSearch
                placeholder="Select Leave Type"
                allowClear
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={leaveTypeOption}
                maxTagCount={1}
                className="w-40 h-12"
                onChange={(value) => setLeaveTypeOnLeaveRequest(value)}
              />
              <Select
                showSearch
                placeholder="Select department"
                allowClear
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={departmentOptions}
                maxTagCount={1}
                className="w-40 h-12"
                onChange={(value) => setDepartmentOnLeaveRequest(value)}
              />
            </div>
            <div className="w-full lg:col-span-7">
              <div className="h-64 md:h-[320px]">
                <Bar
                  data={barData}
                  options={{ ...barOptions, maintainAspectRatio: false } as any}
                />
              </div>
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
      </Card>
    </Spin>
  );
};

export default LeaveRequest;
