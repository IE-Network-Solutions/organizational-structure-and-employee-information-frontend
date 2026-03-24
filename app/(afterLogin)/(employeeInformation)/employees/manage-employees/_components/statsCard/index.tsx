import React from 'react';
import { Card } from 'antd';

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  showHoverButton?: boolean;
  hoverButtonLabel?: string;
  onHoverButtonClick?: () => void;
  hoverButtonDataCy?: string;
  id?: string;
  'data-cy'?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  title,
  value,
  change,
  changeLabel = 'Since Last Month',
  showHoverButton = false,
  hoverButtonLabel = 'View Details',
  onHoverButtonClick,
  hoverButtonDataCy,
  id,
  'data-cy': dataCy,
}) => {
  const isPositive = change !== undefined && change >= 0;
  const changeColor = isPositive ? 'text-greenbg' : 'text-error';
  const changeSymbol = isPositive ? '+' : '-';
  const cardClassName = showHoverButton
    ? 'rounded-lg border border-gray-200 transition-all duration-300 ease-out transform-gpu'
    : 'rounded-lg border border-gray-200 shadow-sm';

  return (
    <div className={showHoverButton ? 'group relative' : ''}>
      <Card
        className={cardClassName}
        bodyStyle={{
          paddingTop: '13px',
          paddingBottom: '18px',
          paddingLeft: '12px',
          paddingRight: '12px',
        }}
        id={id}
        data-cy={dataCy}
      >
        <div data-cy="stats-card-body" className="flex flex-col gap-4">
          {/* Header with icon and title */}
          <div
            data-cy="stats-card-header"
            className="flex items-center gap-2 text-gray-600"
          >
            <span data-cy="stats-card-icon" className="text-lg">
              {icon}
            </span>
            <span
              data-cy="stats-card-title"
              className="text-sm font-normal text-gray-600/65"
            >
              {title}
            </span>
          </div>
          <div
            data-cy="stats-card-value-div"
            className={
              showHoverButton
                ? 'flex flex-col gap-2 transition-opacity duration-200 group-hover:opacity-0'
                : 'flex flex-col gap-2'
            }
          >
            <div
              data-cy="stats-card-value"
              className="text-3xl font-bold text-gray-900"
            >
              {value}
            </div>
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

          {/* Change indicator */}
        </div>
      </Card>

      {showHoverButton && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center ">
          <button
            type="button"
            className="pointer-events-none rounded-md bg-gray-200 px-4 py-1.5 text-xs font-medium text-gray-700 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100"
            onClick={onHoverButtonClick}
            data-cy={hoverButtonDataCy}
          >
            {hoverButtonLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
