import React from 'react';
import { Card } from 'antd';
import { CiCalendarDate } from 'react-icons/ci';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { GoQuestion } from 'react-icons/go';
import { IoTimeOutline } from 'react-icons/io5';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetAttendanceStats } from '@/store/server/features/timesheet/dashboard/queries';

interface StatData {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const PersonalStatusCard: React.FC = () => {
  const { userId } = useAuthenticationStore();
  const { data: attendanceStats, isLoading } = useGetAttendanceStats(userId);

  const statsData: StatData[] = [
    {
      title: 'Total Leave Days',
      value: attendanceStats?.data?.yearlyLeaveStats?.totalLeaveDays || '0',
      icon: <CiCalendarDate className="text-blue" />,
      color: ' text-purple-600',
    },
    {
      title: 'Pending Request',
      value:
        attendanceStats?.data?.yearlyLeaveStats?.pendingLeaveRequests || '0',
      icon: <IoTimeOutline className="text-blue" />,
      color: 'text-blue-600',
    },
    {
      title: 'Approved Leave',
      value:
        attendanceStats?.data?.yearlyLeaveStats?.approvedLeaveRequests || '0',
      icon: <CiCalendarDate className="text-blue" />,
      color: ' text-black',
    },
    {
      title: 'Total Late arrival',
      value:
        attendanceStats?.data?.quarterlyAttendanceStats?.totalLateArrivals ||
        '0',
      icon: <AiOutlineInfoCircle className="text-blue" />,
      color: 'text-yellow-400',
    },
    {
      title: 'Absentism',
      value:
        attendanceStats?.quarterlyAttendanceStats?.totalAbsentArrivals || '0',
      icon: <GoQuestion className="text-blue" />,
      color: ' text-red-600',
    },
  ];

  return (
    <div
      className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5"
      id="time-attendance-personal-status-cards-grid-layout"
      data-cy="time-attendance-personal-status-cards-grid-layout"
    >
      {statsData.map((stat, index) => (
        <Card
          key={index}
          bodyStyle={{ padding: 10 }}
          loading={isLoading}
          className="hover:shadow-md transition-shadow cursor-pointer h-[102px] px-1  py-1 shadow-lg"
          id={`time-attendance-personal-status-card-${index}-view-card`}
          data-cy={`time-attendance-personal-status-card-${index}-view-card`}
        >
          <div
            className="flex flex-col"
            id={`time-attendance-personal-status-card-${index}-content-column`}
            data-cy={`time-attendance-personal-status-card-${index}-content-column`}
          >
            <div
              className="flex items-center gap-4 mb-3"
              id={`time-attendance-personal-status-card-${index}-header-row`}
              data-cy={`time-attendance-personal-status-card-${index}-header-row`}
            >
              <span
                className="w-6 h-6 text-[#3636F0] rounded-sm flex items-center justify-center bg-[#f8f6fe]"
                id={`time-attendance-personal-status-card-${index}-icon-indicator`}
                data-cy={`time-attendance-personal-status-card-${index}-icon-indicator`}
              >
                {stat.icon}
              </span>
              <p
                className="text-gray-500 text-[12px] "
                id={`time-attendance-personal-status-card-${index}-title-label`}
                data-cy={`time-attendance-personal-status-card-${index}-title-label`}
              >
                {stat.title}
              </p>
            </div>
            <p
              className={`text-[26.5px] font-bold ${stat.color}`}
              id={`time-attendance-personal-status-card-${index}-value-label`}
              data-cy={`time-attendance-personal-status-card-${index}-value-label`}
            >
              {stat.value}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PersonalStatusCard;
