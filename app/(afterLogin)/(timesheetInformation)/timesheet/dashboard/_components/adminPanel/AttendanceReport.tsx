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
              setStartDateAttendanceReport(
                value[0]?.format('YYYY-MM-DD') || '',
              );
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
      <Card
        bodyStyle={{ padding: '0px' }}
        title={false}
        className="min-h-[522px] md:p-4   p-0 h-full shadow-md px-3 sm:px-5 py-4"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4 w-full">
          <p className="text-[16px] text-black font-semibold w-64">
            Attendance report
          </p>

          <div className="md:flex flex-col sm:flex-row gap-2  sm:items-center hidden">
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
              className="w-[400px] h-14"
              onChange={(value) => setUserIdOnAttendanceReport(value)}
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
          <div className="flex justify-between gap-4 w-full mb-4 ">
            <div className="flex-1">
              <Select
                showSearch
                placeholder="Search Employee"
                className="w-full h-12"
                allowClear
                onChange={(value) => setUserIdOnAttendanceReport(value)}
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

        {/* Content */}
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
                  <div className=" md:w-[340px] md:h-[340px] w-80 h-80 flex md:flex-row flex-col justify-center items-center md:mt-0 mt-4">
                    {/* <div className="w-72 h-72 sm:w-80 sm:h-80 relative flex items-center justify-center"> */}

                    <Doughnut data={doughnutChartData} options={options} />
                    <div className="flex md:flex-col gap-0 md:ml-16 ml-0   flex row md:gap-0 gap-4 md:mt-0 mt-4">
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
                    className="bg-white rounded-xl md:px-4 px-2 min-h-[70px] border flex items-center justify-between  "
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
