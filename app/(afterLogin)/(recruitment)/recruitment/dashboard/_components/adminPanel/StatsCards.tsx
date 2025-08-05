import React from 'react';
import { Card } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { useGetRecruitmentDashboard } from '@/store/server/features/recruitment/dashboard/queries';
import { LuBriefcaseBusiness } from 'react-icons/lu';

interface StatData {
  title: string;
  value: number;
  OtherValue: number;
  icon: React.ReactNode;
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
      icon: <TeamOutlined className="text-[#3636F0]" />,
    },

    {
      title: 'Active Job',
      otherTitle: 'Department',
      OtherValue: dashboardData?.departments || 0,
      value: dashboardData?.active_open_jobs || 0,
      icon: <LuBriefcaseBusiness className="text-[#3636F0]" />,
    },

    {
      title: 'Total Participants',
      otherTitle: 'Applied Job',
      OtherValue: dashboardData?.appliedJobs || 0,
      value: dashboardData?.totalCandidates || 0,
      icon: <TeamOutlined className="text-[#3636F0]" />,
    },

    {
      title: 'Hired Candidates',
      otherTitle: 'Department',
      OtherValue: dashboardData?.jobCandidate_Departments || 0,
      value: dashboardData?.hired_totalJobCandidaten || 0,
      icon: <TeamOutlined className="text-[#3636F0]" />,
    },
  ];

  return (
    <div className="mb-6 grid grid-flow-col auto-cols-[248px] sm:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto scrollbar-none">
      {statsData.map((stat, index) => (
        <Card
          bodyStyle={{ padding: 5 }}
          key={index}
          className="h-[102px] hover:shadow-md transition-shadow shadow-lg w-[248px] md:w-full"
          loading={isLoading}
        >
          <div className="flex justify-between mt-4 px-2 items-center">
            <div className="flex flex-col">
              <div className={`flex items-center gap-2`}>
                <span className="w-6 h-6 bg-light_purple rounded-lg flex items-center justify-center ">
                  {stat.icon}
                </span>
                <p className="text-gray-500 text-[10px] mb-1">{stat.title}</p>
              </div>
              <div>
                <p className={`text-[26.5px] font-bold text-center`}>
                  {stat.value}
                </p>
              </div>
            </div>
            <div className="flex flex-col">
              <div className={`flex items-center gap-4`}>
                <p className="text-gray-500 text-[10px] mb-1">
                  {stat.otherTitle}
                </p>
              </div>
              <div>
                <p className={`text-[26.5px] font-bold text-center `}>
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
