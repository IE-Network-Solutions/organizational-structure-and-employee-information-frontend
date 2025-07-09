'use client';

import React from 'react';
import { Card, Select, DatePicker, Avatar, Tag, Input, Spin } from 'antd';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useGetAdminOnLeave } from '@/store/server/features/timesheet/dashboard/queries';
import {
  UserOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useGetEmployee, useGetEmployees } from '@/store/server/features/employees/employeeManagment/queries';
import dayjs from 'dayjs';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import LeaveSectionGraph from './LeaveSectionGraph';
// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const { Option } = Select;
const { RangePicker } = DatePicker;

interface LeaveData {
  name: string;
  period: string;
  days: string;
  type: string;
  avatar: string;
}

const LeaveSection: React.FC = () => {
  const { setDepartmentOnLeave, setUserIdOnLeave, departmentOnLeave, userIdOnLeave, startDate, endDate } = TimeAndAttendaceDashboardStore();
  const { data: employeeAdminLeave, isLoading: loading } = useGetAdminOnLeave({ userId: userIdOnLeave, startDate: startDate, endDate: endDate, departmentId: departmentOnLeave });
  console.log(employeeAdminLeave, "employeeAdminLeave")

  // Line chart data for employee trends
  const lineChartData = {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    datasets: [
      {
        label: 'Number of Employees on leave',
        data: [20, 75, 45, 25, 30, 40, 35, 80, 45, 40, 35, 30],
        borderColor: '#8979FF', // New line color (e.g., Indigo-600)
        backgroundColor: 'rgba(79, 70, 229, 0.1)', // Lighter fill
        borderWidth: 1.5, // Line thickness
        tension: 0.4,
        fill: true,
        pointRadius: 2.5, // Optional: increase point size
        pointBackgroundColor: '#ffffff', // Point color
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      datalabels: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: '#333',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: true,
        },
      },
    },
  };
  const { data: Departments } = useGetUserDepartment();

  const departmentOptions = Departments?.map((i: any) => ({
    value: i.id,
    label: i?.name,
  }));
  const { data: Employees } = useGetEmployees();
  const employeeOptions = Employees?.items?.map((i: any) => ({
    value: i.id,
    label: i?.firstName + ' ' + i?.middleName + ' ' + i?.lastName,
  }));
  return (
    <Card title="Leave" className="h-full">
      {/* Leave List */}
      <div className="grid grid-cols-12 gap-4 items-start">
        <div className="space-y-3 mb-4 col-span-5">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
              onChange={(value) => setUserIdOnLeave(value)}
            />
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
              className='w-full h-12'
              onChange={(value) => setDepartmentOnLeave(value)}
            />
          </div>
          <Spin spinning={loading}>
            {employeeAdminLeave?.users?.length === 0 ?
              <div className='flex justify-center items-center h-64'>
                <p className='text-gray-500 text-[14px] font-semibold'>No Record Found</p>
              </div> :
              <div className="h-64 overflow-y-auto scrollbar-none space-y-2">
                {employeeAdminLeave?.users?.map((leave: any, index: any) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 py-1 bg-white border   rounded-lg gap-3 "
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={leave.profileImage} className="bg-purple-500 w-7 h-7">
                        {leave.name.charAt(0)}
                      </Avatar>
                      <div>
                        <p className=" text-gray-800 text-[12px]">{leave.name}</p>
                        <p className="text-black     text-[12px] font-medium">
                          {`${dayjs(leave.startDate).format('DD MMM YYYY')} to ${dayjs(leave.endDate).format('DD MMM YYYY')}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-0">
                      <span className="text-sm font-medium text-sm">
                        {leave.days}
                      </span>
                      <Tag
                        style={{ marginInlineEnd: 0 }}
                        className="ml-0 text-blue bg-[#b2b2ff] text-[12px] font-normal"
                      >
                        {leave.leaveType}
                      </Tag>
                    </div>
                  </div>
                ))}
              </div>
            }
          </Spin>


        </div>
        <LeaveSectionGraph />
      </div>
      {/* Chart */}
    </Card>
  );
};

export default LeaveSection;
