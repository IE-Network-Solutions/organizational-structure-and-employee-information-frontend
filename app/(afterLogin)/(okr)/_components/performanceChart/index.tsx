import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useGetPerformance } from '@/store/server/features/okrplanning/okr/dashboard/queries';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface PerformanceChartProps {
  selectedPeriodId: string;
  userId: string;
}

const legendItems = [
  { color: '#4C4CFF', label: 'Highest Average Score' },
  { color: '#A5A6F6', label: 'Average Score' },
  { color: '#E9E9FF', label: 'Low Average Score' },
];

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  selectedPeriodId,
  userId,
}) => {
  const { data: scores } = useGetPerformance(selectedPeriodId, userId);

  const getHighestScore = () => {
    const scoresArray = scores?.map((score: any) => score?.totalscore) || [];
    return scoresArray.length > 0 ? Math.max(...scoresArray) : 0;
  };
  const getLowestScore = () => {
    const scoresArray = scores?.map((score: any) => score?.totalscore) || [];
    return scoresArray.length > 0 ? Math.min(...scoresArray) : 0;
  };

  const highestScore = getHighestScore();
  const lowestScore = getLowestScore();
  const data = {
    labels: scores?.map((score: any) =>
      score?.weeknumber
        ? `Week ${score.weeknumber}`
        : score?.month
          ? `Month ${score.month}`
          : score?.day
            ? `Day ${score.day}`
            : '',
    ),
    datasets: [
      {
        data: scores?.map((score: any) => {
          if (score.totalscore === highestScore) return score.totalscore;
          if (score.totalscore === lowestScore) return score.totalscore;
          return score.totalscore;
        }),
        backgroundColor: scores?.map((score: any) => {
          if (score.totalscore === highestScore) return '#4C4CFF';
          if (score.totalscore === lowestScore) return '#E9E9FF';
          return '#A5A6F6';
        }),
        borderRadius: 10,
        barThickness: 50,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        max: 100,
        min: 0,
        grid: {
          color: '#E5E7EB',
        },
        ticks: {
          stepSize: 20,
          callback: function (
            tickValue: string | number,

          ) {
            return tickValue;
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
  };
  return (
    <div className="bg-white rounded-xl border border-[#F3F4F6] p-2 mb-2">
      <Bar data={data} options={options} height={100} />
      <div className="flex items-center justify-start mt-1 gap-8">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="inline-block rounded-full"
              style={{ width: 18, height: 12, backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-500 font-normal">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceChart;
