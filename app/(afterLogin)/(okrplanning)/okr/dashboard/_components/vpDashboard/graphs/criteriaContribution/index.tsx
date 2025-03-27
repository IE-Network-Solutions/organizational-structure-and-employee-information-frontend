import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Col, Row, Typography } from 'antd';
import CriteriaFilter from '../criteriaFilter';
import { CustomizeRenderEmpty } from '@/components/emptyIndicator';

ChartJS.register(ArcElement, Tooltip, Legend);
const { Title } = Typography;

interface CriteriaContributionProps {
  variablePay: any | null;
}

const generateColors = (count: number) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  return Array.from({ length: count }, (_, index) => {
    const hue = 210 + ((index * 15) % 30);
    const saturation = 80;
    const lightness = 50 + ((index * 5) % 30);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  });
};

const CriteriaContributionChart: React.FC<CriteriaContributionProps> = ({
  variablePay,
}) => {
  const hasData = variablePay && variablePay.length > 0;

  const criteriaLabels = hasData
    ? variablePay.map((item: any) => item?.criteriaName || 'Unknown')
    : [];
  const scores = hasData
    ? variablePay.map((item: any) => item?.actualScore?.toFixed(2) || 0)
    : [];
  const colors = generateColors(criteriaLabels.length);

  const data = {
    datasets: [
      {
        data: scores,
        backgroundColor: colors,
        hoverBackgroundColor: colors,
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
      <Col xs={24} sm={24} md={24} lg={24} xl={24}>
        <div className="flex flex-wrap  justify-between mb-4">
          <Title level={5}>Criteria Contribution</Title>
          <CriteriaFilter />
        </div>

        <div className="flex items-center justify-center">
          {hasData ? (
            <div
              className="relative"
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
            </div>
          ) : (
            <CustomizeRenderEmpty />
          )}
        </div>

        {hasData && (
          <div className="flex justify-around mt-4">
            <div className="grid grid-cols-2 gap-4">
              {criteriaLabels.map((label: string, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <svg width="16" height="21" viewBox="0 0 10 11" fill="none">
                    <rect
                      y="0.5"
                      width="10"
                      height="10"
                      rx="5"
                      fill={colors[index]}
                    />
                  </svg>
                  <span className="text-xs text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Col>
      <Col xs={24} sm={24} md={6} lg={6} xl={6}></Col>
    </Row>
  );
};

export default CriteriaContributionChart;
