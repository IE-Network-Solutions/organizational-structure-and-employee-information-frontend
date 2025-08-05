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
    <div className="mb-6 grid grid-flow-col auto-cols-[200px] sm:grid-cols-2 lg:grid-cols-5 gap-5 overflow-x-auto scrollbar-none">
      {statsData.map((stat, index) => (
        <Card
          key={index}
          bodyStyle={{ padding: 10 }}
          loading={isLoading}
          className="hover:shadow-md transition-shadow cursor-pointer h-[102px] px-1  py-1 shadow-lg"
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-4 mb-3">
              <span className="w-6 h-6 text-[#3636F0] rounded-sm flex items-center justify-center bg-[#f8f6fe]">
                {stat.icon}
              </span>
              <p className="text-gray-500 text-[12px] ">{stat.title}</p>
            </div>
            <p className={`text-[26.5px] font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PersonalStatusCard;
