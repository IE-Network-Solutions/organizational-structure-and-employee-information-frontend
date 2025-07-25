import { useGetVPScore } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Empty } from 'antd';
import { Doughnut } from 'react-chartjs-2';

import React from 'react';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);
interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderWidth: number;
    hoverOffset: number;
  }[];
}
const CriteriaDoughnut = () => {
  const userId = useAuthenticationStore.getState().userId;

  const { data: vpScore } = useGetVPScore(userId);
  const labels = vpScore?.criteria?.map((status: any) => status.name); // ['Full-time', 'Part-time', 'Contractor']
  const dataValues = vpScore?.criteria?.map((status: any) =>
    Number(status.score),
  );
  const totalCount = vpScore?.score;
  const data: ChartData = {
    labels: labels || [],
    datasets: [
      {
        data: dataValues || [], // Sample data for full-time, part-time, and others
        backgroundColor: [
          '#1E3A8A', // Navy Blue
          '#2563EB', // Royal Blue
          '#3B82F6', // Blue
          '#60A5FA', // Sky Blue
          '#93C5FD', // Light Blue
          '#EF4444', // Red
        ],

        borderWidth: 4,
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
      datalabels: { display: false },
    },
    elements: {
      arc: { borderWidth: 0 },
    },
  };
  return (
    <div className=" border-[1px] border-gray-200 rounded-lg p-1 px-2 ">
      <div className="text-lg font-bold">Criteria Contribution</div>{' '}
      <div className=" ">
        {vpScore?.criteria?.length ? (
          <div className="flex items-center justify-between gap-3 lg:gap-1 mt-[13px] ">
            <div className="relative flex items-center justify-center w-[150px] 2xl:w-[180px] h-[150px] 2xl:h-[180px] overflow-visible z-10">
              <Doughnut data={data} options={options} className="z-20" />
              <div
                className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center z-0"
                style={{ transform: 'translate(-50%, -50%)' }}
              >
                <div
                  className="bg-white border border-gray-200 shadow-md rounded-full flex flex-col items-center justify-center"
                  style={{ width: 80, height: 80 }}
                >
                  <span className="font-bold text-2xl text-gray-900">
                    {totalCount?.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-400">Total</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 ">
              {data.labels.map((label: string, i: number) => (
                <div key={i} className="flex items-center gap-1">
                  <div
                    style={{
                      backgroundColor: data.datasets[0].backgroundColor[i],
                    }}
                    className="w-2 h-2 rounded-full mr-2"
                  />
                  <span className="text-[10px] 2xl:text-xs font-normal">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
};

export default CriteriaDoughnut;
