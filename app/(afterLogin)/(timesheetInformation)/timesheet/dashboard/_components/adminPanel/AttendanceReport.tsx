'use client';

import React from 'react';
import { Card, Select, DatePicker, Avatar, Spin } from 'antd';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useGetAdminAttendanceStats } from '@/store/server/features/timesheet/dashboard/queries';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import { useGetUserDepartment } from '@/store/server/features/okrplanning/okr/department/queries';
import dayjs from 'dayjs';
import { useGetEmployees } from '@/store/server/features/employees/employeeManagment/queries';

// Register Chart.js components and plugins
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const { RangePicker } = DatePicker;

const AttendanceReport: React.FC = () => {
  const {
    startDateAttendanceReport,
    endDateAttendanceReport,
    setStartDateAttendanceReport,
    setEndDateAttendanceReport,
    departmentOnAttendanceReport,
    setDepartmentOnAttendanceReport,
    setUserIdOnAttendanceReport,
    userIdOnAttendanceReport,
  } = TimeAndAttendaceDashboardStore();
  const { data: attendanceStats, isLoading: loading } =
    useGetAdminAttendanceStats({
      userId: userIdOnAttendanceReport,
      startDate: startDateAttendanceReport,
      endDate: endDateAttendanceReport,
      departmentId: departmentOnAttendanceReport,
    });

  // Doughnut chart data
  const doughnutChartData = {
    labels: ['Late', 'Absent', 'Leave'],
    datasets: [
      {
        data: [
          attendanceStats?.late,
          attendanceStats?.absent,
          attendanceStats?.leave,
        ],
        backgroundColor: ['#8b5cf6', '#f87171', '#06b6d4'],
        borderWidth: 0,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: '50%',
    plugins: {
      legend: {
        position: 'right',

        labels: {
          usePointStyle: true,
          boxWidth: 6,
          padding: 8,
          font: {
            size: 10,
          },
        },
        align: 'center',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}`;
          },
        },
      },
      datalabels: {
        color: '#ffffff',
        font: {
          weight: 'bold',
          size: 14,
        },
        formatter: (value: number, context: any) => {
          // Only show label if value is greater than 0
          if (value > 0) {
            const label = context.chart.data.labels?.[context.dataIndex];
            return `${label}\n${value}`;
          }
          return '';
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
    <Card title={false} className="h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start mb-4 gap-4 w-full">
        <p className="text-sm text-black font-semibold w-64">
          Attendance report
        </p>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:items-center">
          <div className="w-full">
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
              onChange={(value) => setUserIdOnAttendanceReport(value)}
            />
          </div>

          <div className="w-48">
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
              className="w-full h-12"
              onChange={(value) => setDepartmentOnAttendanceReport(value)}
            />
          </div>

          <div className="w-48">
            <RangePicker
              className="w-full h-12"
              onChange={(value) => {
                if (value) {
                  setStartDateAttendanceReport(
                    value[0]?.format('YYYY-MM-DD') || '',
                  );
                  setEndDateAttendanceReport(
                    value[1]?.format('YYYY-MM-DD') || '',
                  );
                } else {
                  setStartDateAttendanceReport('');
                  setEndDateAttendanceReport('');
                }
              }}
            />
          </div>
        </div>
      </div>

      <Spin spinning={loading}>
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Doughnut Chart */}
          <div className="col-span-12 md:col-span-7 flex justify-center">
            <div className="">
              {attendanceStats?.users?.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500 text-[14px] font-semibold">
                    No Record Found
                  </p>
                </div>
              ) : (
                <div className="w-72 h-72 md:w-[340px] md:h-[340px] pr-8">
                  <Doughnut data={doughnutChartData} options={options} />
                </div>
              )}
            </div>
          </div>

          {/* Attendance List */}

          <div className="space-y-3 col-span-12 md:col-span-5 h-80 overflow-y-auto scrollbar-none">
            {attendanceStats?.users?.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-500 text-[14px] font-semibold">
                  No Record Found
                </p>
              </div>
            ) : (
              attendanceStats?.users?.map((item: any, index: any) => (
                <div
                  key={index}
                  className="bg-white rounded-xl px-4 py-2 border flex items-center justify-between shadow-sm "
                >
                  {/* Left Side */}
                  <div className="flex items-center space-x-3">
                    {item.profileImage ? (
                      <Avatar
                        className="w-7 h-7"
                        src={item.profileImage}
                      ></Avatar>
                    ) : (
                      <Avatar className="w-7 h-7">
                        {item.name.split(' ')[0].charAt(0) +
                          item.name.split(' ')[1].charAt(0)}
                      </Avatar>
                    )}
                    <div>
                      <p className="text-xs font-medium text-gray-800">
                        {item.name}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium inline-block capitalize ${item.status === 'late' ? 'bg-yellow-100 text-yellow-700' : item.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}
                      >
                        {item.status}{' '}
                        {item.status === 'late' || item.status === 'ontime'
                          ? `${item.recordTime}`
                          : ''}
                      </span>
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-700">
                      {`${dayjs(item.lateDate).format('DD MMM YYYY')}`}
                    </p>
                    <div className="mt-1 flex justify-end gap-2">
                      <span className="text-xs bg-yellow-100 text-yellow-700 font-medium px-2 py-0.5 rounded">
                        L: {item.totalLates}
                      </span>
                      <span className="text-xs bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded">
                        A: {item.totalAbsences}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Spin>
    </Card>
  );
};

export default AttendanceReport;
