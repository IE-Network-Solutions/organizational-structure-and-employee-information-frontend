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
import { Select } from 'antd';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);
interface SelectData {
  key: string;
  value: string;
  label: string;
}

const weeklyScores: WeeklyScore[] = [
  { label: 'Week 1', scoreValue: 40 },
  { label: 'Week 2', scoreValue: 90 },
  { label: 'Week 3', scoreValue: 60 },
  { label: 'Week 4', scoreValue: 75 },
];

const SelfAttendance = () => {
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
  const items: SelectData[] = [
    { key: '1', value: 'weekly', label: 'Weekly' },
    { key: '2', value: 'monthly', label: 'Monthly' },
    { key: '3', value: 'quarterly', label: 'Quarterly' },
  ];

  return (
    <div className=" bg-white max-h-[410px] p-5 rounded-xl">
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold ">Self Attendance Report</div>
        <div className="pl-2">
          <Select
            placeholder="select"
            allowClear
            className="min-w-10  my-3 text-2xl font-semibold"
            options={items.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            defaultValue={items[0].value}
          />
        </div>
      </div>
      <Bar data={data} options={options} />
      <div className="flex justify-start mt-4 gap-5 text-bold">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-[rgba(34,69,255,1)] mr-2"></div>
          <span>Highest Average Score</span>
        </div>
        <div className="flex items-center mr-4">
          <div className="w-4 h-4 bg-[rgb(233,233,255)] mr-2"></div>
          <span>Average Score</span>
        </div>
      </div>
    </div>
  );
};

export default SelfAttendance;
