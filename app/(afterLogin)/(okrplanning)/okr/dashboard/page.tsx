'use client';
import React from 'react';
import CustomBreadcrumb from '@/components/common/breadCramp';
import SummaryCardsRow from './_components/SummaryCardsRow';
import OKRDonutChart from './_components/OKRDonutChart';
import MetricsProgressOverview from './_components/MetricsProgressOverview';
import DueSoonKeyResultList from './_components/DueSoonKeyResultList';
import AwaitingApprovalsList from './_components/AwaitingApprovalsList';
import Performance from './_components/Performance';

const Dashboard: React.FC = () => {
  return (
    <>
      <div className="flex items-center justify-between px-4 bg-gray-100">
        <CustomBreadcrumb
          title="Dashboard"
          subtitle="Employee's OKR Dashboard View"
        />
      </div>
      <div className="h-auto w-full p-4 bg-gray-100 rounded-md flex flex-col gap-6">
        <SummaryCardsRow />
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-stretch">
          {/* Performance (left, 3/5 width) */}
          <div className="col-span-1 xl:col-span-3 flex flex-col h-full min-h-[200px]">
            <Performance />
          </div>
          {/* OKR Metrics and Metrics Progress Overview (right, stacked, equal height) */}
          <div className="col-span-1 xl:col-span-2 flex flex-col h-full min-h-[200px] gap-6 justify-between">
            <div className="flex-1 min-h-0 flex flex-col">
              <OKRDonutChart />
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              <MetricsProgressOverview />
            </div>
          </div>
        </div>
        {/* Bottom section: Due Soon Key Result and Awaiting Approvals */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mt-2">
          <div className="col-span-1 xl:col-span-3">
            <DueSoonKeyResultList />
          </div>
          <div className="col-span-1 xl:col-span-2">
            <AwaitingApprovalsList />
          </div>
        </div>
      </div>
    </>
  );
};
export default Dashboard;
