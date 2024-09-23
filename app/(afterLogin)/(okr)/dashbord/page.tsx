'use client';
import { Row, Select, Space } from 'antd';
import React from 'react';
import { BsAwardFill } from 'react-icons/bs';
import { FaBomb } from 'react-icons/fa';
import RookStarsList from '../_components/rookStarsList';
import { CardData, ListData, selectData } from '@/types/dashboard/okr';
import DashboardCard from '../_components/displayCard';
import { GoGoal } from 'react-icons/go';
import { MdOutlineKey } from 'react-icons/md';
import PerformanceChart from '../_components/performanceChart';

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

const cardData: CardData = {
  key: 'weeklyScore',
  name: 'Samuel Anteneh',
  position: 'Software Engineer',
  department: 'Software development',

  okr: {
    score: '82 ',
    progress: '48 ',
    progress_type: true,
  },
  vp: {
    score: '30 ',
    progress: '70 ',
    progress_type: true,
  },
  supervisorOkr: {
    score: '78 ',
    progress: '25',
    progress_type: true,
  },
  keyResults: {
    score: '565 ',
    progress: '80 ',
    progress_type: true,
    achievement: '120',
  },
  issuedReprimand: {
    score: '9 ',
    progress: '50 ',
    progress_type: false,
  },
  receiveReprimand: {
    score: '3',
    progress: '10 ',
    progress_type: false,
  },
  issuedAppreciations: {
    score: '20 ',
    progress: '80 ',
    progress_type: true,
  },
  receiveAppreciations: {
    score: '14 ',
    progress: '90 ',
    progress_type: false,
  },
  updatedAt: 'Sep 18, 2024',
};
const items: selectData[] = [
  { key: '1', value: 'weekly', label: 'Weekly' },
  { key: '2', value: 'monthly', label: 'Monthly' },
  { key: '3', value: 'quarterly', label: 'Quarterly' },
];

const Dashboard: React.FC<any> = () => {
  return (
    <div>
      <div className="mb-10">
        <div className="text-2xl font-bold ">DashBoard</div>
        <div className="text-lg font-light">Employee’s OKR dashboards view</div>
      </div>
      <div className="flex justify-center my-4 w-full">
        <Row gutter={16} className="w-full max-w-screen-xl">
          <DashboardCard
            score={cardData?.okr}
            updatedAt={cardData?.updatedAt}
            title="Average OKR Score"
            icon={<GoGoal className="text-[#7152F3]" />}
            span={8}
            isTop
          />
          <DashboardCard
            score={cardData?.keyResults}
            updatedAt={cardData?.updatedAt}
            title="total key result"
            icon={<MdOutlineKey className="text-[#7152F3]" />}
            span={8}
            isTop
            cardColor="bg-[#e9e9ff]"
          />
          <DashboardCard
            score={cardData?.vp}
            updatedAt={cardData?.updatedAt}
            title="supervisor OKR score"
            icon={<GoGoal className="text-[#7152F3]" />}
            span={8}
            isTop
            cardColor="bg-[#e9e9ff]"
          />
        </Row>
      </div>

      <div className="flex justify-between mr-5 my-7 ">
        <div className="text-xl font-bold ">Performance</div>
        <div className="pl-2">
          <Select
            placeholder="select"
            allowClear
            className="min-w-10 px-7 my-3 text-2xl font-semibold"
            options={items.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            defaultValue={items[0].value} // Set the first item as default
            onChange={(value) => console.log(value)}
          />
        </div>
      </div>
      <div className="flex">
        <div className="w-[70%] mr-3 flex flex-col gap-5">
          <PerformanceChart />
        </div>
        <div className="w-[30%] ml-3 ">
          <Space direction="vertical" className="w-[90%]">
            <RookStarsList
              dataSource={listData}
              title="Rock Star Of The Week"
            />
          </Space>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="text-xl font-bold mb-9">Performance Evaluation</div>
      </div>
      <div className="flex">
        <div className="w-[70%] mr-3 flex flex-col gap-5">
          <div>
            <Row gutter={[16, 16]}>
              <DashboardCard
                score={cardData?.issuedReprimand}
                updatedAt={cardData?.updatedAt}
                title="Issued Reprimand"
                icon={<FaBomb className="text-red-500" />}
                span={12}
                isTop={false}
              />
              <DashboardCard
                score={cardData?.issuedAppreciations}
                updatedAt={cardData?.updatedAt}
                title="Issued Appreciations"
                icon={<BsAwardFill className="text-green-500" />}
                span={12}
                isTop={false}
              />
              <DashboardCard
                score={cardData?.receiveReprimand}
                updatedAt={cardData?.updatedAt}
                title="Received Reprimand"
                icon={<FaBomb className="text-red-500" />}
                span={12}
                isTop={false}
              />
              <DashboardCard
                score={cardData?.receiveAppreciations}
                updatedAt={cardData?.updatedAt}
                title="received Appreciations"
                icon={<BsAwardFill className="text-green-500" />}
                span={12}
                isTop={false}
              />
            </Row>
          </div>
        </div>
        <div className="w-[30%] ml-3 ">
          <Space direction="vertical" className="w-[90%]">
            <RookStarsList dataSource={listData} title="Leaders Board" />
          </Space>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="">Achievement</div>
      </div>
      <div className="flex">
        <div className="w-full mr-3 flex flex-col gap-5">
          <Row gutter={20} className="w-full max-w-screen-xl">
            <DashboardCard
              score={cardData?.okr}
              updatedAt={cardData?.updatedAt}
              title="Average OKR Score"
              icon={<GoGoal className="text-[#7152F3]" />}
              span={12}
              isTop
            />
            <DashboardCard
              score={cardData?.keyResults}
              updatedAt={cardData?.updatedAt}
              title="total key result"
              icon={<MdOutlineKey className="text-[#7152F3]" />}
              span={12}
              isTop
            />
          </Row>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
