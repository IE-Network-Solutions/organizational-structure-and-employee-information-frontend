'use client';

import React from 'react';
import { Input, InputNumber } from 'antd';
import { TargetLogic } from '@/types/bsc';
import { validateAcceptableThreshold } from '@/utils/bsc/scoring';

type Props = {
  kpiKey: string;
  targetLogic: TargetLogic;
  targetValue?: number | null;
  dataSource?: string | null;
  acceptableThreshold?: number | null;
  onDataSourceChange: (value: string | null) => void;
  onThresholdChange: (value: number | null) => void;
};

export default function KpiAssignmentMetricFields({
  kpiKey,
  targetLogic,
  targetValue,
  dataSource,
  acceptableThreshold,
  onDataSourceChange,
  onThresholdChange,
}: Props) {
  const thresholdCheck =
    targetValue != null &&
    acceptableThreshold != null &&
    Number.isFinite(targetValue) &&
    Number.isFinite(acceptableThreshold)
      ? validateAcceptableThreshold(
          Number(targetValue),
          Number(acceptableThreshold),
          targetLogic,
        )
      : { valid: true as const };

  const thresholdHelper =
    targetLogic === TargetLogic.HigherBetter
      ? 'Threshold must be less than or equal to target (minimum acceptable result).'
      : targetLogic === TargetLogic.LowerBetter
        ? 'Threshold must be greater than or equal to target (maximum acceptable result).'
        : 'Only available for higher/lower KPIs.';

  return (
    <div
      className="mt-2 flex flex-wrap items-start gap-3"
      data-cy={`bsc-kpi-assignment-fields-${kpiKey}`}
    >
      <div data-cy="auto-added" className="flex min-w-[180px] flex-col gap-1">
        <span data-cy="auto-added" className="text-[11px] text-[#595959]">
          Data source
        </span>
        {/* Free text (system name, report, or URL) — BE stores up to 512 chars. */}
        <Input
          className="w-[180px]"
          placeholder="e.g. HRIS, Finance report"
          value={dataSource ?? ''}
          maxLength={512}
          allowClear
          onChange={(e) => onDataSourceChange(e.target.value || null)}
          data-cy={`bsc-kpi-assignment-data-source-${kpiKey}`}
        />
      </div>
      {(targetLogic === TargetLogic.HigherBetter ||
        targetLogic === TargetLogic.LowerBetter) && (
        <div data-cy="auto-added" className="flex min-w-[180px] flex-col gap-1">
          <span data-cy="auto-added" className="text-[11px] text-[#595959]">
            Acceptable threshold
          </span>
          <InputNumber
            className="w-[180px]"
            placeholder="Threshold"
            value={acceptableThreshold ?? undefined}
            onChange={(value) =>
              onThresholdChange(value == null ? null : Number(value))
            }
            data-cy={`bsc-kpi-assignment-threshold-${kpiKey}`}
          />
          <span
            data-cy="auto-added"
            className={`text-[11px] ${thresholdCheck.valid ? 'text-[#8F94A3]' : 'text-[#CF1322]'}`}
          >
            {!thresholdCheck.valid ? thresholdCheck.message : thresholdHelper}
          </span>
        </div>
      )}
    </div>
  );
}
