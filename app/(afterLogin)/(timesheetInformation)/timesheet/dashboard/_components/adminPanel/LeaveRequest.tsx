import React, { useMemo } from 'react';
import { Card, DatePicker, Select, Avatar, Spin } from 'antd';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const LeaveRequest = () => {
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

    const allMonths = Array.from({ length: 12 }, (_, index) =>
      dayjs().month(index).format('MMM')
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
        (monthLabel) => monthDataMap[monthLabel]?.[leaveType] || 0
      );
      console.log(`Data for ${leaveType}:`, data);

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
        ...pendingLeaveRequests.monthlyStats.map((item: any) => item.count)
      );
      maxY = Math.ceil(maxCount * 1.2) || 10;
    }

    return {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
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

  // Generate random colors for leave types (component level)

  return (
    <Spin spinning={loading}>
      <Card bodyStyle={{ padding: 16 }}>
        <div className="grid grid-cols-12 gap-12">
          {/* Left Panel */}
          <div className="col-span-12 md:col-span-5">
            <h2 className="text-lg font-semibold">Leave Request</h2>
            <p className="text-sm text-gray-500 mb-4">Pending Requests</p>

            <div className="flex gap-2 mb-4">
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
                className="w-full h-12"
                onChange={(value: any) => {
                  if (value) {
                    setStartDateOnLeaveRequest(
                      value[0]?.format('YYYY-MM-DD') || ''
                    );
                    setEndDateOnLeaveRequest(
                      value[1]?.format('YYYY-MM-DD') || ''
                    );
                  }
                }}
              />
            </div>

            {pendingLeaveRequests?.users?.length > 0 ? (
              <div className="h-64 overflow-y-auto scrollbar-none space-y-2">
                {pendingLeaveRequests.users.map((item: any, index: any) => (
                  <div
                    key={index}
                    className="bg-white border rounded-xl px-4 py-2 flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar src={item.profileImage} size={24}>
                        {item.name.charAt(0)}
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium">{item.name}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium truncate`}
                          style={{
                            backgroundColor: (() => {
                              if (!leaveTypeColors[item.leaveType]) {
                                leaveTypeColors[item.leaveType] = generateRandomColor();
                              }
                              return leaveTypeColors[item.leaveType];
                            })(),
                            color: '#ffffff',
                            border: '1px solid rgba(255,255,255,0.2)'
                          }}
                        >
                          {item.leaveType}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <p>
                        Requested: {dayjs(item.requested).format('DD MMM YYYY')}
                      </p>
                      <p className="text-xs text-black font-semibold">
                        {`${dayjs(item.leaveStartDate).format('DD MMM YYYY')} to ${dayjs(item.leaveEndDate).format('DD MMM YYYY')}`}
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

          {/* Right Panel - Chart */}
          <div className="col-span-12 md:col-span-7">
            <div className="flex justify-end mb-2 gap-3">
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
                className="w-44 h-12"
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
                className="w-44 h-12"
                onChange={(value) => setDepartmentOnLeaveRequest(value)}
              />
            </div>
            <div style={{ height: 320, width: '100%' }}>
              <Bar
                data={barData}
                options={{ ...barOptions, maintainAspectRatio: false } as any}
              />
            </div>
          </div>
        </div>
      </Card>
    </Spin>
  );
};

export default LeaveRequest;
