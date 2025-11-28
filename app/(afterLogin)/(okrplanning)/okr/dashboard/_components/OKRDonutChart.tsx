import { Card, Spin } from 'antd';
import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend as ChartLegend } from 'chart.js';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useGetUserObjective } from '@/store/server/features/okrplanning/okr/objective/queries';

Chart.register(ArcElement, Tooltip, ChartLegend);

// Color palette for dynamic metric types
const colorPalette = [
  '#3636F0', // Primary blue
  '#4F8CFF', // Light blue
  '#3EC3FF', // Cyan
  '#22C55E', // Green
  '#FACC15', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Teal
  '#84CC16', // Lime
];

const OKRDonutChart: React.FC = () => {
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

  // Dynamically extract metric types and their counts
  const { metricCounts, legend } = useMemo(() => {
    const counts: Record<string, number> = {};

    if (objectivesData?.items) {
      objectivesData.items.forEach((obj: any) => {
        (obj.keyResults || []).forEach((kr: any) => {
          const type = kr.metricType?.name || kr.key_type || 'Unknown';
          counts[type] = (counts[type] || 0) + 1;
        });
      });
    }

    // Create legend with colors
    const legend = Object.keys(counts).map((metricType, index) => ({
      color: colorPalette[index % colorPalette.length],
      label: metricType,
    }));

    return { metricCounts: counts, legend };
  }, [objectivesData]);

  const data = {
    labels: legend.map((l) => l.label),
    datasets: [
      {
        data: legend.map((l) => metricCounts[l.label]),
        backgroundColor: legend.map((l) => l.color),
        borderWidth: 5,
        hoverOffset: 8,
      },
    ],
  };

  const total = data.datasets[0].data.reduce((a, b) => a + b, 0);

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
      id="okr-donut-card-container-display-card"
      data-cy="okr-donut-card-container-display-card"
    >
      <div
        className="font-bold text-lg text-gray-900"
        id="okr-donut-header-title-display-div"
        data-cy="okr-donut-header-title-display-div"
      >
        OKR Metrics
      </div>
      <div
        className="flex flex-row items-center justify-between flex-1"
        id="okr-donut-body-container-display-div"
        data-cy="okr-donut-body-container-display-div"
      >
        {isChartLoading ? (
          <div
            className="flex items-center justify-center w-[140px] h-[140px]"
            id="okr-donut-loading-wrapper-display-div"
            data-cy="okr-donut-loading-wrapper-display-div"
          >
            <Spin data-cy="okr-donut-loading-spinner-display-spin" />
          </div>
        ) : (
          <div
            className="relative flex items-center justify-center w-[180px] h-[180px] px-4 overflow-visible z-10"
            id="okr-donut-chart-wrapper-display-div"
            data-cy="okr-donut-chart-wrapper-display-div"
          >
            <Doughnut
              data={data}
              options={options}
              id="okr-donut-chart-canvas-display-chart"
              data-cy="okr-donut-chart-canvas-display-chart"
            />
            <div
              className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center z-0"
              style={{ transform: 'translate(-50%, -50%)' }}
              id="okr-donut-total-overlay-display-div"
              data-cy="okr-donut-total-overlay-display-div"
            >
              <div
                className="bg-white border border-gray-200 shadow-md rounded-full flex flex-col items-center justify-center"
                style={{ width: 60, height: 60 }}
                id="okr-donut-total-circle-display-div"
                data-cy="okr-donut-total-circle-display-div"
              >
                <span
                  className="font-bold text-2xl text-gray-900"
                  id="okr-donut-total-value-display-span"
                  data-cy="okr-donut-total-value-display-span"
                >
                  {total}
                </span>
                <span
                  className="text-sm text-gray-400"
                  id="okr-donut-total-label-display-span"
                  data-cy="okr-donut-total-label-display-span"
                >
                  Total
                </span>
              </div>
            </div>
          </div>
        )}
        <div
          className="flex flex-col justify-center gap-3 mr-8"
          id="okr-donut-legend-container-display-div"
          data-cy="okr-donut-legend-container-display-div"
        >
          {legend.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2"
              id={`okr-donut-legend-row-display-div-${item.label
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')}`}
              data-cy={`okr-donut-legend-row-display-div-${item.label
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')}`}
            >
              <span
                className="inline-block rounded-full"
                style={{ width: 14, height: 14, backgroundColor: item.color }}
                id={`okr-donut-legend-color-display-span-${item.label
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')}`}
                data-cy={`okr-donut-legend-color-display-span-${item.label
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')}`}
              />
              <span
                className="text-sm text-gray-700 font-medium"
                id={`okr-donut-legend-label-display-span-${item.label
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')}`}
                data-cy={`okr-donut-legend-label-display-span-${item.label
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

export default OKRDonutChart;
