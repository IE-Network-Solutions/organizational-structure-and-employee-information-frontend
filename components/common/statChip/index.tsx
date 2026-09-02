'use client';

import React from 'react';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';

interface StatChipProps {
  label: string;
  value: React.ReactNode;
  meta?: React.ReactNode;
  growth?: string;
  growthLabel?: React.ReactNode;
  growthUpIsGood?: boolean;
  expanded?: boolean;
  valueClassName?: string;
  className?: string;
  'data-cy'?: string;
}

const expandedLayoutClass =
  'flex min-h-[62px] min-w-0 flex-1 items-end justify-between gap-2 px-2.5 py-1.5 text-left';

const StatChip: React.FC<StatChipProps> = ({
  label,
  value,
  meta,
  growth,
  growthLabel,
  growthUpIsGood = true,
  expanded = false,
  valueClassName = 'text-gray-900',
  className = '',
  'data-cy': dataCy = 'stat-chip',
}) => {
  const growthNum = parseFloat(String(growth ?? '').replace(/,/g, ''));
  const hasGrowth = Boolean(growth) && Number.isFinite(growthNum);
  const isExpanded = expanded || hasGrowth;
  const isUp = hasGrowth && growthNum > 0;
  const isDown = hasGrowth && growthNum < 0;
  const isFavorable = growthUpIsGood ? isUp : isDown;
  const isUnfavorable = growthUpIsGood ? isDown : isUp;
  const growthClass = isFavorable
    ? 'text-success'
    : isUnfavorable
      ? 'text-error'
      : 'text-gray-500';
  const growthDisplay = String(growth ?? '').replace(/^\+/, '');
  const sideLabel = growthLabel ?? meta;

  return (
    <div
      className={`min-w-0 rounded-lg border border-gray-200 bg-white ${
        isExpanded ? expandedLayoutClass : 'px-2 py-1 text-center'
      } ${className}`}
      data-cy={dataCy}
    >
      <div
        className={isExpanded ? 'min-w-0' : undefined}
        data-cy={`${dataCy}-content`}
      >
        <span
          className="block text-[10px] text-gray-500"
          data-cy={`${dataCy}-label`}
        >
          {label}
        </span>
        <span
          className={`block font-semibold text-sm ${valueClassName}`}
          data-cy={`${dataCy}-value`}
        >
          {value}
        </span>
        {!isExpanded && meta ? (
          <span
            className="block text-[10px] text-gray-500"
            data-cy={`${dataCy}-meta`}
          >
            {meta}
          </span>
        ) : null}
      </div>
      {isExpanded ? (
        <div
          className="shrink-0 text-right"
          data-cy={`${dataCy}-growth-container`}
        >
          {hasGrowth ? (
            <span
              className={`inline-flex items-center justify-end gap-0.5 text-sm font-medium ${growthClass}`}
              data-cy={`${dataCy}-growth`}
            >
              {isUp ? (
                <TrendingUpOutlinedIcon
                  className="!h-4 !w-4 shrink-0 text-current"
                  data-cy={`${dataCy}-growth-up-icon`}
                />
              ) : isDown ? (
                <TrendingDownOutlinedIcon
                  className="!h-4 !w-4 shrink-0 text-current"
                  data-cy={`${dataCy}-growth-down-icon`}
                />
              ) : null}
              {isUp ? '+' : ''}
              {growthDisplay}
            </span>
          ) : (
            <span
              className="block text-sm font-medium text-gray-400"
              data-cy={`${dataCy}-growth`}
            >
              --
            </span>
          )}
          {sideLabel ? (
            <span
              className="block text-[10px] text-gray-500"
              data-cy={`${dataCy}-growth-label`}
            >
              {sideLabel}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default StatChip;
