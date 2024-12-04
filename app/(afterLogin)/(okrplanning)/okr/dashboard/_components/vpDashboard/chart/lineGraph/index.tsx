import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Select } from 'antd';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Chart.js Line Chart',
    },
  },
};

const labels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const data = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: [10, 25, 40, 55, 70, 85, 95, 110, 125, 140, 155, 170],
      borderColor: '#3636f0',
      backgroundColor: '#3636f0',
    },
  ],
};
const LineGraph: React.FC = () => {
  return (
    <div className="rounded-lg bg-white ">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Performance</h3>
        <Select className="text-sm border-gray-300 rounded">
          <Select.Option>Yearly</Select.Option>
          <Select.Option>Monthly</Select.Option>
        </Select>
      </div>
      <Line options={options} data={data} />
    </div>
  );
};

export default LineGraph;
