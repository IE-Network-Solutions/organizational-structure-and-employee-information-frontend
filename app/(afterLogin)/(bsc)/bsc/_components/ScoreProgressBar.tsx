'use client';

import React from 'react';
import { Progress } from 'antd';
import { formatScore } from '@/utils/bsc/rollup';

type Props = {
  value: number | null | undefined;
  dataCy: string;
  /** When set, used instead of "—" if value is missing (demo / empty states). */
  mockFallback?: number | null;
  className?: string;
};

export default function ScoreProgressBar({
  value,
  dataCy,
  mockFallback = null,
  className,
}: Props) {
  const resolved =
    value != null && Number.isFinite(value)
      ? value
      : mockFallback != null && Number.isFinite(mockFallback)
        ? mockFallback
        : null;

  if (resolved == null) {
    return (
      <span className="text-sm text-gray-400" data-cy={dataCy}>
        —
      </span>
    );
  }

  const percent = Math.min(Math.max(resolved, 0), 100);
  return (
    <div
      className={`flex min-w-[140px] max-w-[220px] items-center gap-2 ${className || ''}`}
      data-cy={dataCy}
    >
      <Progress
        type="line"
        percent={percent}
        showInfo={false}
        strokeColor="#1f4fd8"
        trailColor="#e5e7eb"
        size="small"
        className="m-0 min-w-0 flex-1 !leading-none"
        data-cy={`${dataCy}-bar`}
      />
      <span
        className="shrink-0 text-sm font-normal text-[#4d4d4d]"
        data-cy={`${dataCy}-label`}
      >
        {formatScore(percent)}%
      </span>
    </div>
  );
}
