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
  const { pageSize, currentPage } = useOKRStore();
  const { data: objectivesData, isLoading } = useGetUserObjective(
    userId,
    pageSize,
    currentPage,
    '',
  );

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
    },
    elements: {
      arc: { borderWidth: 0 },
    },
  };

  return (
    <Card className="w-full h-full shadow-md rounded-xl flex flex-col pb-4">
      <div className="font-bold text-lg text-gray-900">OKR Metrics</div>
      <div className="flex flex-row items-center justify-between flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center w-[140px] h-[140px]">
            <Spin />
          </div>
        ) : (
          <div className="flex items-center justify-center relative w-[180px] h-[180px] px-4 overflow-visible">
            <Doughnut data={data} options={options} />
            <div
              className="absolute flex flex-col items-center justify-center left-1/2 top-1/2"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <div
                className="bg-white border border-gray-200 shadow-md rounded-full flex flex-col items-center justify-center"
                style={{ width: 60, height: 60 }}
              >
                <span className="font-bold text-2xl text-gray-900">
                  {total}
                </span>
                <span className="text-sm text-gray-400">Total</span>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col justify-center gap-3 mr-8">
          {legend.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="inline-block rounded-full"
                style={{ width: 14, height: 14, backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700 font-medium">
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
