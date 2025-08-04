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
    cutout: '45%',
    plugins: {
      legend: {
        display: false,
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
    <Card title={false} className="h-[522px]">
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center mb-4 gap-4 w-full">
        <p className="text-[16px] text-black font-semibold w-64">
          Attendance report
        </p>

        <div className="flex flex-col sm:flex-row gap-2  sm:items-center">
          <Select
            showSearch
            placeholder="Select employee"
            allowClear
            filterOption={(input: any, option: any) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={employeeOptions}
            maxTagCount={1}
            className="w-[400px] h-14"
            onChange={(value) => setUserIdOnAttendanceReport(value)}
          />

          <Select
            showSearch
            placeholder="Select department"
            allowClear
            filterOption={(input: any, option: any) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={departmentOptions}
            maxTagCount={1}
            className="w-40 h-14"
            onChange={(value) => setDepartmentOnAttendanceReport(value)}
          />

          <RangePicker
            className="w-40 h-14"
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
                <div className=" md:w-[340px] md:h-[340px]  flex justify-center items-center">
                  <Doughnut data={doughnutChartData} options={options} />
                  <div className="flex flex-col gap-0 ml-16">
                    {doughnutChartData.labels.map(
                      (label: string, i: number) => (
                        <div key={i} className="flex items-center mb-1 gap-2">
                          <div
                            style={{
                              backgroundColor:
                                doughnutChartData.datasets[0].backgroundColor[
                                i
                                ],
                            }}
                            className="w-2 h-2 rounded-full mr-2"
                          />
                          <span className="text-xs font-medium text-gray-500">
                            {label}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attendance List */}

          <div className="space-y-3 col-span-12 md:col-span-5 h-96 overflow-y-auto scrollbar-none">
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
                  className="bg-white rounded-xl px-4 min-h-[70px] border flex items-center justify-between  "
                >
                  {/* Left Side */}
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-1">
                      {item.profileImage ? (
                        <Avatar
                          className="w-6 h-6"
                          src={item.profileImage}
                        ></Avatar>
                      ) : (
                        <Avatar className="w-6 h-6 text-[12px]">
                          {item.name.split(' ')[0].charAt(0) +
                            item.name.split(' ')[1].charAt(0)}
                        </Avatar>
                      )}
                      <p className="text-[12px] font-medium ">{item.name}</p>
                    </div>
                    <div>
                      <span
                        className={`text-[12px] px-2 py-1.5 rounded-md font-bold inline-block capitalize ${item.status === 'late' ? 'bg-[#FFDE6533] text-[#E6BB20]' : item.status === 'absent' ? ' bg-[#E0313733] text-[#E03137]' : 'bg-indigo-100 text-indigo-700'}`}
                      >
                        {item.status === 'ontime' ? 'On Time' : item.status}{' '}
                        {item.status === 'late' || item.status === 'ontime'
                          ? `${dayjs(item.recordTime, 'HH:mm:ss').format('hh:mm A')}`
                          : ''}
                      </span>
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex flex-col space-y-2">
                    <p className="text-[16px] font-medium text-black">
                      {`${dayjs(item.attendanceDate).format('DD MMM YYYY')}`}
                    </p>
                    <div className="mt-1 flex justify-end gap-2">
                      <span className="text-xs bg-[#FFDE6533] text-[#E6BB20] font-bold px-2 py-0.5 rounded-md h-6 flex items-center justify-center">
                        L: {item.totalLates}
                      </span>
                      <span className="text-xs bg-[#FF575733] text-[#FF5757] font-bold px-2 py-0.5 rounded-md h-6 flex items-center justify-center">
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
