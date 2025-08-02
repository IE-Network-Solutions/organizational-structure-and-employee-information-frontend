'use client';

import React from 'react';
import { Spin } from 'antd';
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
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';

const shadowLinePlugin = {
  id: 'shadowLinePlugin',
  beforeDatasetsDraw: (chart: any) => {
    const { ctx } = chart;
    ctx.save();
    ctx.shadowColor = '#8C62FF';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
  },
  afterDatasetsDraw: (chart: any) => {
    chart.ctx.restore();
  },
};
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

const LeaveSectionGraph: React.FC = () => {
  const { departmentOnLeave, startDate, endDate } =
    TimeAndAttendaceDashboardStore();

  const { data: employeeAdminLeave, isLoading: loading } = useGetAdminOnLeave({
    userId: '',
    startDate: startDate,
    endDate: endDate,
    departmentId: departmentOnLeave,
  });

  const leaveTypeArray = employeeAdminLeave?.leaveTypeStats
    ? Object.entries(employeeAdminLeave.leaveTypeStats).map(
        ([leaveType, count]) => ({
          leaveType,
          count,
        }),
      )
    : [];
  const labels = leaveTypeArray.map((i: any) => i.leaveType.split(' ')[0]);
  const dataSet = leaveTypeArray.map((i: any) => i.count);
  const lineChartData = {
    labels: labels,
    datasets: [
      {
        // label: 'Number of Employees on leave', // Removed to suppress legend and tooltip title
        data: dataSet,
        borderColor: '#8979FF',
        backgroundColor: 'rgba(137, 121, 255, 0.1)',
        borderWidth: 1,
        tension: 0.4,
        fill: false,
        pointRadius: 3.5,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#8979FF',
        pointBorderWidth: 1,
        pointHoverRadius: 2,
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#333',
        bodyColor: '#333',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13 },
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: dataSet.length > 0 ? Math.max(...dataSet) + 10 : 100,
        ticks: {
          stepSize: 20,
          color: '#666',
          font: {
            size: 12,
            weight: 'normal' as const,
          },
          padding: 8,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
          lineWidth: 1,
          drawBorder: false,
          borderDash: [4, 4],
        },
        border: {
          display: false,
        },
      },
      x: {
        ticks: {
          color: '#666',
          font: {
            size: 12,
            weight: 'normal' as const,
          },
          padding: 8,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
          lineWidth: 1,
          drawBorder: false,
          borderDash: [4, 4],
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <div className="col-span-7">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4 w-full">
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
            className="h-80 "
            data={lineChartData}
            options={lineChartOptions}
            plugins={[shadowLinePlugin]}
          />
        )}
      </Spin>
    </div>
  );
};

export default LeaveSectionGraph;
