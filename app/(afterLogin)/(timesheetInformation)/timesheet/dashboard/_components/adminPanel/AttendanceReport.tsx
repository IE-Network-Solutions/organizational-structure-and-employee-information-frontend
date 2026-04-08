'use client';

import React, { useState } from 'react';
import { Avatar, Card, DatePicker, Modal, Select, Skeleton } from 'antd';
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
    <div
      className="flex flex-col gap-4"
      data-cy="time-attendance-attendance-report-mobile-filter-content-div"
    >
      <h3
        className="text-lg font-medium mb-2"
        data-cy="time-attendance-attendance-report-mobile-filter-title-h3"
      >
        Filter
      </h3>

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
        data-cy="time-attendance-attendance-report-mobile-filter-department-select"
      />

      <RangePicker
        className="w-48 h-14"
        onChange={(value) => {
          if (value) {
            setStartDateAttendanceReport(value[0]?.format('YYYY-MM-DD') || '');
            setEndDateAttendanceReport(value[1]?.format('YYYY-MM-DD') || '');
          } else {
            setStartDateAttendanceReport('');
            setEndDateAttendanceReport('');
          }
        }}
        data-cy="time-attendance-attendance-report-mobile-filter-date-range-picker"
      />
    </div>
  );

  return (
    <>
      <Card
        title={false}
        className="h-[522px]"
        id="time-attendance-attendance-report-layout-card"
        data-cy="time-attendance-attendance-report-layout-card"
      >
        <div
          className="flex flex-col sm:flex-row justify-between items-center sm:items-center mb-4 gap-4 w-full"
          id="time-attendance-attendance-report-header-div"
          data-cy="time-attendance-attendance-report-header-div"
        >
          <p
            className="text-[16px] text-black font-semibold w-64"
            id="time-attendance-attendance-report-title-text"
            data-cy="time-attendance-attendance-report-title-text"
          >
            Attendance report
          </p>

          <div
            className="flex flex-col sm:flex-row gap-2  sm:items-center"
            id="time-attendance-attendance-report-filter-container-div"
            data-cy="time-attendance-attendance-report-filter-container-div"
          >
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
              id="time-attendance-attendance-report-employee-select"
              data-cy="time-attendance-attendance-report-employee-select"
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
              id="time-attendance-attendance-report-department-select"
              data-cy="time-attendance-attendance-report-department-select"
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
              id="time-attendance-attendance-report-date-range-picker"
              data-cy="time-attendance-attendance-report-date-range-picker"
            />
          </div>
        </div>

        {/* Mobile Filters */}
        <div
          className="md:hidden"
          data-cy="time-attendance-attendance-report-mobile-filters-div"
        >
          <div
            className="flex justify-between gap-4 w-full mb-4 "
            data-cy="time-attendance-attendance-report-mobile-filters-row-div"
          >
            <div
              className="flex-1"
              data-cy="time-attendance-attendance-report-mobile-filters-employee-select-div"
            >
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
                data-cy="time-attendance-attendance-report-mobile-filters-employee-select"
              />
            </div>
            <div data-cy="time-attendance-attendance-report-mobile-filters-settings-button-div">
              <CustomButton
                type="default"
                size="small"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg h-10"
                title=""
                icon={<LuSettings2 size={20} />}
                data-cy="time-attendance-attendance-report-mobile-filters-settings-button"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <Skeleton
          loading={loading}
          active
          data-cy="time-attendance-attendance-report-loading-spin"
        >
          <div
            className="grid grid-cols-12 gap-6 items-start"
            id="time-attendance-attendance-report-grid-container-div"
            data-cy="time-attendance-attendance-report-grid-container-div"
          >
            {/* Doughnut Chart */}
            <div
              className="col-span-12 md:col-span-7 flex justify-center"
              id="time-attendance-attendance-report-chart-panel-div"
              data-cy="time-attendance-attendance-report-chart-panel-div"
            >
              <div
                className=""
                id="time-attendance-attendance-report-chart-wrapper-div"
                data-cy="time-attendance-attendance-report-chart-wrapper-div"
              >
                {attendanceStats?.users?.length === 0 ? (
                  <div
                    className="flex justify-center items-center h-64"
                    data-cy="time-attendance-attendance-report-chart-empty-div"
                  >
                    <p
                      className="text-gray-500 text-[14px] font-semibold"
                      data-cy="time-attendance-attendance-report-chart-empty-text"
                    >
                      No Record Found
                    </p>
                  </div>
                ) : (
                  <div
                    className=" md:w-[340px] md:h-[340px] w-80 h-80 flex md:flex-row flex-col justify-center items-center md:mt-0 mt-4"
                    data-cy="time-attendance-attendance-report-chart-content-div"
                  >
                    {/* <div className="w-72 h-72 sm:w-80 sm:h-80 relative flex items-center justify-center"> */}

                    <Doughnut
                      data={doughnutChartData}
                      options={options}
                      data-cy="time-attendance-attendance-report-chart-doughnut"
                    />
                    <div
                      className="flex md:flex-col md:ml-16 ml-0 md:gap-0 gap-4 md:mt-0 mt-4"
                      data-cy="time-attendance-attendance-report-chart-legend-div"
                    >
                      {doughnutChartData.labels.map(
                        (label: string, i: number) => (
                          <div
                            key={i}
                            className="flex items-center mb-1 gap-2"
                            data-cy={`time-attendance-attendance-report-chart-legend-item-${i}-div`}
                          >
                            <div
                              style={{
                                backgroundColor:
                                  doughnutChartData.datasets[0].backgroundColor[
                                    i
                                  ],
                              }}
                              className="w-2 h-2 rounded-full mr-2"
                              data-cy={`time-attendance-attendance-report-chart-legend-item-${i}-color-dot`}
                            />
                            <span
                              className="text-xs font-medium text-gray-500"
                              data-cy={`time-attendance-attendance-report-chart-legend-item-${i}-label`}
                            >
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
            <div
              className="space-y-3 col-span-12 md:col-span-5 h-96 overflow-y-auto scrollbar-none"
              id="time-attendance-attendance-report-list-panel-div"
              data-cy="time-attendance-attendance-report-list-panel-div"
            >
              {attendanceStats?.users?.length === 0 ? (
                <div
                  className="flex justify-center items-center h-64"
                  id="time-attendance-attendance-report-list-empty-div"
                  data-cy="time-attendance-attendance-report-list-empty-div"
                >
                  <p
                    className="text-gray-500 text-[14px] font-semibold"
                    id="time-attendance-attendance-report-list-empty-text"
                    data-cy="time-attendance-attendance-report-list-empty-text"
                  >
                    No Record Found
                  </p>
                </div>
              ) : (
                attendanceStats?.users?.map((item: any, index: any) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl md:px-4 px-2 min-h-[70px] border flex items-center justify-between"
                    id={`time-attendance-attendance-report-record-${index}-container-div`}
                    data-cy={`time-attendance-attendance-report-record-${index}-container-div`}
                  >
                    {/* Left Side */}
                    <div
                      className="flex flex-col space-y-1"
                      id={`time-attendance-attendance-report-record-${index}-left-column`}
                      data-cy={`time-attendance-attendance-report-record-${index}-left-column`}
                    >
                      <div
                        className="flex items-center gap-1"
                        id={`time-attendance-attendance-report-record-${index}-profile-row`}
                        data-cy={`time-attendance-attendance-report-record-${index}-profile-row`}
                      >
                        {item.profileImage ? (
                          <Avatar
                            className="w-6 h-6"
                            src={item.profileImage}
                            data-cy={`time-attendance-attendance-report-record-${index}-avatar-image`}
                          />
                        ) : (
                          <Avatar
                            className="w-6 h-6 text-[12px]"
                            data-cy={`time-attendance-attendance-report-record-${index}-avatar-fallback`}
                          >
                            {item.name.split(' ')[0].charAt(0) +
                              item.name.split(' ')[1].charAt(0)}
                          </Avatar>
                        )}
                        <p
                          className="text-[12px] font-medium"
                          id={`time-attendance-attendance-report-record-${index}-name-text`}
                          data-cy={`time-attendance-attendance-report-record-${index}-name-text`}
                        >
                          {item.name}
                        </p>
                      </div>

                      <div
                        id={`time-attendance-attendance-report-record-${index}-status-container-div`}
                        data-cy={`time-attendance-attendance-report-record-${index}-status-container-div`}
                      >
                        <span
                          className={`text-[12px] px-2 py-1.5 rounded-md font-bold inline-block capitalize ${item.status === 'late' ? 'bg-[#FFDE6533] text-[#E6BB20]' : item.status === 'absent' ? ' bg-[#E0313733] text-[#E03137]' : 'bg-indigo-100 text-indigo-700'}`}
                          id={`time-attendance-attendance-report-record-${index}-status-pill`}
                          data-cy={`time-attendance-attendance-report-record-${index}-status-pill`}
                        >
                          {item.status === 'ontime' ? 'On Time' : item.status}{' '}
                          {item.status === 'late' || item.status === 'ontime'
                            ? `${dayjs(item.recordTime, 'HH:mm:ss').format('hh:mm A')}`
                            : ''}
                        </span>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div
                      className="flex flex-col space-y-2"
                      id={`time-attendance-attendance-report-record-${index}-right-column`}
                      data-cy={`time-attendance-attendance-report-record-${index}-right-column`}
                    >
                      <p
                        className="text-[16px] font-medium text-black"
                        id={`time-attendance-attendance-report-record-${index}-date-text`}
                        data-cy={`time-attendance-attendance-report-record-${index}-date-text`}
                      >
                        {`${dayjs(item.attendanceDate).format('DD MMM YYYY')}`}
                      </p>
                      <div
                        className="mt-1 flex justify-end gap-2"
                        id={`time-attendance-attendance-report-record-${index}-metrics-row`}
                        data-cy={`time-attendance-attendance-report-record-${index}-metrics-row`}
                      >
                        <span
                          className="text-xs bg-[#FFDE6533] text-[#E6BB20] font-bold px-2 py-0.5 rounded-md h-6 flex items-center justify-center"
                          id={`time-attendance-attendance-report-record-${index}-lates-pill`}
                          data-cy={`time-attendance-attendance-report-record-${index}-lates-pill`}
                        >
                          L: {item.totalLates}
                        </span>
                        <span
                          className="text-xs bg-[#FF575733] text-[#FF5757] font-bold px-2 py-0.5 rounded-md h-6 flex items-center justify-center"
                          id={`time-attendance-attendance-report-record-${index}-absences-pill`}
                          data-cy={`time-attendance-attendance-report-record-${index}-absences-pill`}
                        >
                          A: {item.totalAbsences}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Skeleton>
      </Card>

      {/* Mobile Filter Modal */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={
          <div
            className="flex gap-2 justify-center mt-4"
            data-cy="time-attendance-attendance-report-mobile-filter-modal-footer-div"
          >
            <CustomButton
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 border rounded-lg text-sm text-gray-900"
              title="Cancel"
              type="default"
              data-cy="time-attendance-attendance-report-mobile-filter-modal-cancel-button"
            />
            <CustomButton
              title="Apply Filter"
              type="primary"
              onClick={() => {
                setIsModalOpen(false);
              }}
              className="px-6 py-2 text-white rounded-lg text-sm"
              data-cy="time-attendance-attendance-report-mobile-filter-modal-apply-button"
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
        data-cy="time-attendance-attendance-report-mobile-filter-modal"
      >
        <MobileFilterContent />
      </Modal>
    </>
  );
};

export default AttendanceReport;
