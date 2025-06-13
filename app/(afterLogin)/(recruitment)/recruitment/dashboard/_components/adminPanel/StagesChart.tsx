'use client';

import { Pie } from 'react-chartjs-2';
import { Card, Select } from 'antd';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const data = {
  labels: ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5', 'Stage 6'],
  datasets: [
    {
      label: 'Stages',
      data: [45, 90, 60, 84, 95, 92],
      backgroundColor: [
        '#4A6CF7',
        '#FA916B',
        '#42D29D',
        '#FDBA74',
        '#A78BFA',
        '#34D399',
      ],
      borderWidth: 0,
    },
  ],
};

const options: ChartOptions<'pie'> = {
  responsive: false, // required when manually setting width/height

  plugins: {
    legend: {
      position: 'right',
      labels: {
        usePointStyle: true,
        boxWidth: 6, // 👈 smaller width for the color box (default is 40)
        boxHeight: 6, // optional, if you want to set height too
        padding: 10,
      },
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const label = context.label || '';
          const value = context.parsed || 0;
          return `${label}: ${value}`;
        },
      },
    },
    datalabels: {
      color: '#ffffff',
      font: {
        weight: 'bold',
        size: 12,
      },
      formatter: (value: number) => {
        return `${value}`;
      },
    },
  },
};

export default function StagesChart() {
  return (
    <Card className="shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-[16px]">Stages</h3>
        <div className="flex gap-2">
          <Select
            defaultValue="Job"
            className="w-24 h-12"
            options={[{ value: 'Job', label: 'Job' }]}
          />
          <Select
            defaultValue="Stage"
            className="w-24 h-12"
            options={[{ value: 'Stage', label: 'Stage' }]}
          />
        </div>
      </div>
      <div className="flex justify-center">
        <Pie data={data} options={options} width={280} height={250} />
      </div>
    </Card>
  );
}
