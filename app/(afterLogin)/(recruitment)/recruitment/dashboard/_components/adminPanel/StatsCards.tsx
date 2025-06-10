import React from 'react';
import { Card } from 'antd';
import { UserOutlined, CalendarOutlined, ClockCircleOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import { CiCalendarDate } from 'react-icons/ci';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { GoQuestion } from 'react-icons/go';
import { IoTimeOutline } from 'react-icons/io5';

interface StatData {
    title: string;
    value: string;
    OtherValue: string;
    icon: React.ReactNode;
    color: string;
    otherTitle:string
}

const StatsCards: React.FC = () => {
    const statsData: StatData[] = [
        { title: 'Posted Job',otherTitle:"Department",OtherValue:"6", value: '206', icon: <TeamOutlined className='text-blue' />, color: ' text-purple-600' },
      
        { title: 'Active Job',otherTitle:"Department",OtherValue:"6", value: '206', icon: <TeamOutlined className='text-blue' />, color: ' text-purple-600' },
      
        { title: 'Total Participants',otherTitle:"Applied Job",OtherValue:"6", value: '206', icon: <TeamOutlined className='text-blue' />, color: ' text-purple-600' },
      
        { title: 'Hired Candidates',otherTitle:"Department",OtherValue:"6", value: '206', icon: <TeamOutlined className='text-blue' />, color: ' text-purple-600' },
        
    ];

    return (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {statsData.map((stat, index) => (
                <Card bodyStyle={{ padding: 10 }} key={index} className="h-full hover:shadow-md transition-shadow ">
                    <div className='flex justify-between'>
                      <div className="flex flex-col">
                        <div className={`flex items-center gap-2`}>
                            <span className='w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center bg-light_purple'>{stat.icon}</span>
                            <p className="text-gray-500 text-[12px] mb-1">{stat.title}</p>
                        </div>
                        <div>

                            <p className={`text-2xl font-bold text-center  ${stat.color}`}>{stat.value}</p>
                        </div>

                    </div>
                    <div className="flex flex-col">
                        <div className={`flex items-center gap-4`}>
                            <p className="text-gray-500 text-[12px] mb-1">{stat.otherTitle}</p>
                        </div>
                        <div>

                            <p className={`text-2xl font-bold text-center ${stat.color}`}>{stat.OtherValue}</p>
                        </div>

                    </div>   
                    </div>
                   
                </Card>
            ))}
        </div>
    );
};

export default StatsCards;
