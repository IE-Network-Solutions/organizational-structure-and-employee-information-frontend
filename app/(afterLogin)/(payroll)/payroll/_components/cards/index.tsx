import { Card } from 'antd';
import React from 'react';
import { ArrowDownOutlined } from '@ant-design/icons';

interface PayrollCardProps {
  title?: string;
  value?: string;
  growth?: string;
}

const PayrollCard: React.FC<PayrollCardProps> = ({ title, value, growth }) => {
  const growthNum = parseFloat(growth || '0');
  const isPositive = growthNum >= 0;

  return (
    <div
      id="payroll-summary-card-view-column"
      data-cy="payroll-summary-card-view-column"
      className="w-full min-w-0 lg:w-auto lg:min-w-[calc(25%-12px)] lg:flex-shrink-0"
    >
      <Card
        id="payroll-summary-card-view-card"
        data-cy="payroll-summary-card-view-card"
        bordered={false}
        className="h-full shadow-sm"
        style={{
          borderRadius: '10px',
          border: '2px solid #A8AEB9',
        }}
        styles={{ body: { padding: '20px' } }}
      >
        <p
          id="payroll-summary-card-title-view-text"
          data-cy="payroll-summary-card-title-view-text"
          className="text-gray-500 mb-2 text-sm"
        >
          {title}
        </p>
        <h3
          id="payroll-summary-card-value-view-text"
          data-cy="payroll-summary-card-value-view-text"
          className="text-2xl font-bold mb-4 text-gray-800"
        >
          {value
            ? Number(value).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : '--'}
        </h3>
        <div
          id="payroll-summary-card-growth-view-container"
          data-cy="payroll-summary-card-growth-view-container"
          className="text-sm"
        >
          <span
            id="payroll-summary-card-growth-view-text"
            data-cy="payroll-summary-card-growth-view-text"
            className={`font-medium mr-1 ${isPositive ? 'text-success' : 'text-error'}`}
          >
            {!isPositive && (
              <ArrowDownOutlined data-cy="payroll-summary-card-growth-down-icon" />
            )}
            {!isPositive && ' '}
            {isPositive ? '+' : ''}
            {growth || '--'}
          </span>
          <span
            id="payroll-summary-card-growth-period-text"
            data-cy="payroll-summary-card-growth-period-text"
            className="text-gray-500"
          >
            Since last pay period
          </span>
        </div>
      </Card>
    </div>
  );
};

export default PayrollCard;
