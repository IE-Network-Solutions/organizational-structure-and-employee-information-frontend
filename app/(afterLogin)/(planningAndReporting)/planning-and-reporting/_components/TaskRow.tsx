import React from 'react';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { PlanTask, ViewMode } from './types';
import PriorityTag from './PriorityTag';

interface TaskRowProps {
  task: PlanTask;
  viewMode: ViewMode;
  metricType?: string;
}

const weightTargetPillClass =
  'inline-flex items-center rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-[10px] font-semibold text-[#4B5563] md:px-3 md:text-xs border-0 shadow-none';

export default function TaskRow({
  task,
  viewMode,
  isLast,
  metricType,
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

  const getStatusIcon = () => {
    if (viewMode === 'reporting') {
      if (task.status === 'completed' || (task as any).isAchieved) {
        return <CheckCircleOutlined className="text-base text-[#0F9D58]" />;
      }
      if (task.status === 'failed' || (task as any).isAchieved === false) {
        return <CloseCircleOutlined className="text-base text-[#E11D48]" />;
      }
      return (
        <div
          data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-55"
          className="h-1.5 w-1.5 rounded-full bg-[#E5E7EB]"
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
      {/* Horizontal branch to the blue KR trunk (parent uses pl-7 / pl-8) */}
      <div
        data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-64"
        className="absolute left-[-15px] top-[1.15rem] h-px w-[15px] bg-[#CBD5E1] md:left-[-17px] md:top-[1.2rem] md:w-[17px]"
      />

      {isLast ? (
        <div
          data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-68"
          className="absolute bottom-0 left-[-16px] top-[calc(1.15rem+1px)] z-[1] w-[3px] bg-white md:left-[-17px] md:top-[calc(1.2rem+1px)]"
          aria-hidden
        />
      ) : null}

      <div
        data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-71"
        className="mt-0.5 flex shrink-0"
      >
        {getStatusIcon()}
      </div>

      <div
        data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-73"
        className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <p
          className="w-full min-w-0 flex-1 truncate text-[10px] font-medium leading-relaxed text-[#5A5C80] sm:max-w-[min(100%,52%)] md:text-sm"
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

          <span
            data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-86"
            className={weightTargetPillClass}
          >
            <span
              data-cy="planning-reporting-taskrow-weight-label"
              className="font-medium text-[#6B7280]"
            >
              Weight:{' '}
            </span>
            <span
              data-cy="planning-reporting-taskrow-weight-value"
              className="ml-0.5 font-bold text-[#374151]"
            >
              {formatNumber(task.weight)}
            </span>
          </span>

          {viewMode === 'planning' &&
            task.target !== undefined &&
            task.target !== 0 &&
            metricType !== 'Milestone' && (
              <span
                data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-105"
                className={weightTargetPillClass}
              >
                <span
                  data-cy="planning-reporting-taskrow-target-label-planning"
                  className="font-medium text-[#6B7280]"
                >
                  Target:{' '}
                </span>
                <span
                  data-cy="planning-reporting-taskrow-target-value-planning"
                  className="ml-0.5 font-bold text-[#374151]"
                >
                  {formatNumber(task.target)}
                </span>
              </span>
            )}

          {viewMode === 'reporting' &&
            task.target !== undefined &&
            task.target !== null &&
            Number(task.target) !== 0 && (
              <span
                data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-target-reporting"
                className={weightTargetPillClass}
              >
                <span
                  data-cy="planning-reporting-taskrow-target-label-reporting"
                  className="font-medium text-[#6B7280]"
                >
                  Target:{' '}
                </span>
                <span
                  data-cy="planning-reporting-taskrow-target-value-reporting"
                  className="ml-0.5 font-bold text-[#374151]"
                >
                  {formatNumber(task.target)}
                </span>
              </span>
            )}
        </div>
      </div>
    </div>
  );
}
