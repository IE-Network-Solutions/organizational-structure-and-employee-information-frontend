'use client';

import React from 'react';
import BscKpiMetricCard from './BscKpiMetricCard';

type Props = {
  label: string;
  percent: number;
  dataCy: string;
};

export default function BscScoreMetricCard({ label, percent, dataCy }: Props) {
  return (
    <BscKpiMetricCard
      label={label}
      percent={percent}
      dataCy={dataCy}
      className="w-full min-w-0 flex-none self-start"
    />
  );
}
