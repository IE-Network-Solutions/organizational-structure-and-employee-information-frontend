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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
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
        stacked: false,
        barPercentage: 1.0, // increases bar width within each group
        categoryPercentage: 0.8, // controls spacing between groups
      },
      y: {
        max: 30,
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle', // 'circle' | 'rect' | 'line' | etc.
          boxWidth: 10, // smaller size
        },
      },
      title: {
        display: false,
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
