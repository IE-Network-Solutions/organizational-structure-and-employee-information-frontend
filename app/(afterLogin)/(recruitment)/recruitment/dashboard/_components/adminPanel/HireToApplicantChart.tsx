'use client';

import { Bar } from 'react-chartjs-2';
import { Card } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Hired',
      data: [60, 70, 50, 40, 80, 90, 85, 30, 40, 70, 80, 90],
      backgroundColor: '#4A6CF7',
    },
    {
      label: 'Applicant',
      data: [30, 20, 60, 70, 90, 70, 75, 60, 50, 80, 60, 95],
      backgroundColor: '#FA916B',
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
   
    legend: {
      position: 'top' as const,
      labels: {
        boxWidth: 10, // 👈 smaller width for the color box (default is 40)
        boxHeight: 10, // optional, if you want to set height too
        padding: 10
      },
    },
    datalabels:{display:false}
  },
};

export default function HireToApplicantChart() {
  return (
    <Card className="shadow-sm">
      <h3 className="font-semibold mb-4 text-[16px]">Hire to applicant Trend</h3>
      <Bar options={options} data={data} height={180} />
    </Card>
  );
}
