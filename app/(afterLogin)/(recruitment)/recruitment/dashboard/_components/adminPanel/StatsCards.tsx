import React from 'react';
import { Card, Skeleton } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { useGetRecruitmentDashboard } from '@/store/server/features/recruitment/dashboard/queries';

interface StatData {
  title: string;
  value: number;
  OtherValue: number;
  icon: React.ReactNode;
  color: string;
  otherTitle: string;
}

const StatsCards: React.FC = () => {
  const { data: statsDatas, isLoading } = useGetRecruitmentDashboard();

  const dashboardData = statsDatas?.dashboard;

  const statsData: StatData[] = [
    {
      title: 'Posted Job',
      otherTitle: 'Department',
      OtherValue: dashboardData?.posted_jobDepartments || 0,
      value: dashboardData?.posted_totalJobs || 0,
      icon: <TeamOutlined className="text-blue" />,
      color: ' text-purple-600',
    },

    {
      title: 'Active Job',
      otherTitle: 'Department',
      OtherValue: dashboardData?.departments || 0,
      value: dashboardData?.active_open_jobs || 0,
      icon: <TeamOutlined className="text-blue" />,
      color: ' text-purple-600',
    },

    {
      title: 'Total Participants',
      otherTitle: 'Applied Job',
      OtherValue: dashboardData?.appliedJobs || 0,
      value: dashboardData?.totalCandidates || 0,
      icon: <TeamOutlined className="text-blue" />,
      color: ' text-purple-600',
    },

    {
      title: 'Hired Candidates',
      otherTitle: 'Department',
      OtherValue: dashboardData?.jobCandidate_Departments || 0,
      value: dashboardData?.hired_totalJobCandidaten || 0,
      icon: <TeamOutlined className="text-blue" />,
      color: ' text-purple-600',
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">

      {statsData.map((stat, index) => (
        <Card
          bodyStyle={{ padding: 10 }}
          key={index}
          className="h-full hover:shadow-md transition-shadow"
          loading={isLoading}
        >
          <div className="flex justify-between">
            <div className="flex flex-col">
              <div className={`flex items-center gap-2`}>
                <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center bg-light_purple">
                  {stat.icon}
                </span>
                <p className="text-gray-500 text-[12px] mb-1">{stat.title}</p>
              </div>
              <div>
                <p className={`text-2xl font-bold text-center  ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </div>
            <div className="flex flex-col">
              <div className={`flex items-center gap-4`}>
                <p className="text-gray-500 text-[12px] mb-1">
                  {stat.otherTitle}
                </p>
              </div>
              <div>
                <p className={`text-2xl font-bold text-center ${stat.color}`}>
                  {stat.OtherValue}
                </p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
