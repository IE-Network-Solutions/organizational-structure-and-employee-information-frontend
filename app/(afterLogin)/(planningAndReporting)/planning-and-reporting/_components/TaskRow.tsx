import React from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { PlanTask, ViewMode } from './types';
import PriorityTag from './PriorityTag';
import { PR_BORDER, PR_TREE_LINE } from './planningUiTokens';

interface TaskRowProps {
  task: PlanTask;
  viewMode: ViewMode;
  /** Passed from parent for future metric-specific row rules; optional. */
  metricType?: string;
}

/** Grey-bordered attribute chip (Weight / Target) — reporting list model. */
function GreyAttrPill({
  label,
  value,
  dataCyWrap,
  dataCyLabel,
  dataCyValue,
}: {
  label: string;
  value: string;
  dataCyWrap: string;
  dataCyLabel: string;
  dataCyValue: string;
}) {
  return (
    <span
      data-cy={dataCyWrap}
      className="inline-flex items-center rounded border bg-white px-2.5 py-0.5 text-[10px] font-semibold md:px-3 md:text-xs"
      style={{ borderColor: PR_BORDER }}
    >
      <span data-cy={dataCyLabel} className="font-medium text-[#6B7280]">
        {label}{' '}
      </span>
      <span data-cy={dataCyValue} className="font-bold text-[#161A2C]">
        {value}
      </span>
    </span>
  );
}

export default function TaskRow({
  task,
  viewMode,
  isLast,
}: TaskRowProps & { isLast?: boolean }) {
  const formatNumber = (value: number | string | undefined | null): string => {
    if (value === undefined || value === null) return '0';
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (isNaN(num)) return '0';
    const str = num.toString();
    if (str.includes('.')) {
      return str.replace(/\.?0+$/, '');
    }
    return str;
  };

  const getTaskName = () => {
    const taskAny = task as any;
    return (
      taskAny.taskName ||
      taskAny.task ||
      taskAny.name ||
      task.title ||
      taskAny.planTask?.task ||
      'Untitled Task'
    );
  };

  /** Filled circle + white icon — matches reporting mock (pass / fail). */
  const isFailedReporting =
    viewMode === 'reporting' &&
    (task.status === 'failed' || (task as any).isAchieved === false);

  const getStatusIcon = () => {
    if (viewMode === 'reporting') {
      if (task.status === 'completed' || (task as any).isAchieved) {
        return (
          <span
            data-cy="planning-reporting-taskrow-status-pass"
            className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#16A34A] text-[10px] text-white md:h-5 md:w-5 md:text-xs"
            aria-label="Completed"
          >
            <CheckOutlined />
          </span>
        );
      }
      if (task.status === 'failed' || (task as any).isAchieved === false) {
        return (
          <span
            data-cy="planning-reporting-taskrow-status-fail"
            className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#DC2626] text-[10px] text-white md:h-5 md:w-5 md:text-xs"
            aria-label="Not achieved"
          >
            <CloseOutlined />
          </span>
        );
      }
      return (
        <div
          data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-55"
          className="h-[18px] w-[18px] shrink-0 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] md:h-5 md:w-5"
          aria-hidden
        />
      );
    }
    return null;
  };

  return (
    <div
      data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-62"
      className="group relative flex items-start gap-2 py-2 pl-1 md:gap-3 md:pl-2"
    >
      <div
        data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-64"
        className="pointer-events-none absolute left-[-16px] top-1/2 z-0 h-px w-4 -translate-y-1/2 md:w-4"
        style={{ backgroundColor: PR_TREE_LINE }}
        aria-hidden
      />

      {isLast ? (
        <div
          data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-68"
          className="pointer-events-none absolute bottom-0 left-[-16px] top-1/2 z-[1] w-px bg-white"
          aria-hidden
        />
      ) : null}

      {viewMode === 'reporting' ? (
        <div
          data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-71"
          className="mt-0.5 flex w-5 shrink-0 justify-center"
        >
          {getStatusIcon()}
        </div>
      ) : null}

      <div
        data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-73"
        className={`flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${isLast ? '' : 'border-[#F1F5F9] sm:border-b sm:pb-2'}`}
      >
        <p
          className={`w-full min-w-0 flex-1 truncate text-[10px] font-normal leading-relaxed text-[#94A3B8] sm:max-w-[min(100%,52%)] md:text-sm ${isFailedReporting ? 'line-through opacity-80' : ''}`}
          title={getTaskName()}
          data-cy="planningandreporting-planning-and-reporting-components-taskrow-tsx-p-96"
        >
          {getTaskName()}
        </p>

        <div
          data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-81"
          className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:justify-end"
        >
          <PriorityTag priority={task.priority} />

          <GreyAttrPill
            label="Weight:"
            value={formatNumber(task.weight)}
            dataCyWrap="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-86"
            dataCyLabel="planning-reporting-taskrow-weight-label"
            dataCyValue="planning-reporting-taskrow-weight-value"
          />

          {viewMode === 'planning' && (
            <GreyAttrPill
              label="Target:"
              value={formatNumber(task.target)}
              dataCyWrap="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-105"
              dataCyLabel="planning-reporting-taskrow-target-label-planning"
              dataCyValue="planning-reporting-taskrow-target-value-planning"
            />
          )}

          {viewMode === 'reporting' &&
            task.target !== undefined &&
            task.target !== null &&
            Number(task.target) !== 0 && (
              <GreyAttrPill
                label="Target:"
                value={formatNumber(task.target)}
                dataCyWrap="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-target-reporting"
                dataCyLabel="planning-reporting-taskrow-target-label-reporting"
                dataCyValue="planning-reporting-taskrow-target-value-reporting"
              />
            )}
        </div>
      </div>
    </div>
  );
}
