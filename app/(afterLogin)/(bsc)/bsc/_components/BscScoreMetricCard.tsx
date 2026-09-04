'use client';

import React from 'react';
import { Progress } from 'antd';
import { formatScore } from '@/utils/bsc/rollup';

const shellClass =
  'flex h-full min-h-[190px] w-full min-w-0 flex-col justify-between gap-3 rounded-lg border border-[#D9D9D9] bg-white p-4 text-left shadow-none';

type Props = {
  label: string;
  percent: number;
  dataCy: string;
};

/** Compact metric tile matching RollupProgressCard visual language. */
export default function BscScoreMetricCard({ label, percent, dataCy }: Props) {
  const value = Math.min(Math.max(Number(percent) || 0, 0), 100);
  return (
    <div className={shellClass} data-cy={dataCy}>
      <div data-cy={`${dataCy}-header`}>
        <div
          className="mb-3 flex h-[34px] w-[34px] items-center justify-center rounded-[4px] bg-[#E6F4FF]"
          data-cy={`${dataCy}-icon`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="#1677FF"
            aria-hidden
          >
            <path d="M160-160v-320h160v320H160Zm240 0v-560h160v560H400Zm240 0v-200h160v200H640Z" />
          </svg>
        </div>
        <div
          className="text-[36px] font-semibold leading-none tracking-normal text-gray-900"
          data-cy={`${dataCy}-value`}
        >
          {formatScore(value)}%
        </div>
      </div>
      <div className="flex flex-col gap-2" data-cy={`${dataCy}-body`}>
        <div
          className="w-full truncate text-start text-base font-normal text-gray-500"
          data-cy={`${dataCy}-label`}
        >
          {label}
        </div>
        <div className="flex items-center gap-2" data-cy={`${dataCy}-progress`}>
          <Progress
            type="line"
            percent={value}
            showInfo={false}
            strokeColor="#1f4fd8"
            trailColor="#e5e7eb"
          />
        </div>
      </div>
    </div>
  );
}
