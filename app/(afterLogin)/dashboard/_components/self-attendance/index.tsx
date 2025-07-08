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
import { Card, DatePicker } from 'antd';
import { useGetSelfAttendance } from '@/store/server/features/dashboard/self-attendance/queries';
import { useSelfAttendance } from '@/store/uistate/features/dashboard/self-attendace';

const { RangePicker } = DatePicker;

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const SelfAttendance = () => {
  const { dateRange, setDateRange } = useSelfAttendance(); // Access the Zustand store
  const handleDateChange = (dates: any) => {
    if (dates) {
      const startDate = dates[0]?.format('YYYY-MM-DD'); // Format start date
      const endDate = dates[1]?.format('YYYY-MM-DD'); // Format end date

      // Update the Zustand state with the formatted dates
      setDateRange(startDate, endDate);
    } else {
      setDateRange('', ''); // Handle case where no dates are selected
    }
  };
  const { data: selfAttendance, isLoading } = useGetSelfAttendance(
    dateRange?.start,
    dateRange?.end,
  );
  const getHighestScore = () => {
    return Math.max(...attendanceArray?.map((score) => score.count as number));
  };
  const attendanceArray = Object?.entries(selfAttendance || {}).map(
    ([name, count]) => ({
      name,
      count,
    }),
  );
  const highestScore = getHighestScore();
  const data = {
    labels: attendanceArray?.map((score) =>
      score.name.toString().toUpperCase(),
    ),
    datasets: [
      {
        data: attendanceArray?.map((score) => score.count),
        backgroundColor: attendanceArray?.map((score) =>
          score.count === highestScore
            ? 'rgba(34, 69, 255, 1)'
            : 'rgb(233, 233, 255)',
        ),
        borderRadius: 10,
        barThickness: 30, // Make bars thinner
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
    <Card
      bodyStyle={{ padding: 0 }}
      loading={isLoading}
      className="bg-white p-5 rounded-xl md:h-[222px]"
    >
      <div className="flex justify-between items-center">
        <div className="text-sm font-bold">Self Attendance Report</div>
        <div className="pl-2">
          <RangePicker
            id={{
              start: 'startInput',
              end: 'endInput',
            }}
            onChange={handleDateChange}
          />
        </div>
      </div>

      <div className="flex mt-4 gap-4 items-center">
        <div className="md:h-[150px] w-full ">
          {' '}
          {/* Adjust chart size */}
          <Bar data={data} options={options} />
        </div>

        {/* Add text beside the chart */}
        <div className="text-sm w-full ">
          <div className="flex items-center mb-2">
            <div className="w-4 h-4 bg-[rgba(34,69,255,1)] mr-2"></div>
            <span>Highest Average Score</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[rgb(233,233,255)] mr-2"></div>
            <span>Average Score</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SelfAttendance;
