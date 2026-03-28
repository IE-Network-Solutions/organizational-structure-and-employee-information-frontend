'use client';

import { Card, Spin } from 'antd';
import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend as ChartLegend } from 'chart.js';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useGetUserObjective } from '@/store/server/features/okrplanning/okr/objective/queries';

Chart.register(ArcElement, Tooltip, ChartLegend);

// Colors for Basic OKR Progress chart
const ACHIEVED_COLOR = '#3636F0'; // Dark blue
const NOT_ACHIEVED_COLOR = '#3EC3FF'; // Light blue/cyan

const BasicOKRProgressChart: React.FC = () => {
  const userId = useAuthenticationStore.getState().userId;
  const { pageSize, currentPage, fiscalYearId, sessionIds } = useOKRStore();
  const {
    data: objectivesData,
    isLoading,
    isFetching,
  } = useGetUserObjective(
    userId,
    pageSize,
    currentPage,
    '',
    fiscalYearId,
    sessionIds,
  );

  const isChartLoading = isLoading || isFetching;

  // Count Achieved vs Not Achieved Key Results
  const { achievedCount, notAchievedCount, total } = useMemo(() => {
    let achieved = 0;
    let notAchieved = 0;

    if (objectivesData?.items) {
      objectivesData.items.forEach((obj: any) => {
        (obj.keyResults || []).forEach((kr: any) => {
          if (kr.keyResultCompletionStatus === 'Achieved') {
            achieved++;
          } else {
            // Pending, Failed, or undefined status counts as Not Achieved
            notAchieved++;
          }
        });
      });
    }

    return {
      achievedCount: achieved,
      notAchievedCount: notAchieved,
      total: achieved + notAchieved,
    };
  }, [objectivesData]);

  const legend = [
    { color: ACHIEVED_COLOR, label: 'Achieved' },
    { color: NOT_ACHIEVED_COLOR, label: 'Not Achieved' },
  ];

  const data = {
    labels: ['Achieved', 'Not Achieved'],
    datasets: [
      {
        data: [achievedCount, notAchievedCount],
        backgroundColor: [ACHIEVED_COLOR, NOT_ACHIEVED_COLOR],
        borderWidth: 5,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    cutout: '60%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    elements: {
      arc: { borderWidth: 0 },
    },
  };

  return (
    <Card
      className="w-full h-full shadow-md rounded-xl flex flex-col pb-4"
      id="okr-progress-card-container-display-card"
      data-cy="okr-progress-card-container-display-card"
    >
      <div
        className="font-bold text-lg text-gray-900"
        id="okr-progress-header-title-display-div"
        data-cy="okr-progress-header-title-display-div"
      >
        OKR Progress
      </div>
      <div
        className="flex flex-row items-center justify-between flex-1"
        id="okr-progress-body-container-display-div"
        data-cy="okr-progress-body-container-display-div"
      >
        {isChartLoading ? (
          <div
            className="flex items-center justify-center w-[140px] h-[140px]"
            id="okr-progress-loading-wrapper-display-div"
            data-cy="okr-progress-loading-wrapper-display-div"
          >
            <Spin data-cy="okr-progress-loading-spinner-display-spin" />
          </div>
        ) : (
          <div
            className="relative flex items-center justify-center w-[180px] h-[180px] px-4 overflow-visible z-10"
            id="okr-progress-chart-wrapper-display-div"
            data-cy="okr-progress-chart-wrapper-display-div"
          >
            <Doughnut
              data={data}
              options={options}
              id="okr-progress-chart-canvas-display-chart"
              data-cy="okr-progress-chart-canvas-display-chart"
            />
            <div
              className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center z-0"
              style={{ transform: 'translate(-50%, -50%)' }}
              id="okr-progress-total-overlay-display-div"
              data-cy="okr-progress-total-overlay-display-div"
            >
              <div
                className="bg-white border border-gray-200 shadow-md rounded-full flex flex-col items-center justify-center"
                style={{ width: 60, height: 60 }}
                id="okr-progress-total-circle-display-div"
                data-cy="okr-progress-total-circle-display-div"
              >
                <span
                  className="font-bold text-2xl text-gray-900"
                  id="okr-progress-total-value-display-span"
                  data-cy="okr-progress-total-value-display-span"
                >
                  {total}
                </span>
                <span
                  className="text-sm text-gray-400"
                  id="okr-progress-total-label-display-span"
                  data-cy="okr-progress-total-label-display-span"
                >
                  Total
                </span>
              </div>
            </div>
          </div>
        )}
        <div
          className="flex flex-col justify-center gap-3 mr-8"
          id="okr-progress-legend-container-display-div"
          data-cy="okr-progress-legend-container-display-div"
        >
          {legend.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2"
              id={`okr-progress-legend-row-display-div-${item.label
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')}`}
              data-cy={`okr-progress-legend-row-display-div-${item.label
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')}`}
            >
              <span
                className="inline-block rounded-full"
                style={{ width: 14, height: 14, backgroundColor: item.color }}
                id={`okr-progress-legend-color-display-span-${item.label
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')}`}
                data-cy={`okr-progress-legend-color-display-span-${item.label
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')}`}
              />
              <span
                className="text-sm text-gray-700 font-medium"
                id={`okr-progress-legend-label-display-span-${item.label
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')}`}
                data-cy={`okr-progress-legend-label-display-span-${item.label
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')}`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default BasicOKRProgressChart;
