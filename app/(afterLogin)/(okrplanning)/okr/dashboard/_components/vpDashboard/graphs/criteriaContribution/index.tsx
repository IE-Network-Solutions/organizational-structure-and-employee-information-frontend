import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Col, Row, Typography } from 'antd';

ChartJS.register(ArcElement, Tooltip, Legend);
const { Title } = Typography;

interface CriteriaContributionProps {
  variablePay: any | null;
}
const CriteriaContributionChart: React.FC<CriteriaContributionProps> = ({
  variablePay,
}) => {
  const data = {
    // labels: '',
    datasets: [
      {
        data: variablePay?.map((item: any) => item?.actualScore),
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
    <Row gutter={[16, 10]}>
      <Col xs={24} sm={24} md={18} lg={18} xl={18}>
        <div className="flex flex-wrap items-center justify-between mb-4">
          <Title level={5}> Criteria Contribution</Title>
        </div>
        <div className="flex items-center justify-center">
          <div
            className="relative "
            style={{
              maxWidth: '200px',
              maxHeight: '300px',
            }}
          >
            <Doughnut data={data} options={options} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">100</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>

            <div
              className="absolute text-center bg-white shadow-lg w-16 h-16 rounded-full flex flex-col items-center justify-center px-3 z-0"
              style={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: '-1',
              }}
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">100</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-around mt-4">
          <div className="flex">
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
      </Col>
      <Col xs={24} sm={24} md={6} lg={6} xl={6}></Col>
    </Row>
  );
};

export default CriteriaContributionChart;
