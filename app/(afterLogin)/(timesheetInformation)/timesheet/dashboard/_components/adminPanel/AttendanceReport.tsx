'use client';

import React, { useState } from 'react';
import { Card, Select, DatePicker, Avatar, Spin, Modal } from 'antd';
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
import CustomButton from '@/components/common/buttons/customButton';
import { LuSettings2 } from 'react-icons/lu';

// Register Chart.js components and plugins
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const { RangePicker } = DatePicker;

const AttendanceReport: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const MobileFilterContent = () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-medium mb-2">Filter</h3>

      {/* Department */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Department</label>
        <Select
          showSearch
          placeholder="Select Department"
          allowClear
          value={departmentOnAttendanceReport}
          className="w-full h-12"
          onChange={(value) => setDepartmentOnAttendanceReport(value)}
          filterOption={(input: any, option: any) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={departmentOptions}
        />
      </div>

      {/* Date Range */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Date Range</label>
        <RangePicker
          allowClear
          className="w-full h-12"
          onChange={(value) => {
            if (value) {
              setStartDateAttendanceReport(value[0]?.format('YYYY-MM-DD') || '');
              setEndDateAttendanceReport(value[1]?.format('YYYY-MM-DD') || '');
            } else {
              setStartDateAttendanceReport('');
              setEndDateAttendanceReport('');
            }
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      <Card title={false} className="min-h-[522px] px-3 ">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4 w-full">
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
              className="w-48 h-14"
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

        {/* Mobile Filters */}
        <div className="md:hidden">
          <div className="flex justify-between gap-4 w-full mb-4">
            <div className="flex-1">
              <Select
                showSearch
                placeholder="Search Employee"
                className="w-full h-10"
                allowClear
                onChange={(value) => setUserIdOnAttendanceReport(value)}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
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

        {/* Content */}
        <Spin spinning={loading}>
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Chart Section */}
            <div className="w-full lg:col-span-7">
              {attendanceStats?.users?.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500 text-sm font-semibold">
                    No Record Found
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-72 h-72 sm:w-80 sm:h-80 relative flex items-center justify-center">
                    <Doughnut data={doughnutChartData} options={options} />
                  </div>
                  {/* Legend */}
                  <div className="flex justify-center gap-6 mt-4">
                    {doughnutChartData.labels.map((label: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          style={{
                            backgroundColor: doughnutChartData.datasets[0].backgroundColor[i],
                          }}
                          className="w-3 h-3 rounded-full"
                        />
                        <span className="text-sm font-medium text-gray-600">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Attendance List */}
            <div className="w-full lg:col-span-5">
              {attendanceStats?.users?.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500 text-sm font-semibold">
                    No Record Found
                  </p>
                </div>
              ) : (
                <div className="space-y-3 h-64 sm:h-96 overflow-y-auto scrollbar-none">
                  {attendanceStats?.users?.map((item: any, index: any) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg px-4 py-3 border flex items-center justify-between hover:shadow-sm transition-shadow"
                    >
                      {/* Left Side */}
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                          {item.profileImage ? (
                            <Avatar
                              className="w-6 h-6 flex-shrink-0"
                              src={item.profileImage}
                            />
                          ) : (
                            <Avatar className="w-6 h-6 text-xs flex-shrink-0">
                              {item.name.split(' ')[0]?.charAt(0) +
                                (item.name.split(' ')[1]?.charAt(0) || '')}
                            </Avatar>
                          )}
                          <p className="text-sm font-medium text-black truncate">
                            {item.name}
                          </p>
                        </div>

                        <div className="ml-8">
                          <span
                            className={`text-xs px-2 py-1.5 rounded-md font-bold inline-block capitalize ${item.status === 'late'
                              ? 'bg-[#FFDE6533] text-[#E6BB20]'
                              : item.status === 'absent'
                                ? 'bg-[#E0313733] text-[#E03137]'
                                : 'bg-indigo-100 text-indigo-700'
                              }`}
                          >
                            {item.status === 'ontime' ? 'On Time' : item.status}{' '}
                            {item.status === 'late' || item.status === 'ontime'
                              ? `${dayjs(item.recordTime, 'HH:mm:ss').format('h:mm A')}`
                              : ''}
                          </span>
                        </div>
                      </div>

                      {/* Right Side */}
                      <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                        <p className="text-sm font-medium text-black">
                          {dayjs(item.attendanceDate).format('MMM DD, YYYY')}
                        </p>
                        <div className="flex gap-2">
                          <span className="text-xs bg-[#FFDE6533] text-[#E6BB20] font-bold px-2 py-1 rounded-md">
                            L: {item.totalLates}
                          </span>
                          <span className="text-xs bg-[#FF575733] text-[#FF5757] font-bold px-2 py-1 rounded-md">
                            A: {item.totalAbsences}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Spin>
      </Card>

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
    </>
  );
};

export default AttendanceReport;
