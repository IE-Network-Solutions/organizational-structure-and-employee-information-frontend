'use client';
import React from 'react';
import CustomBreadcrumb from '@/components/common/breadCramp';
import SummaryCardsRow from './_components/SummaryCardsRow';
import OKRDonutChart from './_components/OKRDonutChart';
import BasicOKRProgressChart from './_components/BasicOKRProgressChart';
import MetricsProgressOverview from './_components/MetricsProgressOverview';
import DueSoonKeyResultList from './_components/DueSoonKeyResultList';
import AwaitingApprovalsList from './_components/AwaitingApprovalsList';
import Performance from './_components/Performance';
import { Button } from 'antd';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useIsBasicOkr } from '@/app/(afterLogin)/(okrplanning)/okr/_utils/okrMode';

const Dashboard: React.FC = () => {
  const { selectedCard, setSelectedCard } = useOKRStore();
  const isBasicOkr = useIsBasicOkr();

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
          <div
            id="okr-dashboard-remove-filter-container"
            data-cy="okr-dashboard-remove-filter-container"
            className="flex justify-end"
          >
            <Button
              id="okr-dashboard-remove-filter-button"
              data-cy="okr-dashboard-remove-filter-button"
              type="default"
              onClick={() => setSelectedCard(null)}
            >
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
            className={`col-span-1 xl:col-span-2 flex flex-col h-full min-h-[200px] ${isBasicOkr ? '' : 'gap-6 justify-between'}`}
            id="okr-dashboard-metrics-wrapper"
            data-cy="okr-dashboard-metrics-wrapper"
          >
            <div
              className={`${isBasicOkr ? 'h-full' : 'flex-1'} min-h-0 flex flex-col`}
              id="okr-dashboard-donut-section"
              data-cy="okr-dashboard-donut-section"
            >
              {isBasicOkr ? (
                <BasicOKRProgressChart data-cy="okr-dashboard-basic-progress-chart" />
              ) : (
                <OKRDonutChart data-cy="okr-dashboard-donut-chart" />
              )}
            </div>
            {!isBasicOkr && (
              <div
                className="flex-1 min-h-0 flex flex-col"
                id="okr-dashboard-metrics-progress-section"
                data-cy="okr-dashboard-metrics-progress-section"
              >
                <MetricsProgressOverview data-cy="okr-dashboard-metrics-progress-overview" />
              </div>
            )}
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
