'use client';
import { Col, Row, Select, Space } from 'antd';
import React from 'react';
import { BsAwardFill } from 'react-icons/bs';
import { FaBomb } from 'react-icons/fa';
import RookStarsList from '../../../(okr)/_components/rookStarsList';
import { CardData, ListData, SelectData } from '@/types/dashboard/okr';
import DashboardCard from '../../../(okr)/_components/displayCard';
import { GoGoal } from 'react-icons/go';
import { MdOutlineKey } from 'react-icons/md';
import PerformanceChart from '../../../(okr)/_components/performanceChart';
import CustomBreadcrumb from '@/components/common/breadCramp';
import ProgressCard from '@/app/(afterLogin)/(okr)/_components/achievementCard';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetUserObjectiveDashboard } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import ObjectiveKeyResult from './_components/objectiveKeyResult';
import Performance from './_components/Performance';

const listData: ListData[] = [
  {
    key: '1',
    name: 'Samuel Anteneh',
    title: 'Software Engineer',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1',
    completion: 95,
  },
  {
    key: '2',
    name: 'John Doe',
    title: 'Project Manager',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=2',
    completion: 92,
  },
  {
    key: '3',
    name: 'Jane Smith',
    title: 'UI/UX Designer',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=3',
    completion: 96,
  },
  {
    key: '4',
    name: 'Emily Johnson',
    title: 'Product Owner',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=4',
    completion: 98,
  },
  {
    key: '5',
    name: 'Michael Brown',
    title: 'DevOps Engineer',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=5',
    completion: 94,
  },
];

const cardData = {
  key: 'weeklyScore',
  name: 'Samuel Anteneh',
  position: 'Software Engineer',
  department: 'Software development',

  okr: {
    score: '82 ',
    progress: '48 ',
    progressType: true,
  },
  vp: {
    score: '30 ',
    progress: '70 ',
    progressType: true,
  },
  supervisorOkr: {
    score: '78 ',
    progress: '25',
    progressType: true,
  },
  keyResults: {
    score: '565 ',
    progress: '80 ',
    progressType: true,
    achievement: '120',
  },
  issuedReprimand: {
    score: '9 ',
    progress: '50 ',
    progressType: false,
  },
  receiveReprimand: {
    score: '3',
    progress: '10 ',
    progressType: false,
  },
  issuedAppreciations: {
    score: '20 ',
    progress: '80 ',
    progressType: true,
  },
  receiveAppreciations: {
    score: '14 ',
    progress: '90 ',
    progressType: false,
  },
  updatedAt: 'Sep 18, 2024',
};

const Dashboard: React.FC<any> = () => {
  const { revenue, financialSales, progressRevenue, progressSales } =
    useOKRStore();

  return (
    <div className="h-auto w-full p-4 bg-white rounded-md">
      <CustomBreadcrumb
        title="Dashboard"
        subtitle="Employee’s OKR dashboards view"
      />
      <ObjectiveKeyResult />
      <Performance />
      <div className="flex justify-between">
        <div className="text-xl font-bold">Achievement</div>
      </div>
      <div className="flex">
        <div className="w-full mr-3 flex flex-col gap-5">
          <Row gutter={[16, 16]} className="w-full max-w-screen-xl">
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <ProgressCard
                title="Revenue"
                amount={revenue}
                progress={progressRevenue}
                totalAmount={revenue * 2}
              />
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <ProgressCard
                title="Financial Sales"
                amount={financialSales}
                progress={financialSales}
                totalAmount={progressSales}
              />
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
