import React from 'react';
import StatPill from './StatPill';
import { PlanSummary, KeyResult } from './types';
import {
  getKeyResultProgressPercent,
  getKeyResultProgressRatioText,
  getMetricTypeName,
  getMilestoneProgressCounts,
  getNumericMetricTargetValue,
  formatValueForMetric,
} from '@/utils/okrKeyResultProgressDisplay';

interface KRSummaryBarProps {
  plan: PlanSummary;
  viewMode: 'planning' | 'reporting';
  keyResult?: KeyResult;
}

export default function KRSummaryBar({
  plan,
  viewMode,
  keyResult,
}: KRSummaryBarProps) {
  const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0';
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (isNaN(num)) return '0';
    if (num % 1 === 0) {
      return num.toString();
    }
    return num.toString();
  };

  const toSentenceCase = (str: string): string => {
    if (!str) return 'N/A';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  if (!keyResult) {
    return (
      <div
        data-cy="-planningandreporting-planning-and-reporting-components-krsummarybar-tsx-krsummarybar-div-142"
        className="flex flex-wrap items-center gap-8"
      >
        <StatPill
          label="metric"
          value={toSentenceCase(plan.milestoneLabel)}
          variant="milestone"
        />
        <StatPill
          label="target"
          value={formatNumber(plan.target ?? 0)}
          variant="target"
        />
        <StatPill
          label="achieved"
          value={formatNumber(plan.achieved ?? 0)}
          variant="achieved"
        />
        <StatPill
          label="krProgress"
          value={`${plan.progress ?? 0}%`}
          variant="progress"
        />
      </div>
    );
  }

  const metricName = getMetricTypeName(keyResult);
  const isMilestone = metricName === 'Milestone';
  const progress = getKeyResultProgressPercent(keyResult);
  const ratioText = getKeyResultProgressRatioText(keyResult);
  const { total: msTotal } = getMilestoneProgressCounts(keyResult);
  const numericTarget = getNumericMetricTargetValue(keyResult);

  const targetDisplay = isMilestone
    ? String(msTotal)
    : metricName === 'Achieve' || metricName === 'Achieved'
      ? '100'
      : formatValueForMetric(metricName, numericTarget);

  const achievedDisplay =
    viewMode === 'reporting' && !isMilestone ? ratioText : ratioText;

  return (
    <div
      data-cy="-planningandreporting-planning-and-reporting-components-krsummarybar-tsx-krsummarybar-div-142"
      className="flex flex-wrap items-center gap-8"
    >
      <StatPill
        label="metric"
        value={toSentenceCase(metricName)}
        variant="milestone"
      />
      {!isMilestone && (
        <StatPill label="target" value={targetDisplay} variant="target" />
      )}
      <StatPill label="achieved" value={achievedDisplay} variant="achieved" />
      <StatPill label="krProgress" value={`${progress}%`} variant="progress" />
    </div>
  );
}
