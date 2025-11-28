import React from 'react';
import StatPill from './StatPill';
import { PlanSummary, KeyResult } from './types';

interface KRSummaryBarProps {
  plan: PlanSummary;
  viewMode: 'planning' | 'reporting';
  keyResult?: KeyResult;
}

export default function KRSummaryBar({ plan, viewMode, keyResult }: KRSummaryBarProps) {
  // Use key result specific values if available, otherwise use plan-level values
  const metricType = keyResult?.metricType?.name || plan.milestoneLabel;
  const targetValue = keyResult?.targetValue || plan.target;
  const achievedValue = keyResult?.currentValue || plan.achieved;
  const progress = keyResult?.progress || plan.progress;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <StatPill label="Metric" value={metricType} variant="milestone" />
      <StatPill label="Target" value={targetValue} variant="target" />
      <StatPill label="Achieved" value={achievedValue} variant="achieved" />
      <StatPill label="KR progress" value={`${progress}%`} variant="progress" />
    </div>
  );
}
