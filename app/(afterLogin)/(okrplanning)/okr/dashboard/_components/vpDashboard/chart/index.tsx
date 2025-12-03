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
    <div
      className=" flex flex-col sm:flex-row items-center justify-between gap-2 mx-2 h-auto sm:h-96 xl:h-700px"
      id="okr-vpchart-container-display-div"
      data-cy="okr-vpchart-container-display-div"
    >
      <div
        className="w-full sm:w-5/12 h-full flex flex-col gap-2"
        id="okr-vpchart-left-section-display-div"
        data-cy="okr-vpchart-left-section-display-div"
      >
        {/* Top (fixed height) */}
        <div
          id="okr-vpchart-paycard-wrapper-display-div"
          data-cy="okr-vpchart-paycard-wrapper-display-div"
        >
          <VPPayCard data-cy="okr-vppaycard-card-display-card" id={id} />
        </div>

        {/* Bottom (fills remaining space, but at least min-h-40) */}
        <div
          className=" border-[1px] border-gray-200 rounded-lg p-2 flex-1 min-h-40 "
          id="okr-vpchart-criteria-contribution-wrapper-display-div"
          data-cy="okr-vpchart-criteria-contribution-wrapper-display-div"
        >
          <div
            className="text-lg font-bold ml-1"
            id="okr-vpchart-criteria-contribution-title-display-div"
            data-cy="okr-vpchart-criteria-contribution-title-display-div"
          >
            Criteria Contribution
          </div>{' '}
          <div
            id="okr-vpchart-criteria-contribution-content-display-div"
            data-cy="okr-vpchart-criteria-contribution-content-display-div"
          >
            {vpScore?.criteria?.length ? (
              <div
                className="flex items-center justify-between p-1 gap-3 lg:gap-4 2xl:gap-3 mt-[13px]  h-full"
                id="okr-vpchart-criteria-contribution-chart-container-display-div"
                data-cy="okr-vpchart-criteria-contribution-chart-container-display-div"
              >
                <div
                  className="pl-5 relative flex items-center justify-center w-40 2xl:w-1/2 h-40 2xl:h-44 overflow-visible z-10 "
                  id="okr-vpchart-doughnut-wrapper-display-div"
                  data-cy="okr-vpchart-doughnut-wrapper-display-div"
                >
                  <Doughnut
                    data={data}
                    options={options}
                    className="z-20"
                    id="okr-vpchart-doughnut-chart-display-chart"
                    data-cy="okr-vpchart-doughnut-chart-display-chart"
                  />
                  <div
                    className="absolute left-1/2 top-1/2 flex flex-col items-center justify-center z-0 pl-5"
                    style={{ transform: 'translate(-50%, -50%)' }}
                    id="okr-vpchart-total-overlay-display-div"
                    data-cy="okr-vpchart-total-overlay-display-div"
                  >
                    <div
                      className="bg-white border border-gray-200 shadow-md rounded-full flex flex-col items-center justify-center"
                      style={{ width: 80, height: 80 }}
                      id="okr-vpchart-total-circle-display-div"
                      data-cy="okr-vpchart-total-circle-display-div"
                    >
                      <span
                        className="font-bold text-2xl text-gray-900"
                        id="okr-vpchart-total-value-display-span"
                        data-cy="okr-vpchart-total-value-display-span"
                      >
                        {totalCount?.toLocaleString()}
                      </span>
                      <span
                        className="text-sm text-gray-400"
                        id="okr-vpchart-total-label-display-span"
                        data-cy="okr-vpchart-total-label-display-span"
                      >
                        Total
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className="flex flex-col gap-1 flex-1  pr-5 h-36 lg:ml-5 xl:ml-10 2xl:ml-15 3xl:ml-20   overflow-y-scroll scrollbar-hide   items-start"
                  id="okr-vpchart-legend-container-display-div"
                  data-cy="okr-vpchart-legend-container-display-div"
                >
                  {data.labels.map((label: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-1"
                      id={`okr-vpchart-legend-item-display-div-${i}`}
                      data-cy={`okr-vpchart-legend-item-display-div-${i}`}
                    >
                      <div
                        style={{
                          backgroundColor: data.datasets[0].backgroundColor[i],
                        }}
                        className="w-2 h-2 rounded-full mr-2"
                        id={`okr-vpchart-legend-color-display-div-${i}`}
                        data-cy={`okr-vpchart-legend-color-display-div-${i}`}
                      />
                      <span
                        className="text-[10px] 2xl:text-xs font-normal"
                        id={`okr-vpchart-legend-label-display-span-${i}`}
                        data-cy={`okr-vpchart-legend-label-display-span-${i}`}
                      >
                        <AntTooltip data-cy="okr-vpchart-legend-tooltip-display-tooltip" title={label}>
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
              <div
                className="min-h-32 h-full  flex items-center justify-center"
                id="okr-vpchart-empty-state-display-div"
                data-cy="okr-vpchart-empty-state-display-div"
              >
                <div
                  className="flex flex-col items-center justify-center"
                  id="okr-vpchart-empty-state-content-display-div"
                  data-cy="okr-vpchart-empty-state-content-display-div"
                >
                  <span
                    className="text-gray-400 text-sm"
                    id="okr-vpchart-empty-state-message-display-span"
                    data-cy="okr-vpchart-empty-state-message-display-span"
                  >
                    No data available
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className=" w-full sm:w-7/12 h-full"
        id="okr-vpchart-linegraph-wrapper-display-div"
        data-cy="okr-vpchart-linegraph-wrapper-display-div"
      >
        <LineGraph data-cy="okr-vplinegraph-graph-display-graph" id={id} />
      </div>
    </div>
  );
};

export default VPChart;
