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

const LineGraph: React.FC = () => {
  const userId = useAuthenticationStore?.getState().userId;
  const { data: getAllMonth } = useGetAllMonth();

  const { data: lineGraph, isLoading: isGraphLoading } =
    useGetVPLineGraphData(userId);
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

  const data = {
    labels: dataValue?.map((item: any) => item?.monthRange),
    datasets: [
      {
        label: 'Score Data',
        data: dataValue?.map((item: any) => item?.vpScore),
        borderColor: '#3636f0',
        backgroundColor: '#3636f0',
        fill: false,
      },
    ],
  };

  return (
    <div>
      <Line options={options} data={data} />
    </div>
  );
};

export default LineGraph;
