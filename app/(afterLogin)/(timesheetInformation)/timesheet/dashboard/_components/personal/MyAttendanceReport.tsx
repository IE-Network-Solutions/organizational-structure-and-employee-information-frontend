import { useGetUserAttendanceHistory } from '@/store/server/features/timesheet/dashboard/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import { Card, DatePicker, Select, Spin, Tag, Modal } from 'antd';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import CustomButton from '@/components/common/buttons/customButton';
import { LuSettings2 } from 'react-icons/lu';

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
      <Card bodyStyle={{ padding: 0 }} className="shadow-sm">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-between items-center gap-4">
              <h3 className="text-base sm:text-lg font-semibold">
                My Attendance report
              </h3>

              {/* Desktop Filters */}
              <div className="hidden sm:flex space-x-3 items-center">
                <Select
                  placeholder="Status"
                  allowClear
                  value={statusOnAttendance}
                  className="w-32 h-12"
                  options={statusOptions}
                  onChange={(value) => setStatusOnAttendance(value)}
                />
                <RangePicker
                  className="w-40 h-12"
                  allowClear
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

              {/* Mobile Filter Button */}
              <div className="sm:hidden self-end">
                <CustomButton
                  type="default"
                  size="small"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1 border rounded-lg h-8"
                  title=""
                  icon={<LuSettings2 size={16} />}
                />
              </div>
            </div>

            {/* Attendance Records */}
            <div className="space-y-3 h-48 overflow-y-auto scrollbar-none">
              {isLoading && (
                <div className="flex justify-center items-center h-32">
                  <Spin />
                </div>
              )}
              {!isLoading &&
                attendanceHistory?.myAttendanceHistory?.length === 0 && (
                  <div className="flex justify-center items-center h-32">
                    <p className="text-sm text-gray-500 font-semibold">
                      No attendance history found
                    </p>
                  </div>
                )}
              {!isLoading &&
                attendanceHistory?.myAttendanceHistory?.map(
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
                        className="border border-gray-200 p-4 rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-sm sm:text-base text-black">
                              {dayjs(req.date).format('DD MMM YYYY')}
                            </p>
                          </div>
                          <div>
                            <Tag
                              style={{ marginInlineEnd: 0, border: 'none' }}
                              className={`px-3 py-1 rounded-md font-bold text-xs capitalize ${
                                status === 'on time'
                                  ? 'text-[#3636F0] bg-[#B2B2FF]'
                                  : status === 'late'
                                    ? 'text-[#FFD023] bg-[#FFDE6533]'
                                    : 'text-[#e03137] bg-[#f9d6d7]'
                              }`}
                            >
                              {status === 'on time'
                                ? 'On Time'
                                : status === 'late'
                                  ? 'Late'
                                  : 'Absent'}
                              {req.startTime &&
                                ` ${dayjs(req.startTime).format('h:mm A')}`}
                            </Tag>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
            </div>
          </div>
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
