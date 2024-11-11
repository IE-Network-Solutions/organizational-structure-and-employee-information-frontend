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
import { WeeklyScore } from '@/types/dashboard/okr';
import { MdCheckBoxOutlineBlank } from 'react-icons/md';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);
const weeklyScores: WeeklyScore[] = [
  { label: 'Week 1', scoreValue: 40 },
  { label: 'Week 2', scoreValue: 90 },
  { label: 'Week 3', scoreValue: 60 },
  { label: 'Week 4', scoreValue: 75 },
];

const PerformanceChart = () => {
  const getHighestScore = () => {
    return Math.max(...weeklyScores?.map((score) => score.scoreValue));
  };

  const highestScore = getHighestScore();
  const data = {
    labels: weeklyScores?.map((score) => score.label),
    datasets: [
      {
        data: weeklyScores?.map((score) => score.scoreValue),
        backgroundColor: weeklyScores?.map((score) =>
          score.scoreValue === highestScore
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
