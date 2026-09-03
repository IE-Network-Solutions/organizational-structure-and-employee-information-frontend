import { Card } from 'antd';
import React from 'react';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';

interface PayrollCardProps {
  title?: string;
  value?: string;
  growth?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  iconText?: string;
  'data-cy'?: string;
}

const PayrollCard: React.FC<PayrollCardProps> = ({
  title,
  value,
  growth,
  icon,
  iconBg,
  iconText,
  'data-cy': dataCy,
}) => {
  const growthNum = parseFloat(growth || '0');
  const isPositive = growthNum >= 0;

  return (
    <div
      id="payroll-summary-card-view-column"
      data-cy={dataCy || 'payroll-summary-card-view-column'}
      className="h-full w-full min-w-0"
    >
      <Card
        id="payroll-summary-card-view-card"
        data-cy="payroll-summary-card-view-card"
        bordered={false}
        className="h-full shadow-sm"
        style={{
          borderRadius: '10px',
          border: '1px solid #E1E3E7',
        }}
        styles={{ body: { padding: '16px' } }}
      >
        <div
          id="payroll-summary-card-title-row"
          data-cy="payroll-summary-card-title-row"
          className="flex items-center gap-2 mb-2"
        >
          {icon && (
            <span
              id="payroll-summary-card-icon-badge"
              data-cy="payroll-summary-card-icon-badge"
              className={`inline-flex items-center justify-center w-7 h-7 rounded-sm text-lg ${iconBg || 'bg-gray-100'} ${iconText || 'text-gray-500'}`}
            >
              <span
                id="payroll-summary-card-icon"
                data-cy="payroll-summary-card-icon"
                className="inline-flex items-center justify-center leading-none"
              >
                {icon}
              </span>
            </span>
          )}
          <p
            id="payroll-summary-card-title-view-text"
            data-cy="payroll-summary-card-title-view-text"
            className="text-gray-500 m-0 text-sm"
          >
            {title}
          </p>
        </div>
        <h3
          id="payroll-summary-card-value-view-text"
          data-cy="payroll-summary-card-value-view-text"
          className="text-xl font-semibold mb-4 text-gray-800"
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
            className={`inline-flex items-center gap-0.5 font-medium mr-1 ${isPositive ? 'text-success' : 'text-error'}`}
          >
            {isPositive ? (
              <TrendingUpOutlinedIcon
                className="!w-4 !h-4 text-current shrink-0"
                data-cy="payroll-summary-card-growth-up-icon"
              />
            ) : (
              <TrendingDownOutlinedIcon
                className="!w-4 !h-4 text-current shrink-0"
                data-cy="payroll-summary-card-growth-down-icon"
              />
            )}
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
