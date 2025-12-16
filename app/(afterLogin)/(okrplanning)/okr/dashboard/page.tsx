'use client';
import React from 'react';
import CustomBreadcrumb from '@/components/common/breadCramp';
import SummaryCardsRow from './_components/SummaryCardsRow';
import OKRDonutChart from './_components/OKRDonutChart';
import MetricsProgressOverview from './_components/MetricsProgressOverview';
import DueSoonKeyResultList from './_components/DueSoonKeyResultList';
import AwaitingApprovalsList from './_components/AwaitingApprovalsList';
import Performance from './_components/Performance';
import { Button } from 'antd';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';

const Dashboard: React.FC = () => {
  const { selectedCard, setSelectedCard } = useOKRStore();

  return (
    <>
      <div
        className="flex items-center justify-between px-4 bg-gray-100"
        id="okr-dashboard-header-container"
        data-cy="okr-dashboard-header-container"
      >
        <CustomBreadcrumb
          data-cy="okr-dashboard-header-breadcrumb"
          title="Dashboard"
          subtitle="Employee's OKR Dashboard View"
        />
      </div>
      <div
        className="h-auto w-full p-4 bg-gray-100 rounded-md flex flex-col gap-6"
        id="okr-dashboard-content-container"
        data-cy="okr-dashboard-content-container"
      >
        <SummaryCardsRow data-cy="okr-dashboard-summary-cards-row" />
        {selectedCard && (
          <div className="flex justify-end">
            <Button type="default" onClick={() => setSelectedCard(null)}>
              Remove Filter
            </Button>
          </div>
        )}

        <div
          className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-stretch"
          id="okr-dashboard-top-grid"
          data-cy="okr-dashboard-top-grid"
        >
          {/* Performance (left, 3/5 width) */}
          <div
            className="col-span-1 xl:col-span-3 flex flex-col h-full min-h-[200px]"
            id="okr-dashboard-performance-wrapper"
            data-cy="okr-dashboard-performance-wrapper"
          >
            <Performance data-cy="okr-dashboard-performance" />
          </div>
          {/* OKR Metrics and Metrics Progress Overview (right, stacked, equal height) */}
          <div
            className="col-span-1 xl:col-span-2 flex flex-col h-full min-h-[200px] gap-6 justify-between"
            id="okr-dashboard-metrics-wrapper"
            data-cy="okr-dashboard-metrics-wrapper"
          >
            <div
              className="flex-1 min-h-0 flex flex-col"
              id="okr-dashboard-donut-section"
              data-cy="okr-dashboard-donut-section"
            >
              <OKRDonutChart data-cy="okr-dashboard-donut-chart" />
            </div>
            <div
              className="flex-1 min-h-0 flex flex-col"
              id="okr-dashboard-metrics-progress-section"
              data-cy="okr-dashboard-metrics-progress-section"
            >
              <MetricsProgressOverview data-cy="okr-dashboard-metrics-progress-overview" />
            </div>
          </div>
        </div>
        {/* Bottom section: Due Soon Key Result and Awaiting Approvals */}
        <div
          className="grid grid-cols-1 xl:grid-cols-5 gap-6 mt-2"
          id="okr-dashboard-bottom-grid"
          data-cy="okr-dashboard-bottom-grid"
        >
          <div
            className="col-span-1 xl:col-span-3"
            id="okr-dashboard-due-soon-wrapper"
            data-cy="okr-dashboard-due-soon-wrapper"
          >
            <DueSoonKeyResultList data-cy="okr-dashboard-due-soon-list" />
          </div>
          <div
            className="col-span-1 xl:col-span-2"
            id="okr-dashboard-awaiting-wrapper"
            data-cy="okr-dashboard-awaiting-wrapper"
          >
            <AwaitingApprovalsList data-cy="okr-dashboard-awaiting-approvals-list" />
          </div>
        </div>
      </div>
    </>
  );
};
export default Dashboard;
