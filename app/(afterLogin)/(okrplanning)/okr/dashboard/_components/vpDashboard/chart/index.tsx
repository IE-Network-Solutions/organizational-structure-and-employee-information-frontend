import React from 'react';
import VPPayCard from './vpCard';
import LineGraph from './lineGraph';
import { useGetVPScore } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { Doughnut } from 'react-chartjs-2';

import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Tooltip as AntTooltip } from 'antd';
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

interface VPChartProps {
  id?: string;
}
const VPChart: React.FC<VPChartProps> = ({ id }) => {
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
          '#003366', // darker navy
          '#004080',
          '#0047b3',
          '#005ce6',
          '#1a75ff',
          '#3399ff',
          '#4db8ff',
          '#80ccff',
          '#b3e0ff',
          '#e6f5ff', // very light blue
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
    <div className=" flex flex-col sm:flex-row items-center justify-between gap-2 mx-2 h-auto sm:h-96 xl:h-700px">
      <div className="w-full sm:w-5/12 h-full flex flex-col gap-2">
        {/* Top (fixed height) */}
        <div className="">
          <VPPayCard id={id} />
        </div>

        {/* Bottom (fills remaining space, but at least min-h-40) */}
        <div className=" border-[1px] border-gray-200 rounded-lg p-2 flex-1 min-h-40 ">
          <div className="text-lg font-bold ml-1">Criteria Contribution</div>{' '}
          <div className=" ">
            {vpScore?.criteria?.length ? (
              <div className="flex items-center justify-between p-1 gap-3 lg:gap-4 2xl:gap-3 mt-[13px]  h-full">
                <div className="pl-5 relative flex items-center justify-center w-40 2xl:w-1/2 h-40 2xl:h-44 overflow-visible z-10 ">
                  <Doughnut data={data} options={options} className="z-20" />
                  <div
                    className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center z-0 pl-5"
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
                <div className="flex flex-col gap-1 flex-1  pr-5 h-36 lg:ml-5 xl:ml-10 2xl:ml-15 3xl:ml-20   overflow-y-scroll scrollbar-hide   items-start">
                  {data.labels.map((label: string, i: number) => (
                    <div key={i} className="flex items-center gap-1">
                      <div
                        style={{
                          backgroundColor: data.datasets[0].backgroundColor[i],
                        }}
                        className="w-2 h-2 rounded-full mr-2"
                      />
                      <span className="text-[10px] 2xl:text-xs font-normal">
                        <AntTooltip title={label}>
                          {label?.length > 20
                            ? label?.slice(0, 20) + '...'
                            : label}
                        </AntTooltip>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="min-h-32 h-full  flex items-center justify-center">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-gray-400 text-sm">
                    No data available
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className=" w-full sm:w-7/12 h-full">
        <LineGraph id={id} />
      </div>
    </div>
  );
};

export default VPChart;
