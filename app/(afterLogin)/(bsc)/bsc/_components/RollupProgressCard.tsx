'use client';

import React from 'react';
import {
  formatRollupCoverage,
  type RollupSummary,
} from '@/utils/bsc/rollup';
import BscKpiMetricCard from './BscKpiMetricCard';

type Props = {
  rollup: RollupSummary;
  label?: string;
  onClick?: () => void;
  dataCy: string;
  showCoverage?: boolean;
};

export default function RollupProgressCard({
  rollup,
  label,
  onClick,
  dataCy,
  showCoverage = true,
}: Props) {
  const percent = Number(rollup.averageScore || 0);
  const hasScore = rollup.evaluatedCount > 0;
  const displayLabel =
    label ||
    (rollup.scope === 'company'
      ? 'Company-wide Scorecard'
      : `${rollup.label} Scorecard`);

  return (
    <BscKpiMetricCard
      label={displayLabel}
      percent={percent}
      hasScore={hasScore}
      subtitle={showCoverage ? formatRollupCoverage(rollup) : undefined}
      dataCy={dataCy}
      onClick={onClick}
      className="min-w-[260px] flex-none"
    />
  );
}
