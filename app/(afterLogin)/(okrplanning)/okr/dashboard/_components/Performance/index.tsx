import PerformanceChart from '@/app/(afterLogin)/(okr)/_components/performanceChart';
import RookStarsList from '@/app/(afterLogin)/(okr)/_components/rookStarsList';
import { Col, Row, Select } from 'antd';
import React, { useEffect } from 'react';
import { useGetPlanningPeriods } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const Performance: React.FC = () => {
  const { selectedPeriodId, setSelectedPeriodId } = useOKRStore();
  const { data: planningPeriods } = useGetPlanningPeriods();
  const { userId } = useAuthenticationStore();

  useEffect(() => {
    const weeklyPeriod = planningPeriods?.items?.find(
      (item: any) => item.name === 'Weekly',
    );
    if (weeklyPeriod) {
      setSelectedPeriodId(weeklyPeriod?.id);
    }
  }, [planningPeriods, setSelectedPeriodId]);

  const handlePeriodChange = (value: string) => {
    setSelectedPeriodId(value);
  };

  return (
    <div>
      <div className="flex justify-between mr-5 my-7 ">
        <div className="text-xl font-bold ">Performance</div>
        <div className="pl-2">
          <Select
            placeholder="Select period"
            allowClear
            className="min-w-10 px-7 my-3 text-xl font-normal"
            value={selectedPeriodId}
            onChange={handlePeriodChange}
          >
            {planningPeriods?.items
              ?.filter((item: any) => item?.name !== 'Daily')
              .map((item: any) => (
                <Select.Option key={item?.id} value={item?.id}>
                  {item?.name}
                </Select.Option>
              ))}
          </Select>
        </div>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={24} lg={16} xl={16}>
          <PerformanceChart
            selectedPeriodId={selectedPeriodId}
            userId={userId}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
          {/* <Space direction="vertical" className="w-[90%]"> */}
          <RookStarsList
            planningPeriodId={selectedPeriodId}
            title="Rock Star Of The Week"
          />
          {/* </Space> */}
        </Col>
      </Row>

      {/* ===========> THIS IS PERFORMANCE EVALUATION SECTION  <===========*/}
      {/*
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
      </Row> */}
    </div>
  );
};

export default Performance;
