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

export default function TaskRow({ task, viewMode, isLast, metricType }: TaskRowProps & { isLast?: boolean }) {
  // Format number to remove trailing zeros (e.g., 100.000 -> 100)
  const formatNumber = (value: number | string | undefined | null): string => {
    if (value === undefined || value === null) return '0';
    const num = typeof value === 'string' ? parseFloat(value) : Number(value);
    if (isNaN(num)) return '0';
    // Remove trailing zeros and decimal point if not needed
    // Convert to string and remove trailing zeros
    const str = num.toString();
    if (str.includes('.')) {
      return str.replace(/\.?0+$/, '');
    }
    return str;
  };

  // Get task name from various possible property names
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
        return <CheckCircleOutlined className="text-[#0F9D58] text-base" />;
      }
      if (task.status === 'failed' || ((task as any).isAchieved === false)) {
        return <CloseCircleOutlined className="text-[#E11D48] text-base" />;
      }
      // Default or pending state for reporting?
      return <div className="w-1.5 h-1.5 rounded-full bg-[#E5E7EB]" />;
    }
    // Planning mode: No icon, just the tree connector line
    return null;
  };

  return (
    <div className="relative flex items-start gap-2 md:gap-3 py-2 pl-5 md:pl-8 group">
      {/* Horizontal connector line */}
      <div className="absolute left-[7px] top-[1.1rem] w-[13px] md:w-[25px] h-[1px] bg-[#E5E7EB]" />

      {/* Vertical line cover for the last item */}
      {isLast && (
        <div className="absolute left-[7px] top-[1.1rem] bottom-0 w-[1px] bg-white z-20" />
      )}

      <div className="mt-0.5 flex-shrink-0">
        {getStatusIcon()}
      </div>

      <div className="flex flex-1 flex-col md:flex-row items-start md:justify-between gap-x-4 gap-y-1 min-w-0">
        <p className="text-[10px] md:text-sm font-medium leading-relaxed text-[#5A5C80] w-full md:max-w-[60%] truncate" title={getTaskName()}>
          {getTaskName()}
        </p>

        <div className="w-full md:w-auto flex md:flex-wrap items-center justify-between md:justify-end gap-x-3 gap-y-1 mt-1 md:mt-0">
          <div className="scale-90 md:scale-100 origin-left">
            <PriorityTag priority={task.priority} />
          </div>

          <div className="flex items-center gap-1 md:gap-2 whitespace-nowrap">
            <span className="text-[10px] md:text-xs font-normal text-[#8F94A3]">
              <span className="hidden md:inline" style={{ color: '#574CFF' }}>• </span>weight
            </span>
            <Tag className="m-0 rounded border-none bg-[#E0E7FF] px-1 md:px-2 py-0 md:py-0.5 text-[10px] md:text-xs font-bold" style={{ color: '#574CFF' }}>
              {formatNumber(task.weight)}
            </Tag>
          </div>

          {viewMode === 'planning' && task.target !== undefined && task.target !== 0 && metricType !== 'Milestone' && (
            <div className="flex items-center gap-1 md:gap-2 whitespace-nowrap">
              <span className="text-[10px] md:text-xs font-normal text-[#8F94A3]">
                <span className="hidden md:inline" style={{ color: '#574CFF' }}>• </span>target
              </span>
              <Tag className="m-0 rounded border-none bg-[#E0E7FF] px-1 md:px-2 py-0 md:py-0.5 text-[10px] md:text-xs font-bold" style={{ color: '#574CFF' }}>
                {formatNumber(task.target)}
              </Tag>
            </div>
          )}

          {viewMode === 'reporting' && task.achieved !== undefined && (
            <div className="flex items-center gap-1 md:gap-2 whitespace-nowrap">
              <span className="text-[10px] md:text-xs font-normal text-[#8F94A3]">
                <span className="hidden md:inline" style={{ color: '#574CFF' }}>• </span>achieved
              </span>
              <Tag className={`m-0 rounded border-none px-1 md:px-2 py-0 md:py-0.5 text-[10px] md:text-xs font-bold ${task.status === 'completed' ? 'bg-[#DCFCE7] text-[#166534]' :
                task.status === 'failed' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                  'bg-[#FFEDD5] text-[#9A3412]'
                }`}>
                {formatNumber(task.achieved)}
              </Tag>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

