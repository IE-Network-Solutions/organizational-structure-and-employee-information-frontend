import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Typography } from 'antd';
import { MdCheckBoxOutlineBlank } from 'react-icons/md';

const { Title } = Typography;
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface CriteriaContributionProps {
  variablePay: any | null;
}
const ActualVsTargetChart: React.FC<CriteriaContributionProps> = ({
  variablePay,
}) => {
  const data = {
    labels: variablePay?.map((item: any) => item?.criteriaName),
    datasets: [
      {
        data: variablePay?.map((item: any) => item?.actualScore),
        backgroundColor: 'rgba(178, 178, 255, 1)',
        barThickness: 30,
      },
      {
        data: variablePay?.map((item: any) => item?.targetValue),
        backgroundColor: 'rgba(54, 54, 240, 1)',
        barThickness: 30,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.raw}%`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#555', font: { size: 12 } },
        grid: { display: false },
      },
      y: {
        ticks: { color: '#555', font: { size: 12 } },
        grid: { color: 'rgba(200, 200, 200, 0.2)' },
      },
    },
  };

  return (
    <div
      id="okr-actualvstarget-container-display-div"
      data-cy="okr-actualvstarget-container-display-div"
    >
      <div
        className="flex items-center justify-between mb-4"
        id="okr-actualvstarget-header-display-div"
        data-cy="okr-actualvstarget-header-display-div"
      >
        <Title
          level={5}
          id="okr-actualvstarget-title-display-title"
          data-cy="okr-actualvstarget-title-display-title"
        >
          Actual Vs Target
        </Title>
      </div>
      <Bar
        data={data}
        options={options}
        id="okr-actualvstarget-bar-chart-display-chart"
        data-cy="okr-actualvstarget-bar-chart-display-chart"
      />
      <div
        className="flex items-center justify-start mt-4 ml-6 gap-4 "
        id="okr-actualvstarget-legend-display-div"
        data-cy="okr-actualvstarget-legend-display-div"
      >
        <div
          className="flex justify-center items-center gap-1"
          id="okr-actualvstarget-legend-target-display-div"
          data-cy="okr-actualvstarget-legend-target-display-div"
        >
          <MdCheckBoxOutlineBlank
            className="w-4 h-4 rounded-full bg-[#3636F0] text-[#3636F0]"
            id="okr-actualvstarget-legend-target-color-display-icon"
            data-cy="okr-actualvstarget-legend-target-color-display-icon"
          />
          <span
            className="text-gray-500"
            id="okr-actualvstarget-legend-target-label-display-span"
            data-cy="okr-actualvstarget-legend-target-label-display-span"
          >
            Target Value
          </span>
        </div>
        <div
          className="flex justify-center items-center gap-1"
          id="okr-actualvstarget-legend-actual-display-div"
          data-cy="okr-actualvstarget-legend-actual-display-div"
        >
          <MdCheckBoxOutlineBlank
            className="w-4 h-4 rounded-full bg-[#B2B2FF] text-[#B2B2FF]"
            id="okr-actualvstarget-legend-actual-color-display-icon"
            data-cy="okr-actualvstarget-legend-actual-color-display-icon"
          />
          <span
            className="text-gray-500"
            id="okr-actualvstarget-legend-actual-label-display-span"
            data-cy="okr-actualvstarget-legend-actual-label-display-span"
          >
            Actual Value
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActualVsTargetChart;
