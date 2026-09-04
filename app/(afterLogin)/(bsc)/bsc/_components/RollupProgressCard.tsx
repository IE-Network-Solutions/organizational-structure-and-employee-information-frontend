'use client';

import React from 'react';
import { Progress } from 'antd';
import { formatScore, type RollupSummary } from '@/utils/bsc/rollup';

const rollupCardShellClass =
  'flex flex-col gap-4 h-[148px] min-w-[260px] flex-none rounded-lg border border-[#D9D9D9] bg-white p-4 text-left shadow-none transition-shadow hover:shadow-sm cursor-pointer';

type Props = {
  rollup: RollupSummary;
  label?: string;
  onClick?: () => void;
  dataCy: string;
};

export default function RollupProgressCard({
  rollup,
  label,
  onClick,
  dataCy,
}: Props) {
  const percent = Number(rollup.averageScore || 0);
  const displayLabel =
    label ||
    (rollup.scope === 'company'
      ? 'Company-wide Scorecard'
      : `${rollup.label} Scorecard`);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`${rollupCardShellClass} ${
        onClick ? '' : 'cursor-default hover:shadow-none'
      }`}
      data-cy={dataCy}
    >
      <div
        className="flex items-center justify-between"
        data-cy={`${dataCy}-header`}
      >
        <div
          className="rounded-[4px] bg-[#E6F4FF] flex items-center justify-center w-[34px] h-[34px]"
          data-cy={`${dataCy}-icon`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#1677FF"
            aria-hidden
            data-cy={`${dataCy}-icon-svg`}
          >
            <path
              d="M160-160v-320h160v320H160Zm240 0v-560h160v560H400Zm240 0v-200h160v200H640Z"
              data-cy={`${dataCy}-icon-path`}
            />
          </svg>
        </div>
        <div
          className="font-semibold text-[27px] leading-7 tracking-normal text-gray-900"
          data-cy={`${dataCy}-value`}
        >
          {formatScore(percent)}%
        </div>
      </div>
      <div className="flex flex-col mt-3" data-cy={`${dataCy}-body`}>
        <div
          className="text-gray-500 w-full font-normal text-base text-start truncate"
          data-cy={`${dataCy}-label`}
        >
          {displayLabel}
        </div>
        <div className="flex gap-2 items-center" data-cy={`${dataCy}-progress`}>
          <Progress
            percent={percent}
            showInfo={false}
            strokeColor="#1f4fd8"
            trailColor="#e5e7eb"
          />
        </div>
      </div>
    </button>
  );
}
