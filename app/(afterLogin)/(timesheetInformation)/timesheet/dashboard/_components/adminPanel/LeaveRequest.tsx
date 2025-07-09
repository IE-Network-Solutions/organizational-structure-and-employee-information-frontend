import React, { useMemo } from 'react';
import { Card, DatePicker, Select, Avatar, Spin, Empty } from 'antd';
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
import { useGetAdminPendingLeaveRequests } from '@/store/server/features/timesheet/dashboard/queries';
import dayjs from 'dayjs';
import { useGetEmployees } from '@/store/server/features/employees/employeeManagment/queries';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const { Option } = Select;

const LeaveRequest = () => {
  const { userIdOnLeaveRequest, setUserIdOnLeaveRequest, startDateOnLeaveRequest, endDateOnLeaveRequest, setStartDateOnLeaveRequest, setEndDateOnLeaveRequest, departmentOnLeaveRequest, setDepartmentOnLeaveRequest } = TimeAndAttendaceDashboardStore();

  const { data: pendingLeaveRequests, isLoading: loading } =
    useGetAdminPendingLeaveRequests({ userId: userIdOnLeaveRequest, startDate: startDateOnLeaveRequest, endDate: endDateOnLeaveRequest, departmentId: departmentOnLeaveRequest });
  console.log(pendingLeaveRequests, 'pendingLeaveRequests');

  const barData = useMemo(() => {
    const graphData = pendingLeaveRequests?.monthlyStats;

    if (!graphData || graphData.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const monthLabels = graphData.map((item: any) => item.month);
    const allLeaveTypes = Object.keys(graphData[0].leaveTypes);

    const leaveTypeColors = {
      'Planned Annual Leave': '#a78bfa',
      'Sick Leave': '#fca5a5',
      'Emergency Annual leave': '#6ee7b7',
      'Maternity Leave': '#fcd34d',
      'Paternity Leave': '#93c5fd',
      'unpaid Leave': '#38bdf8',
    };

    const datasets = allLeaveTypes.map((leaveType: any) => {
      const data = graphData.map(
        (monthData: any) => monthData.leaveTypes[leaveType] || 0,
      );
      return {
        label: leaveType,
        data: data,
        backgroundColor:
          leaveTypeColors[leaveType as keyof typeof leaveTypeColors] ||
          '#cccccc',
        stack: 'leave',
        barThickness: 15,
      };
    });

    return {
      labels: monthLabels,
      datasets: datasets,
    };
  }, [pendingLeaveRequests]);

  const barOptions = useMemo(() => {
    let maxY = 100; // Default max value
    if (pendingLeaveRequests?.monthlyStats) {
      const maxCount = Math.max(
        ...pendingLeaveRequests.monthlyStats.map((item: any) => item.count),
      );
      maxY = Math.ceil(maxCount * 1.2) || 10; // Add 20% buffer, default to 10 if max is 0
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
          },
          grid: {
            borderDash: [5, 5],
          },
          maxBarThickness: 4, // 👈 Optional: sets a max limit for bar width
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
  return (
    <Spin spinning={loading}>

      <Card bodyStyle={{ padding: 16 }} className="">
        <div className="grid grid-cols-12 gap-12">
          {/* Left panel */}
          <div className="col-span-12 md:col-span-5">
            <h2 className="text-lg font-semibold">Leave Request</h2>
            <p className="text-sm text-gray-500 mb-4">Pending Requests</p>
            <div className="flex  gap-2 mb-4">
              <Select
                showSearch
                placeholder="Select employee"
                allowClear
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={employeeOptions}
                maxTagCount={1}
                className='w-full h-12'
                onChange={(value: any) => setUserIdOnLeaveRequest(value)}
              />
              <DatePicker.RangePicker className="w-full h-12" onChange={(value: any) => {
                if (value) {
                  setStartDateOnLeaveRequest(value[0]?.format('YYYY-MM-DD') || '');
                  setEndDateOnLeaveRequest(value[1]?.format('YYYY-MM-DD') || '');
                }
              }} />
            </div>
            {pendingLeaveRequests?.users?.length > 0 ? (
              <div className="h-64 overflow-y-auto scrollbar-none space-y-2">
                {pendingLeaveRequests?.users?.map((item: any, index: any) => (
                  <div
                    key={index}
                    className="bg-white border rounded-xl px-4 py-2 flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar
                        src={item.profileImage}
                        size={24}
                      >
                        {item.name.charAt(0)}
                      </Avatar>

                      <div>
                        <p className="text-xs font-medium">{item.name}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium truncate ${item.leaveType?.includes('Planned Annual Leave') ? 'bg-violet-200 text-violet-800' :
                            item.leaveType?.includes('Sick') ? 'bg-yellow-100 text-yellow-700' :
                              item.leaveType?.includes('Emergency Annual') ? 'bg-green-100 text-green-700' :
                                item.leaveType?.includes('Maternity') ? 'bg-indigo-100 text-indigo-700' :
                                  item.leaveType?.includes('Unpaid') ? 'bg-red-100 text-red-700' :
                                    item.leaveType?.includes('Paternity') ? 'bg-purple-100 text-purple-700' :
                                      'bg-gray-100 text-gray-700'}`}
                        >
                          {item.leaveType}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <p>Requested: {dayjs(item.requested).format('DD MMM YYYY')}</p>
                      <p className='text-xs text-black font-semibold'>
                        {`${dayjs(item.leaveStartDate).format('DD MMM YYYY')} to ${dayjs(item.leaveEndDate).format('DD MMM YYYY')}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex justify-center items-center h-64'>
                <p className='text-gray-500 text-[14px] font-semibold'>No leave requests found</p>
              </div>
            )}
          </div>

          {/* Right panel - Chart */}
          <div className="col-span-12 md:col-span-7">
            <div className="flex justify-end mb-2">
              <Select
                showSearch
                placeholder="Select department"
                allowClear
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }

                options={departmentOptions}
                maxTagCount={1}
                className='w-44 h-12'
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
