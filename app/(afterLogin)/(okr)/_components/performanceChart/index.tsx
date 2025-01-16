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
import { MdCheckBoxOutlineBlank } from 'react-icons/md';
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

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  selectedPeriodId,
  userId,
}) => {
  const { data: scores } = useGetPerformance(selectedPeriodId, userId);

  const getHighestScore = () => {
    const scoresArray = scores?.map((score: any) => score?.totalscore) || [];
    return scoresArray.length > 0 ? Math.max(...scoresArray) : 0;
  };

  const highestScore = getHighestScore();
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
        data: scores?.map((score: any) => score?.totalscore),
        backgroundColor: scores?.map((score: any) =>
          score.totalscore === highestScore
            ? 'rgba(34, 69, 255, 1)'
            : 'rgb(233, 233, 255)',
        ),
        borderRadius: 10,
        barThickness: 50,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        max: 100,
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
  console.log(scores,")()()(")
  return (
    <div className="mb-10">
      <Bar data={data} options={options} />
      <div className="flex items-center justify-start mt-4 gap-4">
        <div className="flex justify-center items-center gap-1">
          <MdCheckBoxOutlineBlank className="w-4 h-4 rounded-md bg-[#4C4CFF] text-[#4C4CFF]" />
          <span>Highest Average Score</span>
        </div>
        <div className="flex justify-center items-center gap-1">
          <MdCheckBoxOutlineBlank className="w-4 h-4 rounded-md bg-[#E9E9FF] text-[#E9E9FF]" />
          <span>Average Score</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
