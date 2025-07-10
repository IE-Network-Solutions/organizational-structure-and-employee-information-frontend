'use client';
import { Space, Switch } from 'antd';
import React from 'react';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import ObjectiveKeyResult from '../dashboard/_components/objectiveKeyResult';
import Performance from '../dashboard/_components/Performance';
import VPdashboard from '../dashboard/_components/vpDashboard';

const Dashboard: React.FC<any> = () => {
  const {
    // revenue,
    // financialSales,
    // progressRevenue,
    // progressSales,
    isVP,
    toggleDashboard,
  } = useOKRStore();

  return (
    <>
      <div className="flex items-center justify-between px-4">
        <CustomBreadcrumb
          title={`${isVP ? 'VP' : 'Dashboard'}`}
          subtitle={` ${isVP ? 'view your variable pay progress' : 'Employee’s OKR Dashboard View'} `}
        />
        <Space direction="vertical">
          <Switch
            checked={isVP}
            title={`Switch to ${isVP ? 'OKR' : 'VP'} Dashboard`}
            checkedChildren="VP"
            unCheckedChildren="OKR"
            onChange={toggleDashboard}
          />
        </Space>
      </div>
      {!isVP ? (
        <div className="h-auto w-full p-4 bg-white rounded-md">
          <ObjectiveKeyResult />
          <Performance />
          {/* <div className="flex justify-between">
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
                    bgColor="#FFFFFF"
                  />
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <ProgressCard
                    title="Financial Sales"
                    amount={financialSales}
                    progress={financialSales}
                    totalAmount={progressSales}
                    bgColor="#E9E9FF"
                  />
                </Col>
              </Row>
            </div>
          </div> */}
        </div>
      ) : (
        <VPdashboard />
      )}
    </>
  );
};
export default Dashboard;
