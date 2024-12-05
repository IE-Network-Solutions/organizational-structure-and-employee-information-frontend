import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Select } from 'antd';

ChartJS.register(ArcElement, Tooltip, Legend);

const CriteriaContributionChart: React.FC = () => {
  const data = {
    // labels: ['OKR Score', 'Appreciation', 'KPI', 'Attendance'],
    datasets: [
      {
        data: [45, 25, 20, 10],
        backgroundColor: [
          'rgba(47, 120, 238, 1)',
          'rgba(54, 54, 240, 1)',
          'rgba(29, 155, 240, 1)',
          'rgba(160, 174, 192, 1)',
        ],
        hoverBackgroundColor: [
          'rgba(47, 120, 238, 1)',
          'rgba(54, 54, 240, 1)',
          'rgba(29, 155, 240, 1)',
          'rgba(160, 174, 192, 1)',
        ],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { size: 12 },
          color: '#555',
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}%`;
          },
        },
      },
    },
  };

  return (
    <div className="px-6 max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center justify-start">
          <h3 className="text-lg font-semibold text-gray-800">
            Criteria Contribution
          </h3>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.0781 19C10.1241 19 8.46879 18.3223 7.11212 16.967C5.75612 15.611 5.07813 13.9563 5.07812 12.003C5.07812 10.0497 5.75612 8.39433 7.11212 7.037C8.46812 5.67967 10.1235 5.00067 12.0781 5C13.2668 5 14.3798 5.28233 15.4171 5.847C16.4538 6.41167 17.2895 7.2 17.9241 8.212V5H18.9241V10.23H13.6941V9.23H17.3941C16.8728 8.23333 16.1401 7.44567 15.1961 6.867C14.2521 6.28833 13.2128 5.99933 12.0781 6C10.4115 6 8.99479 6.58333 7.82812 7.75C6.66146 8.91667 6.07812 10.3333 6.07812 12C6.07812 13.6667 6.66146 15.0833 7.82812 16.25C8.99479 17.4167 10.4115 18 12.0781 18C13.3615 18 14.5198 17.6333 15.5531 16.9C16.5865 16.1667 17.3115 15.2 17.7281 14H18.7901C18.3488 15.4973 17.5108 16.705 16.2761 17.623C15.0415 18.541 13.6421 19 12.0781 19Z"
              fill="#687588"
            />
          </svg>
        </div>
        <Select defaultValue="" className="text-sm border-gray-300 rounded">
          <Select.Option value="All-Time">All Time</Select.Option>
          <Select.Option value="Yearly">Yearly</Select.Option>
          <Select.Option value="">Session</Select.Option>
          <Select.Option>Monthly</Select.Option>
        </Select>
      </div>
      <div className="relative">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">100</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <div className="flex ">
          <div className="flex flex-col justify-center items-start">
            <div className="flex items-center gap-3 ">
              <svg
                width="16"
                height="21"
                viewBox="0 0 10 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect y="0.5" width="10" height="10" rx="5" fill="#2F78EE" />
              </svg>
              <span className="text-xs text-gray-600">OKR Score</span>
            </div>
            <div className="flex items-center gap-3">
              <svg
                width="16"
                height="21"
                viewBox="0 0 10 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect y="0.5" width="10" height="10" rx="5" fill="#3636F0" />
              </svg>
              <span className="text-xs text-gray-600">Appreciation</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start justify-center">
          <div className="flex items-center gap-3">
            <svg
              width="16"
              height="21"
              viewBox="0 0 10 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect y="0.5" width="10" height="10" rx="5" fill="#687588" />
            </svg>
            <span className="text-xs text-gray-600">KPI</span>
          </div>
          <div className="flex items-center gap-3 ">
            <svg
              width="16"
              height="21"
              viewBox="0 0 10 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect y="0.5" width="10" height="10" rx="5" fill="#1D9BF0" />
            </svg>
            <span className="text-xs text-gray-600">Attendance</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriteriaContributionChart;
