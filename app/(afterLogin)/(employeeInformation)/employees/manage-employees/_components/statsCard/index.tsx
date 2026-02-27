import React from 'react';
import { Card } from 'antd';

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  id?: string;
  'data-cy'?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  title,
  value,
  change,
  changeLabel = 'Since Last Month',
  id,
  'data-cy': dataCy,
}) => {
  const isPositive = change !== undefined && change >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeSymbol = isPositive ? '+' : '';

  return (
    <Card
      className="rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
      bodyStyle={{ padding: '20px' }}
      id={id}
      data-cy={dataCy}
    >
      <div data-cy="stats-card-body" className="flex flex-col gap-3">
        {/* Header with icon and title */}
        <div
          data-cy="stats-card-header"
          className="flex items-center gap-2 text-gray-600"
        >
          <span data-cy="stats-card-icon" className="text-lg">
            {icon}
          </span>
          <span data-cy="stats-card-title" className="text-sm font-medium">
            {title}
          </span>
        </div>

        {/* Main value */}
        <div
          data-cy="stats-card-value"
          className="text-3xl font-bold text-gray-900"
        >
          {value}
        </div>

        {/* Change indicator */}
        {change !== undefined && (
          <div
            data-cy="stats-card-change-div"
            className={`text-sm font-medium ${changeColor} flex items-center gap-1`}
          >
            <span data-cy="stats-card-change-symbol">
              {changeSymbol}
              {change}
            </span>
            <span
              data-cy="stats-card-change-label"
              className="text-gray-500 font-normal"
            >
              {changeLabel}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;
