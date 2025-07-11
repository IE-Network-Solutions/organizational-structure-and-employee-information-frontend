import React from 'react';
import { Card } from 'antd';
import { CiCalendarDate } from 'react-icons/ci';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { GoQuestion } from 'react-icons/go';
import { IoTimeOutline } from 'react-icons/io5';

interface StatData {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const PersonalStatusCard: React.FC = () => {
  const statsData: StatData[] = [
    {
      title: 'Total Leave Days',
      value: '206',
      icon: <CiCalendarDate className="text-blue" />,
      color: ' text-purple-600',
    },
    {
      title: 'Pending Request',
      value: '8',
      icon: <IoTimeOutline className="text-blue" />,
      color: 'text-blue-600',
    },
    {
      title: 'Approved Leave',
      value: '32',
      icon: <CiCalendarDate className="text-blue" />,
      color: ' text-black',
    },
    {
      title: 'Total Late arrival',
      value: '2',
      icon: <AiOutlineInfoCircle className="text-blue" />,
      color: 'text-yellow-400',
    },
    {
      title: 'Absentism',
      value: '10',
      icon: <GoQuestion className="text-blue" />,
      color: ' text-red-600',
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
      {statsData.map((stat, index) => (
        <Card
          bodyStyle={{ padding: 10 }}
          key={index}
          className="h-full hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col">
            <div className={`flex items-center gap-2`}>
              <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center bg-light_purple">
                {stat.icon}
              </span>
              <p className="text-gray-500 text-[12px] mb-1">{stat.title}</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PersonalStatusCard;
