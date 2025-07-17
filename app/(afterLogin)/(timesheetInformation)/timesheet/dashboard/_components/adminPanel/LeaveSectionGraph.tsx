'use client';

import React from 'react';
import { Select, DatePicker, Spin } from 'antd';
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
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
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

const { RangePicker } = DatePicker;

const LeaveSectionGraph: React.FC = () => {
  const {
    setDepartmentOnLeave,
    departmentOnLeave,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
  } = TimeAndAttendaceDashboardStore();
  const { data: employeeAdminLeave, isLoading: loading } = useGetAdminOnLeave({
    userId: '',
    startDate: startDate,
    endDate: endDate,
    departmentId: departmentOnLeave,
  });

  // Line chart data for employee trends
  const labels = employeeAdminLeave?.monthlyStats?.map((i: any) => i.month);
  const dataSet = employeeAdminLeave?.monthlyStats?.map((i: any) => i.count);
  const lineChartData = {
    labels: labels,
    datasets: [
      {
        label: 'Number of Employees on leave',
        data: dataSet,
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
  return (
    <div className="col-span-7">
      <div className="flex flex-col sm:flex-row justify-between items-end mb-4 gap-4 w-full">
        <p className="text-purple-600 text-[12px] flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect y="7" width="16" height="2" fill="#8979FF" />
            <circle cx="8" cy="8" r="3.5" fill="white" stroke="#8979FF" />
          </svg>
          Number of Employees on leave
        </p>
        <div className="space-x-2 flex items-center ">
          <Select
            showSearch
            placeholder="Select department"
            allowClear
            filterOption={(input: any, option: any) =>
              (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
            }
            options={departmentOptions}
            maxTagCount={1}
            className="w-32 h-12"
            onChange={(value) => setDepartmentOnLeave(value)}
          />

          <RangePicker
            allowClear
            className="w-32 h-12"
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
      <Spin spinning={loading}>
        {employeeAdminLeave?.monthlyStats?.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 text-[14px] font-semibold">
              No Record Found
            </p>
          </div>
        ) : (
          <Line
            className="h-64"
            data={lineChartData}
            options={lineChartOptions}
          />
        )}
      </Spin>
    </div>
  );
};

export default LeaveSectionGraph;
