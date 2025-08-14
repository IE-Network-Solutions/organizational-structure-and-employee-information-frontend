import { useGetUserAttendanceHistory } from '@/store/server/features/timesheet/dashboard/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import { Card, DatePicker, Select, Spin, Tag } from 'antd';
import React from 'react';
import dayjs from 'dayjs';

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

  return (
    <Card bodyStyle={{ padding: '10px 16px' }} className="shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-[16px] font-semibold">My Attendance Report</h3>
        <div className="space-x-2 flex items-center ">
          <Select
            defaultValue="All"
            className="w-32  h-12"
            options={statusOptions}
            onChange={(value) => setStatusOnAttendance(value)}
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
          />
        </div>
      </div>
      <div className="flex flex-col h-48 overflow-y-auto scrollbar-none">
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <Spin />
          </div>
        )}
        {attendanceHistory?.myAttendanceHistory?.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <p className="text-sm text-gray-500 font-semibold">
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
              <div key={req.id} className="mb-2 border p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">
                      {dayjs(req.date).format('DD MMM YYYY')}
                    </p>
                  </div>
                  <div className="flex flex-col justify-end items-end">
                    <Tag
                      style={{ marginInlineEnd: 0, border: 'none' }}
                      className={` py-1 capitalize ${
                        status === 'on time'
                          ? ' text-[#3636F0] bg-[#B2B2FF]/10 font-bold'
                          : status === 'late'
                            ? 'text-[#FFD023] bg-[#FFDE6533] font-bold '
                            : 'text-[#e03137] bg-[#f9d6d7] font-bold'
                      }`}
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
  );
};

export default MyAttendanceReport;
