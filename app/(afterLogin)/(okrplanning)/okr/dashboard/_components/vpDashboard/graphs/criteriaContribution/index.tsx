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
    <Row
      gutter={[16, 10]}
      id="okr-criteriacontribution-row-display-row"
      data-cy="okr-criteriacontribution-row-display-row"
    >
      <Col
        xs={24}
        sm={24}
        md={24}
        lg={24}
        xl={24}
        id="okr-criteriacontribution-main-col-display-col"
        data-cy="okr-criteriacontribution-main-col-display-col"
      >
        <div
          className="flex flex-wrap  justify-between mb-4"
          id="okr-criteriacontribution-header-display-div"
          data-cy="okr-criteriacontribution-header-display-div"
        >
          <Title
            level={5}
            id="okr-criteriacontribution-title-display-title"
            data-cy="okr-criteriacontribution-title-display-title"
          >
            Criteria Contribution
          </Title>
          <CriteriaFilter data-cy="okr-criteriacontribution-criteria-filter-display-filter" />
        </div>

        <div
          className="flex items-center justify-center"
          id="okr-criteriacontribution-chart-wrapper-display-div"
          data-cy="okr-criteriacontribution-chart-wrapper-display-div"
        >
          {hasData ? (
            <div
              className="relative"
              style={{
                maxWidth: '200px',
                maxHeight: '300px',
              }}
              id="okr-criteriacontribution-doughnut-wrapper-display-div"
              data-cy="okr-criteriacontribution-doughnut-wrapper-display-div"
            >
              <Doughnut
                data={data}
                options={options}
                id="okr-criteriacontribution-doughnut-chart-display-chart"
                data-cy="okr-criteriacontribution-doughnut-chart-display-chart"
              />
              <div
                className="absolute inset-0 flex items-center justify-center"
                id="okr-criteriacontribution-total-overlay-display-div"
                data-cy="okr-criteriacontribution-total-overlay-display-div"
              >
                <div
                  className="text-center"
                  id="okr-criteriacontribution-total-content-display-div"
                  data-cy="okr-criteriacontribution-total-content-display-div"
                >
                  <p
                    className="text-2xl font-bold text-gray-800"
                    id="okr-criteriacontribution-total-value-display-p"
                    data-cy="okr-criteriacontribution-total-value-display-p"
                  >
                    100
                  </p>
                  <p
                    className="text-sm text-gray-500"
                    id="okr-criteriacontribution-total-label-display-p"
                    data-cy="okr-criteriacontribution-total-label-display-p"
                  >
                    Total
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <CustomizeRenderEmpty data-cy="okr-criteriacontribution-empty-indicator-display-indicator" />
          )}
        </div>

        {hasData && (
          <div
            className="flex justify-around mt-4"
            id="okr-criteriacontribution-legend-container-display-div"
            data-cy="okr-criteriacontribution-legend-container-display-div"
          >
            <div
              className="grid grid-cols-2 gap-4"
              id="okr-criteriacontribution-legend-grid-display-div"
              data-cy="okr-criteriacontribution-legend-grid-display-div"
            >
              {criteriaLabels.map((label: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3"
                  id={`okr-criteriacontribution-legend-item-display-div-${index}`}
                  data-cy={`okr-criteriacontribution-legend-item-display-div-${index}`}
                >
                  <svg
                    width="16"
                    height="21"
                    viewBox="0 0 10 11"
                    fill="none"
                    id={`okr-criteriacontribution-legend-color-display-svg-${index}`}
                    data-cy={`okr-criteriacontribution-legend-color-display-svg-${index}`}
                  >
                    <rect
                      y="0.5"
                      width="10"
                      height="10"
                      rx="5"
                      fill={colors[index]}
                      data-cy={`okr-dashboard-vpdashboard-graphs-criteriacontribution-index-tsx-rect-182-${index}`}
                    />
                  </svg>
                  <span
                    className="text-xs text-gray-600"
                    id={`okr-criteriacontribution-legend-label-display-span-${index}`}
                    data-cy={`okr-criteriacontribution-legend-label-display-span-${index}`}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Col>
      <Col
        xs={24}
        sm={24}
        md={6}
        lg={6}
        xl={6}
        id="okr-criteriacontribution-empty-col-display-col"
        data-cy="okr-criteriacontribution-empty-col-display-col"
      ></Col>
    </Row>
  );
};

export default CriteriaContributionChart;
