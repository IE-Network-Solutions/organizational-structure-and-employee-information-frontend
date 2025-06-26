import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  useGetVPLineGraphData,
  useGetAllMonth,
} from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { Skeleton } from 'antd';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
};

interface PayCardInterface {
  id?: string;
}

const LineGraph: React.FC<PayCardInterface> = ({ id }) => {
  const userId = useAuthenticationStore?.getState().userId;
  const { data: getAllMonth } = useGetAllMonth();
  const identifier = id ?? userId;

  const { data: lineGraph, isLoading: isGraphLoading } =
    useGetVPLineGraphData(identifier);
  const getMonthName = (id: string) => {
    return (
      getAllMonth?.items?.find((monthItem: any) => monthItem?.id === id) ?? {}
    );
  };

  const dataValue = lineGraph?.map((item: any) => {
    const monthData = getMonthName(item?.monthId);

    if (!monthData?.startDate || !monthData?.endDate) {
      return {
        ...item,
        monthName: '',
        MonthsName: '',
      };
    }

    const startDate = dayjs(monthData?.startDate);
    const endDate = dayjs(monthData?.endDate);

    const formattedStartDate = startDate.format('MMM D');
    const formattedEndDate = endDate.format('MMM D');

    return {
      ...item,
      monthName: monthData?.name ?? '',
      monthRange: `${formattedStartDate} - ${formattedEndDate}`,
    };
  });
  if (isGraphLoading) {
    return (
      <div>
        <Skeleton active />
      </div>
    );
  }

  // Legend color references
  const legendItems = [
    { color: '#4C4CFF', label: 'Highest Average Score' },
    { color: '#A5A6F6', label: 'Average Score' },
    { color: '#E9E9FF', label: 'Low Average Score' },
  ];

  // Find highest and lowest values
  const scores = dataValue?.map((item: any) => item?.vpScore) || [];

  // Assign colors: first bar is #4C4CFF (Highest), last bar is #E9E9FF (Lowest), all others are #A5A6F6 (Average)
  const barColors = scores.map((score: number, idx: number) => {
    if (idx === 0) return '#4C4CFF'; // Highest (first bar)
    if (idx === scores.length - 1) return '#E9E9FF'; // Lowest (last bar)
    return '#A5A6F6'; // Average
  });

  const data = {
    labels: dataValue?.map((item: any) => item?.monthRange),
    datasets: [
      {
        label: 'Score Data',
        data: scores,
        backgroundColor: barColors,
        borderColor: '#fff',
        borderWidth: 1,
        fill: false,
      },
    ],
  };

  return (
    <div>
      <Bar options={options} data={data} />
      <div className="flex items-center justify-between mt-4 w-full">
        <div className="flex items-center gap-4">
          <span
            className="inline-block rounded-full"
            style={{
              width: 18,
              height: 12,
              backgroundColor: legendItems[0].color,
            }}
          />
          <span className="text-sm text-gray-500 font-normal">
            {legendItems[0].label}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="inline-block rounded-full"
            style={{
              width: 18,
              height: 12,
              backgroundColor: legendItems[1].color,
            }}
          />
          <span className="text-sm text-gray-500 font-normal">
            {legendItems[1].label}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span
            className="inline-block rounded-full"
            style={{
              width: 18,
              height: 12,
              backgroundColor: legendItems[2].color,
            }}
          />
          <span className="text-sm text-gray-500 font-normal">
            {legendItems[2].label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LineGraph;
