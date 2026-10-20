'use client';
import React, { useMemo, useState } from 'react';
import { Progress, Skeleton, Tabs } from 'antd';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { useGetVPScore } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useGetActiveMonth } from '@/store/server/features/payroll/payroll/queries';
import { useGetActiveSession } from '@/store/server/features/okrplanning/okr/target/queries';
import { useVariablePayStore } from '@/store/uistate/features/compensation/benefit';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

Chart.register(ArcElement, Tooltip, Legend);

type VpScoreTrack = 'MONTH' | 'SESSION';

const donutFallbackColors = [
  '#1e3a8a',
  '#4ade80',
  '#d1d5db',
  '#9ca3af',
  '#003366',
];

function VpScoreTrackContent({
  vpScore,
  isLoading,
  changeLabel,
}: {
  vpScore: any;
  isLoading: boolean;
  changeLabel: string;
}) {
  const [showAll, setShowAll] = useState(false);

  const totalScore = vpScore?.score ?? 0;
  const previousScore = vpScore?.previousScore ?? 0;
  const change = (totalScore - previousScore).toFixed(2);
  const isNegative = totalScore - previousScore < 0;

  const criteria = vpScore?.criteria || [];
  const displayCriteria = showAll ? criteria : criteria.slice(0, 7);
  const getProgressColor = (criteriaName: string) =>
    criteriaName?.trim()?.toLowerCase() === 'employee attendance'
      ? '#f0484a'
      : '#1c3ca5';

  const labels = criteria.map((c: any) => c.name);
  const dataValues = criteria.map((c: any) => Number(c.score));
  const donutColors = criteria.map((c: any, index: number) =>
    c?.name?.trim()?.toLowerCase() === 'employee attendance'
      ? '#f0484a'
      : donutFallbackColors[index % donutFallbackColors.length],
  );

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: dataValues.length > 0 ? dataValues : [1],
        backgroundColor: dataValues.length > 0 ? donutColors : ['#e5e7eb'],
        borderWidth: 0,
        borderRadius: 2,
        spacing: 2,
        hoverOffset: 0,
      },
    ],
  };

  const chartOptions = {
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: dataValues.length > 0,
        callbacks: {
          title: (tooltipItems: any) => tooltipItems?.[0]?.label ?? '',
          label: (context: any) => {
            const index = context?.dataIndex ?? 0;
            const item = criteria?.[index];
            const score = Number(item?.score ?? 0).toFixed(2);
            const weight = Number(item?.weight ?? 0).toFixed(2);
            return `Score: ${score} out of ${weight}`;
          },
        },
      },
      datalabels: { display: false },
    },
    elements: {
      arc: { borderWidth: 0 },
    },
  };

  if (isLoading) {
    return (
      <div data-cy="variable-pay-score-card-loading">
        <Skeleton
          active
          paragraph={{ rows: 3 }}
          data-cy="variable-pay-score-card-loading-skeleton"
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-row items-center gap-3 md:items-start md:gap-6"
      data-cy="variable-pay-score-card-body"
    >
      <div
        className="relative mt-0 h-[80px] w-[80px] flex-shrink-0 md:mt-2 md:h-[130px] md:w-[130px]"
        style={{ left: '-0.32px' }}
        id="variable-pay-score-card-donut"
        data-cy="variable-pay-score-card-donut"
      >
        <Doughnut
          data={chartData}
          options={chartOptions}
          data-cy="variable-pay-score-card-donut-chart"
        />
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          id="variable-pay-score-card-donut-center"
          data-cy="variable-pay-score-card-donut-center"
        >
          <span
            className="text-xl font-bold text-gray-900"
            data-cy="variable-pay-score-card-donut-center-value"
          >
            {Number(totalScore).toFixed(1)}
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0" data-cy="variable-pay-score-card-right">
        <div
          className="mb-3 flex min-w-0 items-center justify-between gap-2"
          id="variable-pay-score-card-header"
          data-cy="variable-pay-score-card-header"
        >
          <div
            className="flex min-w-0 flex-1 items-center gap-2 md:gap-3"
            data-cy="variable-pay-score-card-header-left"
          >
            <span
              className={`max-md:max-w-[140px] truncate whitespace-nowrap rounded px-2.5 py-0.5 text-[14px] font-medium ${
                isNegative
                  ? 'bg-red-50 text-red-500 border border-red-200'
                  : 'bg-green-50 text-green-600 border border-green-200'
              }`}
              data-cy="variable-pay-score-card-change-badge"
            >
              {change} {changeLabel}
            </span>
          </div>
        </div>

        <div
          className="md:hidden min-w-0 rounded-xl bg-gray-50 p-3"
          id="variable-pay-score-card-criteria-grid"
          data-cy="variable-pay-score-card-criteria-grid"
        >
          <div
            className="grid grid-flow-col grid-rows-2 auto-cols-[280px] gap-x-4 gap-y-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden"
            data-cy="variable-pay-score-card-criteria-grid-mobile-track"
          >
            {displayCriteria.map((item: any, index: number) => {
              const score = Number(item?.score ?? 0).toFixed(0);
              const weight = Number(item?.weight ?? 5);
              const percentage = Math.min(
                (Number(item?.score ?? 0) / weight) * 100,
                100,
              );
              return (
                <div
                  key={index}
                  className="flex min-w-0 flex-col gap-0.5"
                  id={`variable-pay-criteria-item-${index}`}
                  data-cy={`variable-pay-criteria-item-${index}`}
                >
                  <span
                    className="truncate whitespace-nowrap font-sans text-[14px] font-normal leading-[22px] text-gray-700"
                    data-cy={`variable-pay-criteria-item-title-${index}`}
                  >
                    {item?.name?.length > 32
                      ? item.name.slice(0, 32) + '...'
                      : item?.name}
                  </span>
                  <div
                    className="flex min-w-0 items-center gap-2"
                    data-cy={`variable-pay-criteria-item-progress-row-${index}`}
                  >
                    <Progress
                      percent={percentage}
                      showInfo={false}
                      strokeColor={getProgressColor(item?.name || '')}
                      trailColor="#e5e7eb"
                      className="m-0 w-full min-w-0 flex-1"
                      strokeWidth={8}
                      data-cy={`variable-pay-criteria-progress-${index}`}
                    />
                    <span
                      className="whitespace-nowrap text-[14px] text-gray-500"
                      data-cy={`variable-pay-criteria-item-score-${index}`}
                    >
                      {score} out of {weight}
                    </span>
                  </div>
                </div>
              );
            })}
            <div
              className="flex items-end justify-start"
              data-cy="variable-pay-score-card-view-all-mobile-wrapper"
            >
              <span
                onClick={() => setShowAll(!showAll)}
                className="cursor-pointer text-[14px] font-medium text-[#1677ff] hover:text-blue-800"
                data-cy="variable-pay-score-card-view-all-mobile"
                id="variable-pay-score-card-view-all-mobile"
              >
                {showAll ? 'View Less' : 'View All'}
              </span>
            </div>
          </div>
        </div>

        <div
          className="hidden md:grid md:grid-flow-row md:grid-cols-4 md:grid-rows-none md:gap-x-6 md:gap-y-2 md:overflow-visible"
          data-cy="variable-pay-score-card-criteria-grid-desktop"
        >
          {displayCriteria.map((item: any, index: number) => {
            const score = Number(item?.score ?? 0).toFixed(0);
            const weight = Number(item?.weight ?? 5);
            const percentage = Math.min(
              (Number(item?.score ?? 0) / weight) * 100,
              100,
            );
            return (
              <div
                key={index}
                className="flex min-w-0 flex-col gap-0.5 md:w-auto"
                id={`variable-pay-criteria-item-${index}`}
                data-cy={`variable-pay-criteria-item-${index}`}
              >
                <span
                  className="truncate whitespace-nowrap font-sans text-[14px] font-normal leading-[22px] text-gray-700"
                  data-cy={`variable-pay-criteria-item-title-desktop-${index}`}
                >
                  {item?.name?.length > 32
                    ? item.name.slice(0, 32) + '...'
                    : item?.name}
                </span>
                <div
                  className="flex min-w-0 items-center gap-2"
                  data-cy={`variable-pay-criteria-item-progress-row-desktop-${index}`}
                >
                  <Progress
                    percent={percentage}
                    showInfo={false}
                    strokeColor={getProgressColor(item?.name || '')}
                    trailColor="#e5e7eb"
                    className="m-0 w-full min-w-0 flex-1"
                    strokeWidth={8}
                    data-cy={`variable-pay-criteria-progress-${index}`}
                  />
                  <span
                    className="whitespace-nowrap text-[14px] text-gray-500"
                    data-cy={`variable-pay-criteria-item-score-desktop-${index}`}
                  >
                    {score} out of {weight}
                  </span>
                </div>
              </div>
            );
          })}
          <div
            className="mt-1 hidden items-end justify-start md:flex"
            data-cy="variable-pay-score-card-view-all-desktop-wrapper"
          >
            <span
              onClick={() => setShowAll(!showAll)}
              className="cursor-pointer text-[14px] font-medium text-[#1677ff] hover:text-blue-800"
              data-cy="variable-pay-score-card-view-all"
              id="variable-pay-score-card-view-all"
            >
              {showAll ? 'View Less' : 'View All'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const hasVpScoreData = (vpScore: any) =>
  vpScore != null &&
  (vpScore.score != null ||
    (Array.isArray(vpScore.criteria) && vpScore.criteria.length > 0));

const VPScoreCard: React.FC = () => {
  const [activeTrack, setActiveTrack] = useState<VpScoreTrack>('MONTH');
  const userId = useAuthenticationStore.getState().userId;
  const { searchParams } = useVariablePayStore();
  const { data: activeMonth } = useGetActiveMonth();
  const { data: activeSession } = useGetActiveSession();

  const selectedMonthIds =
    typeof searchParams?.selectedMonth === 'string'
      ? searchParams.selectedMonth.split(',')
      : Array.isArray(searchParams?.selectedMonth) &&
          searchParams?.selectedMonth.length > 0
        ? searchParams.selectedMonth
        : [activeMonth?.id];
  const selectedMonthId = selectedMonthIds.filter(Boolean)[0];
  const selectedSessionId =
    (typeof searchParams?.selectedSession === 'string' &&
      searchParams.selectedSession) ||
    activeSession?.id ||
    activeSession?.data?.id;

  const { data: monthlyScore, isLoading: monthlyLoading } = useGetVPScore(
    userId,
    {
      monthId: selectedMonthId,
      scoreBy: 'MONTH',
      enabled: Boolean(userId),
    },
  );

  const { data: quarterlyScore, isLoading: quarterlyLoading } = useGetVPScore(
    userId,
    {
      sessionId: selectedSessionId,
      scoreBy: 'SESSION',
      enabled: Boolean(userId && selectedSessionId),
    },
  );

  const showMonthly = hasVpScoreData(monthlyScore) || monthlyLoading;
  const showQuarterly = hasVpScoreData(quarterlyScore) || quarterlyLoading;

  const tabItems = useMemo(() => {
    const items: {
      key: VpScoreTrack;
      label: string;
      children: React.ReactNode;
    }[] = [];

    if (showMonthly || !showQuarterly) {
      items.push({
        key: 'MONTH',
        label: 'PP Monthly',
        children: (
          <VpScoreTrackContent
            vpScore={monthlyScore}
            isLoading={monthlyLoading}
            changeLabel="vs last month"
          />
        ),
      });
    }

    if (showQuarterly) {
      items.push({
        key: 'SESSION',
        label: 'PP Quarterly',
        children: (
          <VpScoreTrackContent
            vpScore={quarterlyScore}
            isLoading={quarterlyLoading}
            changeLabel="vs last quarter"
          />
        ),
      });
    }

    return items;
  }, [
    showMonthly,
    showQuarterly,
    monthlyScore,
    monthlyLoading,
    quarterlyScore,
    quarterlyLoading,
  ]);

  const resolvedActiveKey = tabItems.some((t) => t.key === activeTrack)
    ? activeTrack
    : (tabItems[0]?.key ?? 'MONTH');

  return (
    <div
      className="mt-4 rounded-xl border border-gray-100 bg-white px-5 py-4 text-[14px]"
      id="variable-pay-score-card-container"
      data-cy="variable-pay-score-card-container"
    >
      <Tabs
        activeKey={resolvedActiveKey}
        onChange={(key) => setActiveTrack(key as VpScoreTrack)}
        items={tabItems}
        data-cy="variable-pay-score-card-tabs"
      />
    </div>
  );
};

export default VPScoreCard;
