import { useGetUserAttendanceHistory } from '@/store/server/features/timesheet/dashboard/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import { Card, DatePicker, Select, Spin, Tag, Modal } from 'antd';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import CustomButton from '@/components/common/buttons/customButton';

const { RangePicker } = DatePicker;

interface AttendanceHistory {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  isAbsent: boolean;
  isOnGoing: boolean;
  lateByMinutes: number;
  earlyByMinutes: number;
  overTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

const MyAttendanceReport: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userId } = useAuthenticationStore();
  const {
    statusOnAttendance,
    setStatusOnAttendance,
    startDateOnAttendance,
    setStartDateOnAttendance,
    endDateOnAttendance,
    setEndDateOnAttendance,
  } = TimeAndAttendaceDashboardStore();

  const { data: attendanceHistory, isLoading } = useGetUserAttendanceHistory(
    userId,
    {
      status: statusOnAttendance,
      startDate: startDateOnAttendance,
      endDate: endDateOnAttendance,
    },
  );

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'on time', label: 'On Time' },
    { value: 'late', label: 'Late' },
    { value: 'absent', label: 'Absent' },
  ];

  const MobileFilterContent = () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-medium mb-2">Filter</h3>

      {/* Status Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Status</label>
        <Select
          placeholder="Select Status"
          allowClear
          value={statusOnAttendance}
          className="w-full h-12"
          onChange={(value) => setStatusOnAttendance(value)}
          options={statusOptions}
        />
      </div>

      {/* Date Range */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Date Range</label>
        <RangePicker
          allowClear
          className="w-full h-12"
          onChange={(value) => {
            if (value && value[0] && value[1]) {
              setStartDateOnAttendance(value[0].format('YYYY-MM-DD'));
              setEndDateOnAttendance(value[1].format('YYYY-MM-DD'));
            } else {
              setStartDateOnAttendance('');
              setEndDateOnAttendance('');
            }
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="px-3 sm:px-0">
       <Card
      bodyStyle={{ padding: '10px 16px' }}
      className="shadow"
      id="time-attendance-personal-attendance-report-card"
      data-cy="time-attendance-personal-attendance-report-card"
    >
      <div
        className="flex justify-between items-center mb-2"
        id="time-attendance-personal-attendance-report-header-row"
        data-cy="time-attendance-personal-attendance-report-header-row"
      >
        <h3
          className="text-[16px] font-semibold"
          id="time-attendance-personal-attendance-report-title-heading"
          data-cy="time-attendance-personal-attendance-report-title-heading"
        >
          My Attendance Report
        </h3>
        <div
          className="space-x-2 flex items-center "
          id="time-attendance-personal-attendance-report-filter-row"
          data-cy="time-attendance-personal-attendance-report-filter-row"
        >
          <Select
            defaultValue="All"
            className="w-32  h-12"
            options={statusOptions}
            onChange={(value) => setStatusOnAttendance(value)}
            id="time-attendance-personal-attendance-report-status-select"
            data-cy="time-attendance-personal-attendance-report-status-select"
          />

          <RangePicker
            className="w-32  h-12"
            allowClear
            onChange={(value) => {
              if (value && value[0] && value[1]) {
                setStartDateOnAttendance(value[0].format('YYYY-MM-DD'));
                setEndDateOnAttendance(value[1].format('YYYY-MM-DD'));
              }
            }}
            id="time-attendance-personal-attendance-report-range-picker"
            data-cy="time-attendance-personal-attendance-report-range-picker"
          />
        </div>
      </div>
      <div
        className="flex flex-col h-48 overflow-y-auto scrollbar-none"
        id="time-attendance-personal-attendance-report-list-scroll"
        data-cy="time-attendance-personal-attendance-report-list-scroll"
      >
        {isLoading && (
          <div
            className="flex justify-center items-center h-full"
            id="time-attendance-personal-attendance-report-loading-state"
            data-cy="time-attendance-personal-attendance-report-loading-state"
          >
            <Spin data-cy="time-attendance-personal-attendance-report-loading-spin" />
          </div>
        )}
        {attendanceHistory?.myAttendanceHistory?.length === 0 && (
          <div
            className="flex justify-center items-center h-full"
            id="time-attendance-personal-attendance-report-empty-state"
            data-cy="time-attendance-personal-attendance-report-empty-state"
          >
            <p
              className="text-sm text-gray-500 font-semibold"
              id="time-attendance-personal-attendance-report-empty-text"
              data-cy="time-attendance-personal-attendance-report-empty-text"
            >
              No attendance history found
            </p>
          </div>
        )}
        {attendanceHistory?.myAttendanceHistory?.map(
          (req: AttendanceHistory) => {
            let status = 'on time';
            if (req.isAbsent) {
              status = 'absent';
            } else if (req.lateByMinutes > 0) {
              status = 'late';
            }
            return (
              <div
                key={req.id}
                className="mb-2 border p-4 rounded-md"
                id={`time-attendance-personal-attendance-report-record-${req.id}`}
                data-cy={`time-attendance-personal-attendance-report-record-${req.id}`}
              >
                <div
                  className="flex justify-between items-center"
                  id={`time-attendance-personal-attendance-report-record-${req.id}-content-row`}
                  data-cy={`time-attendance-personal-attendance-report-record-${req.id}-content-row`}
                >
                  <div
                    id={`time-attendance-personal-attendance-report-record-${req.id}-details-column`}
                    data-cy={`time-attendance-personal-attendance-report-record-${req.id}-details-column`}
                  >
                    <p
                      className="font-semibold text-sm"
                      id={`time-attendance-personal-attendance-report-record-${req.id}-date-text`}
                      data-cy={`time-attendance-personal-attendance-report-record-${req.id}-date-text`}
                    >
                      {dayjs(req.date).format('DD MMM YYYY')}
                    </p>
                  </div>
                  <div
                    className="flex flex-col justify-end items-end"
                    id={`time-attendance-personal-attendance-report-record-${req.id}-status-column`}
                    data-cy={`time-attendance-personal-attendance-report-record-${req.id}-status-column`}
                  >
                    <Tag
                      style={{ marginInlineEnd: 0, border: 'none' }}
                      className={` py-1 capitalize ${
                        status === 'on time'
                          ? ' text-[#3636F0] bg-[#B2B2FF]/10 font-bold'
                          : status === 'late'
                            ? 'text-[#e6bb20] bg-[#fffdf7]  font-bold  '
                            : 'text-[#e13c42] bg-[#fdf4f5] font-bold'
                      }`}
                      id={`time-attendance-personal-attendance-report-record-${req.id}-status-tag`}
                      data-cy={`time-attendance-personal-attendance-report-record-${req.id}-status-tag`}
                    >
                      {status}{' '}
                      {req.startTime && dayjs(req.startTime).format('h:mm A')}
                    </Tag>{' '}
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>
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
        className="!m-4 sm:hidden"
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
    </div>
  );
};

export default MyAttendanceReport;
