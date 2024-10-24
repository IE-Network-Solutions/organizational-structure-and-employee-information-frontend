import PerformanceChart from '@/app/(afterLogin)/(okr)/_components/performanceChart';
import RookStarsList from '@/app/(afterLogin)/(okr)/_components/rookStarsList';
import { ListData } from '@/types/dashboard/okr';
import { Col, Row, Select, Space } from 'antd';
import React from 'react';
import PerformanceEvaluation from './performanceEvaluation';
import { useGetPlanningPeriods } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';

const listData: ListData[] = [
  {
    key: '1',
    name: 'Gelila Tegegne',
    title: 'Software Engineer',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=1',
    completion: 95,
  },
  {
    key: '2',
    name: 'Selamawit Getaneh',
    title: 'Project Manager',
    avatar: 'https://api.dicebear.com/7.x/miniavs/svg?seed=2',
    completion: 92,
  },
  {
    key: '3',
    name: 'Hiwot Doe',
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

const Performance: React.FC = () => {
  const { selectedPeriodId, setSelectedPeriodId } = useOKRStore();
  const handlePeriodChange = (value: string) => {
    console.log(value, 'valuefghjk');

    setSelectedPeriodId(value);
  };
  const { data: planningPeriods } = useGetPlanningPeriods();
  console.log(planningPeriods, selectedPeriodId, 'planningPeriods');

  return (
    <div>
      <div className="flex justify-between mr-5 my-7 ">
        <div className="text-xl font-bold ">Performance</div>
        <div className="pl-2">
          <Select
            placeholder="Select period"
            allowClear
            className="min-w-10 px-7 my-3 text-xl font-normal"
            onChange={handlePeriodChange}
          >
            {planningPeriods?.items?.map((item: any) => (
              <Select.Option
                key={item?.id}
                value={item?.id}
                defaultValue={item[2]?.name}
              >
                {item?.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={24} lg={16} xl={16}>
          <PerformanceChart />
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Space direction="vertical" className="w-[90%]">
            <RookStarsList
              planningPeriodId={selectedPeriodId}
              dataSource={listData}
              title="Rock Star Of The Week"
            />
          </Space>
        </Col>
      </Row>
      <div className="flex justify-between">
        <div className="text-xl font-bold">Performance Evaluation</div>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={24} lg={16} xl={16}>
          <PerformanceEvaluation />
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          <Space direction="vertical" className="w-full">
            <RookStarsList
              planningPeriodId={selectedPeriodId}
              dataSource={listData}
              title="Leaders Board"
            />
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default Performance;
