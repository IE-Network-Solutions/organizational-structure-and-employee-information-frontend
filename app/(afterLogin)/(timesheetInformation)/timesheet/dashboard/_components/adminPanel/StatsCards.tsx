import React from 'react';
import Link from 'next/link';
import { Card } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { CiCalendarDate } from 'react-icons/ci';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { GoQuestion } from 'react-icons/go';
import { IoTimeOutline } from 'react-icons/io5';

interface StatData {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  link?: string;
}

const StatsCards: React.FC = () => {
  const statsData: StatData[] = [
    {
      title: 'Total Employees',
      value: '206',
      icon: <TeamOutlined />,
      color: 'text-purple-600',
      link: '/timesheet/dashboard?employeeAttendance',
    },
    {
      title: 'On Leave',
      value: '8',
      icon: <CiCalendarDate />,
      color: 'text-blue-600',
    },
    {
      title: 'Late Arrivals',
      value: '32',
      icon: <AiOutlineInfoCircle />,
      color: 'text-yellow-400',
    },
    {
      title: 'Absences',
      value: '2',
      icon: <GoQuestion />,
      color: 'text-red-600',
    },
    {
      title: 'Pending Requests',
      value: '10',
      icon: <IoTimeOutline />,
      color: 'text-black',
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
      {statsData.map((stat, index) => {
        const cardContent = (
          <Card
            key={index}
            bodyStyle={{ padding: 10 }}
            className="hover:shadow-md transition-shadow cursor-pointer h-full"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-4">
                <span className="w-6 h-6 text-purple rounded-lg flex items-center justify-center bg-light_purple">
                  {stat.icon}
                </span>
                <p className="text-gray-500 text-[12px] mb-1">{stat.title}</p>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
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
