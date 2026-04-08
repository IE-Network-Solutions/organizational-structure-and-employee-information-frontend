import React from 'react';
import { Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { PlanTask, ViewMode } from './types';
import PriorityTag from './PriorityTag';

interface TaskRowProps {
  task: PlanTask;
  viewMode: ViewMode;
  metricType?: string;
}

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
    if (str.includes('.')) return str.replace(/\.?0+$/, '');
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
        return <CheckCircleOutlined className="text-[#10B981] text-sm" />;
      }
      if (task.status === 'failed' || (task as any).isAchieved === false) {
        return <CloseCircleOutlined className="text-[#EF4444] text-sm" />;
      }
      return (
        <div
          className="w-1.5 h-1.5 rounded-full bg-[#D1D5DB] mt-0.5"
          data-cy="planning-reporting-task-row-status-pending"
        />
      );
    }
    return null;
  };

  return (
    <div
      data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-62"
      className="relative flex items-center gap-2 py-1.5 pl-5 md:pl-7 group"
    >
      {/* Horizontal connector */}
      <div
        className="absolute left-[6.5px] top-1/2 w-[12px] md:w-[20px] h-[1px] bg-[#E5E7EB]"
        data-cy="planning-reporting-task-row-connector-h"
      />

      {/* Last-item vertical cover */}
      {isLast && (
        <div
          className="absolute left-[6.5px] top-1/2 bottom-0 w-[1px] bg-[#FAFBFC] z-20"
          data-cy="planning-reporting-task-row-connector-v-cover"
        />
      )}

      {/* Status icon (reporting only) */}
      {viewMode === 'reporting' && (
        <div
          className="flex-shrink-0 w-4 flex items-center justify-center"
          data-cy="planning-reporting-task-row-status-cell"
        >
          {getStatusIcon()}
        </div>
      )}

      {/* Task name */}
      <p
        className="flex-1 min-w-0 text-[11px] md:text-[13px] font-medium leading-snug text-[#5A5C80] truncate"
        title={getTaskName()}
        data-cy="planning-reporting-task-row-title"
      >
        {getTaskName()}
      </p>

      {/* Meta tags */}
      <div
        className="flex items-center gap-1.5 flex-shrink-0"
        data-cy="planning-reporting-task-row-meta"
      >
        <div
          className="scale-90 md:scale-100 origin-right"
          data-cy="planning-reporting-task-row-priority-wrap"
        >
          <PriorityTag priority={task.priority} />
        </div>

        <Tag
          className="m-0 rounded-[4px] border-none px-1.5 py-0 text-[10px] md:text-[11px] font-bold leading-5"
          style={{ backgroundColor: '#E0E7FF', color: '#574CFF' }}
        >
          {formatNumber(task.weight)}
        </Tag>

        {viewMode === 'planning' &&
          task.target !== undefined &&
          task.target !== 0 &&
          metricType !== 'Milestone' && (
            <Tag
              className="m-0 rounded-[4px] border-none px-1.5 py-0 text-[10px] md:text-[11px] font-bold leading-5"
              style={{ backgroundColor: '#E0E7FF', color: '#574CFF' }}
            >
              t:{formatNumber(task.target)}
            </Tag>
          )}

        {viewMode === 'reporting' && task.achieved !== undefined && (
          <Tag
            className={`m-0 rounded-[4px] border-none px-1.5 py-0 text-[10px] md:text-[11px] font-bold leading-5 ${
              task.status === 'completed'
                ? 'bg-[#DCFCE7] text-[#166534]'
                : task.status === 'failed'
                  ? 'bg-[#FEE2E2] text-[#991B1B]'
                  : 'bg-[#FFEDD5] text-[#9A3412]'
            }`}
          >
            {formatNumber(task.achieved)}
          </Tag>
        )}
      </div>
    </div>
  );
}
