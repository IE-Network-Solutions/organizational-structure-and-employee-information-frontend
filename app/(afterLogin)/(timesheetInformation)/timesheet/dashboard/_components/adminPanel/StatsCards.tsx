import React from 'react';
import Link from 'next/link';
import { Card } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { CiCalendarDate } from 'react-icons/ci';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { GoQuestion } from 'react-icons/go';
import { IoTimeOutline } from 'react-icons/io5';
import { useGetAdminLeaveBalanceDashboard } from '@/store/server/features/timesheet/dashboard/queries';

interface StatData {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  link?: string;
}

const StatsCards: React.FC = () => {
  const { data: adminLeaveBalance, isLoading } =
    useGetAdminLeaveBalanceDashboard();
  const statsData: StatData[] = [
    {
      title: 'Total Employees',
      value: adminLeaveBalance?.totalEmployees,
      icon: <TeamOutlined />,
      color: 'text-purple-600',
      link: '/timesheet/dashboard?employeeAttendance',
    },
    {
      title: 'On Leave',
      value: adminLeaveBalance?.onLeave,
      icon: <CiCalendarDate />,
      color: 'text-blue-600',
    },
    {
      title: 'Late Arrivals',
      value: adminLeaveBalance?.lateArrivals,
      icon: <AiOutlineInfoCircle />,
      color: 'text-yellow-400',
    },
    {
      title: 'Absences',
      value: adminLeaveBalance?.absences,
      icon: <GoQuestion />,
      color: 'text-red-600',
    },
    {
      title: 'Pending Requests',
      value: adminLeaveBalance?.pendingRequests,
      icon: <IoTimeOutline />,
      color: 'text-black',
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      {statsData.map((stat, index) => {
        const cardContent = (
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
                <p className="text-gray-500 font-medium text-[12px] ">
                  {stat.title}
                </p>
              </div>
              <p className={`text-[26.5px] font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          </Card>
        );

        return stat.link ? (
          <Link key={index} href={stat.link}>
            {/* Make sure it's block so it fills the grid cell */}
            <div className="block h-full">{cardContent}</div>
          </Link>
        ) : (
          <div key={index}>{cardContent}</div>
        );
      })}
    </div>
  );
};

export default StatsCards;
