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
import { Card } from 'antd';
import { useGetAnnualAttendance } from '@/store/server/features/dashboard/self-attendance/queries';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
);

const SelfAttendance = () => {
  const { data: annualAttendance, isLoading: attendanceIsLoading } =
    useGetAnnualAttendance();

  const data = {
    labels: annualAttendance?.calendar?.months?.map((month: any) =>
      month.monthName.toUpperCase(),
    ),
    datasets: [
      {
        label: 'Leaves',
        data: annualAttendance?.calendar?.months?.map(
          (month: any) => month.stats.leaves,
        ),
        backgroundColor: 'rgba(54, 54, 240, 0.7)',
      },

      {
        label: 'Lates',
        data: annualAttendance?.calendar?.months?.map(
          (month: any) => month.stats.lates,
        ),
        backgroundColor: 'rgba(2, 99, 255, 0.7)',
      },
      {
        label: 'Absents',
        data: annualAttendance?.calendar?.months?.map(
          (month: any) => month.stats.absents,
        ),
        backgroundColor: 'rgba(233, 233, 255, 0.7)',
      },
    ],
  };

  const options = {
    responsive: true,

    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'inherit', size: 14 } },
      },
      y: {
        max: 30,
        ticks: { stepSize: 10 },
        beginAtZero: true,
        grid: { color: '#9ca3af' },
      },
    },

    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'rect', // 'circle' | 'rect' | 'line' | etc.
          boxWidth: 14,
        },
      },
      title: {
        display: false,
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: (context: Context): string | undefined => {
          return context.dataset.backgroundColor as string;
        },
        font: {
          weight: 'bold',
          size: 12,
        },
        formatter: (value: number | string): string => {
          return value === 0 ? '' : String(value);
        },
      },
    },
  };

  return (
    <Card
      bodyStyle={{ padding: 0 }}
      loading={attendanceIsLoading}
      className="bg-white p-5 rounded-xl md:h-[404px]"
    >
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold">Annual Attendance Report</div>
        <div className="pl-2"></div>
      </div>

      <div className=" h-[300px]  mt-4 gap-4 items-center ">
        <Bar data={data} options={options} />
      </div>
    </Card>
  );
};

export default SelfAttendance;
