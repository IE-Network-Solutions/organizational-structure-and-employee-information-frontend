'use client';

import React from 'react';
import { Progress } from 'antd';
import { formatScore } from '@/utils/bsc/rollup';

/** Shared KPI tile height and chrome (dashboard-aligned). */
export const bscKpiMetricCardHeightClass = 'h-[122px]';

export const bscKpiMetricCardBorderClass =
  'shadow-none rounded-lg border border-[#D9D9D9] bg-white px-3 pt-3 pb-5';

/** Vertical metric tile (Recent Score, roll-ups). */
export const bscKpiMetricCardShellClass = `flex ${bscKpiMetricCardHeightClass} flex-none flex-col gap-4 ${bscKpiMetricCardBorderClass}`;

/** Horizontal summary tile (KPI name + donut). */
export const bscKpiSummaryCardShellClass = `flex ${bscKpiMetricCardHeightClass} min-w-0 flex-1 flex-none items-center gap-3 ${bscKpiMetricCardBorderClass}`;

const kpiIcon = (
  <svg
    data-cy="bsckpimetriccard-svg-20"
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="#1677FF"
    aria-hidden
  >
    <path
      data-cy="bsckpimetriccard-path-28"
      d="M160-160v-320h160v320H160Zm240 0v-560h160v560H400Zm240 0v-200h160v200H640Z"
    />
  </svg>
);

type Props = {
  label: string;
  percent: number;
  dataCy: string;
  onClick?: () => void;
  className?: string;
};

export default function BscKpiMetricCard({
  label,
  percent,
  dataCy,
  onClick,
  className = '',
}: Props) {
  const value = Math.min(Math.max(Number(percent) || 0, 0), 100);
  const display = `${formatScore(value)}%`;
  const clickable = Boolean(onClick);

  const shellClass = `${bscKpiMetricCardShellClass} ${className} ${
    clickable ? 'cursor-pointer text-left' : 'cursor-default'
  }`;

  const content = (
    <>
      <div
        className="flex items-center justify-between"
        data-cy={`${dataCy}-header`}
      >
        <div
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[4px] bg-[#E6F4FF]"
          data-cy={`${dataCy}-icon`}
        >
          {kpiIcon}
        </div>
        <div
          className="font-semibold text-[27px] leading-7 tracking-normal text-gray-900"
          data-cy={`${dataCy}-value`}
        >
          {display}
        </div>
      </div>
      <div className="mt-3 flex flex-col" data-cy={`${dataCy}-body`}>
        <div
          className="w-full text-start text-base font-normal text-gray-500"
          data-cy={`${dataCy}-label`}
        >
          {label}
        </div>
        <div className="flex items-center gap-2" data-cy={`${dataCy}-progress`}>
          <Progress
            size="small"
            percent={value}
            showInfo={false}
            strokeColor="#1f4fd8"
            trailColor="#e5e7eb"
            className="!m-0 w-full [&_.ant-progress-outer]:!w-full"
          />
        </div>
      </div>
    </>
  );

  if (clickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={shellClass}
        data-cy={dataCy}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={shellClass} data-cy={dataCy}>
      {content}
    </div>
  );
}
