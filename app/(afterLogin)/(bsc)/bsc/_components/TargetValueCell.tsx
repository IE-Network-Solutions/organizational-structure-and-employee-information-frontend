'use client';

import React from 'react';
import { Tag } from 'antd';
import { formatTargetDisplay } from '@/utils/bsc/measurementUnit';

export const unitTagClassName =
  'm-0 h-5 rounded border border-[#b7eb8f] bg-[#f6ffed] px-2 text-[11px] font-medium leading-5 text-[#389e0d]';

type ValueProps = {
  value: number | null | undefined;
  unit?: string | null;
  worstCase?: number | null;
  bestCase?: number | null;
  dataCy?: string;
  className?: string;
};

function targetDisplayProps({
  value,
  unit,
  worstCase,
  bestCase,
}: Pick<ValueProps, 'value' | 'unit' | 'worstCase' | 'bestCase'>) {
  return formatTargetDisplay(value, unit, { worstCase, bestCase });
}

export function TargetMetricValue({
  value,
  unit,
  worstCase,
  bestCase,
  dataCy,
  className = '',
}: ValueProps) {
  const { primary } = targetDisplayProps({ value, unit, worstCase, bestCase });

  return (
    <span
      className={`text-[#4d4d4d] text-sm font-normal whitespace-nowrap ${className}`}
      data-cy={dataCy}
    >
      {primary}
    </span>
  );
}

export function TargetMetricUnitTag({
  value,
  unit,
  worstCase,
  bestCase,
  dataCy,
  className = '',
}: ValueProps) {
  const { unitTag } = targetDisplayProps({ value, unit, worstCase, bestCase });

  if (!unitTag) {
    return (
      <span
        className={`text-[#4d4d4d] text-sm font-normal ${className}`}
        data-cy={dataCy}
      >
        —
      </span>
    );
  }

  return (
    <Tag className={`${unitTagClassName} ${className}`} data-cy={dataCy}>
      {unitTag}
    </Tag>
  );
}

export default function TargetValueCell(props: ValueProps) {
  return (
    <div
      data-cy="targetvaluecell-div-78"
      className={`flex flex-wrap items-center gap-1.5 ${props.className || ''}`}
    >
      <TargetMetricValue {...props} />
      <TargetMetricUnitTag {...props} dataCy={undefined} />
    </div>
  );
}
