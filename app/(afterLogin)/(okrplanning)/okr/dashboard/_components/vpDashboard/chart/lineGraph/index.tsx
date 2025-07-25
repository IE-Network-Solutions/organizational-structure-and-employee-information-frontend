'use client';
import React, { useEffect } from 'react';
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
  useGetAllMonth,
  useGetVPLineGraphData,
} from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useDashboardVPStore } from '@/store/uistate/features/dashboard/vp';
import { Select } from 'antd';
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

  const { data: activeFiscalYear } = useGetActiveFiscalYears();
  const { data: monthData } = useGetAllMonth();

  const identifier = id ?? userId;
  const { data: lineGraph } = useGetVPLineGraphData(identifier);
  const { type, displayData, setDisplayData, setType } = useDashboardVPStore();
  const requests = [
    {
      type: 'Quarterly',
      value: 'Quarterly',
    },
    {
      type: 'Yearly',
      value: 'Yearly',
    },
  ];
  const handleChange = (value: string) => {
    setType(value);
  };

  useEffect(() => {
    if (type === 'Quarterly') {
      const session = activeFiscalYear?.sessions?.find(
        (item: any) => item.active,
      );
      const month = session?.months;

      if (month) {
        const filteredData = lineGraph
          ?.filter((item: any) =>
            month?.some((m: any) => m.id === item.monthId),
          )
          ?.map((item: any) => {
            const matchedMonth = month?.find((m: any) => m.id === item.monthId);
            return {
              ...item,
              monthName: matchedMonth?.startDate
                ? dayjs(matchedMonth.startDate).format('MMMM')
                : matchedMonth?.name,
            };
          });

        setDisplayData(filteredData);
      } else {
        setDisplayData([]);
      }
    } else if (type === 'Yearly') {
      if (monthData) {
        const filteredData = lineGraph?.map((item: any) => {
          const matchedMonth = monthData?.items?.find(
            (m: any) => m.id === item.monthId,
          );
          return {
            ...item,
            monthName: matchedMonth?.startDate
              ? dayjs(matchedMonth.startDate).format('MMMM')
              : matchedMonth?.name,
          };
        });
        setDisplayData(filteredData);
      } else {
        setDisplayData(lineGraph);
      }
    }
  }, [type, activeFiscalYear, lineGraph]);

  const data = {
    labels: displayData?.map((month: any) =>
      month.monthName ? month.monthName.toUpperCase().slice(0, 3) : 'Unknown',
    ),
    datasets: [
      {
        label: 'Actual Value',
        data: displayData?.map((item: any) => item.vpScore),
        backgroundColor: 'rgba(54, 54, 240, 0.7)',
        barPercentage: 0.5,
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
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'rect', // 'circle' | 'rect' | 'line' | etc.
          boxWidth: 14,
        },
      },
      title: {
        display: false,
      },
      datalabels: { display: false },
    },
  };

  return (
    <div className="border-[1px] border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold">Actual Value </h4>
        <div className="flex items-center space-x-1 text-sm text-gray-500 cursor-pointer">
          <Select
            placeholder="select"
            allowClear
            className="min-w-10   text-sm font-semibold border-none"
            options={requests.map((item) => ({
              value: item.type,
              label: item.value,
            }))}
            bordered={false}
            defaultValue="Quarterly"
            onChange={handleChange}
          />
        </div>
      </div>
      {/* <Bar options={options} data={data} height={180} /> */}
      <div className="flex  xl:hidden">
        {/* flex xl:hidden zoom in min 110{' '} */}
        <Bar data={data} options={options} height={220} />{' '}
      </div>
      <div className="hidden xl:flex 2xl:hidden">
        {/* hidden xl:flex 2xl:hidden mid 90 - 100 */}
        <Bar data={data} options={options} height={180} />{' '}
      </div>
      <div className="hidden 2xl:flex ">
        {/* hidden 2xl:flex = zoom out max 80 -75 */}
        <Bar data={data} options={options} height={130} />
      </div>{' '}
    </div>
  );
};

export default LineGraph;
