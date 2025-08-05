'use client';

import { Bar } from 'react-chartjs-2';
import { Card, Spin } from 'antd';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useGetHiredApplicantTrend } from '@/store/server/features/recruitment/dashboard/queries';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        boxWidth: 10, // 👈 smaller width for the color box (default is 40)
        boxHeight: 10, // optional, if you want to set height too
        padding: 10,
      },
    },
    datalabels: { display: false },
  },
};

export default function HireToApplicantChart() {
  const { data: hiredApplicantTrend, isLoading } = useGetHiredApplicantTrend();

  // Transform API data to chart format
  const chartData = {
    labels: hiredApplicantTrend?.map((item: any) => item.month) || [],
    datasets: [
      {
        label: 'Hired',
        data: hiredApplicantTrend?.map((item: any) => item.hired) || [],
        backgroundColor: '#8979FF',
      },
      {
        label: 'Applicant',
        data: hiredApplicantTrend?.map((item: any) => item.applicant) || [],
        backgroundColor: '#FF928A',
      },
    ],
  };

  return (
    <Card className="shadow-lg mx-1 ">
      <h3 className="font-semibold mb-4 text-[16px]">
        Hire to applicant Trend
      </h3>
      {isLoading ? (
        <div className="flex justify-center items-center ">
          <Spin size="large" />
        </div>
      ) : (
        <div className="flex justify-center items-center md:h-[300px] h-[200px]">
          <Bar options={options} data={chartData} />
        </div>
      )}
    </Card>
  );
}
