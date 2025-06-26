import { Card, Spin } from 'antd';
import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend as ChartLegend } from 'chart.js';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { useGetUserObjective } from '@/store/server/features/okrplanning/okr/objective/queries';

Chart.register(ArcElement, Tooltip, ChartLegend);

const donutColors = [
  '#3636F0', // Milestone
  '#4F8CFF', // Currency
  '#3EC3FF', // Numeric
  '#D1D5DB', // Achieved or Not
];

const legend = [
  { color: donutColors[0], label: 'Milestone' },
  { color: donutColors[1], label: 'Currency' },
  { color: donutColors[2], label: 'Numeric' },
  { color: donutColors[3], label: 'Achieved or Not' },
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

  // Aggregate key results by metric type
  const metricCounts = useMemo(() => {
    const counts = {
      Milestone: 0,
      Currency: 0,
      Numeric: 0,
      'Achieved or Not': 0,
    };
    if (!objectivesData?.items) return counts;
    objectivesData.items.forEach((obj: any) => {
      (obj.keyResults || []).forEach((kr: any) => {
        const type = kr.metricType?.name || kr.key_type;
        if (type === 'Milestone') counts.Milestone++;
        else if (type === 'Currency') counts.Currency++;
        else if (type === 'Numeric') counts.Numeric++;
        else if (type === 'Achieve' || type === 'Achieved or Not')
          counts['Achieved or Not']++;
      });
    });
    return counts;
  }, [objectivesData]);

  const data = {
    labels: legend.map((l) => l.label),
    datasets: [
      {
        data: [
          metricCounts.Milestone,
          metricCounts.Currency,
          metricCounts.Numeric,
          metricCounts['Achieved or Not'],
        ],
        backgroundColor: donutColors,
        borderWidth: 2,
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
      arc: { borderWidth: 2 },
    },
  };

  return (
    <Card className="w-full h-full shadow-md rounded-xl flex flex-col">
      <div className="font-bold text-lg text-gray-900 mb-2">OKR Metrics</div>
      <div className="flex flex-row items-center justify-between flex-1 p-2">
        {isLoading ? (
          <div className="flex items-center justify-center w-[140px] h-[140px]">
            <Spin />
          </div>
        ) : (
          <div className="flex items-center justify-center relative w-[140px] h-[140px]">
            <Doughnut data={data} options={options} />
            <div
              className="absolute flex flex-col items-center justify-center left-1/2 top-1/2"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <span className="font-bold text-2xl text-gray-900">{total}</span>
              <span className="text-sm text-gray-400">Total</span>
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
