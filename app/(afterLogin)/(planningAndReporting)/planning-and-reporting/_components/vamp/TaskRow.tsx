import React from 'react';
import { Tag, Tooltip } from 'antd';
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
    <div className="relative flex items-start gap-3 py-2 pl-8 group">
      {/* Horizontal connector line */}
      <div className="absolute left-[7px] top-[1.1rem] w-[25px] h-[1px] bg-[#E5E7EB]" />

      {/* Vertical line cover for the last item to stop the line from going further down if needed.
          However, the parent draws the main vertical line. 
          If we want the line to stop at the connector of the last item, we might need to hide the parent's line 
          or use a white box to cover it. 
          Actually, the parent line goes from top to bottom. 
          If this is the last item, the vertical line should conceptually stop at the horizontal connector.
          The parent's line has `bottom-4`. It might extend too far.
          A common trick is to have the vertical line be part of the item, but here it's in the parent.
          Let's leave it for now, or use a white patch if it extends too far.
      */}
      {isLast && (
        <div className="absolute left-[7px] top-[1.1rem] bottom-0 w-[1px] bg-white z-20" />
      )}

      <div className="mt-0.5 flex-shrink-0">
        {getStatusIcon()}
      </div>

      <div className="flex flex-1 flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <p className="text-sm font-medium leading-relaxed text-[#5A5C80] max-w-[60%]">
          {getTaskName()}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <PriorityTag priority={task.priority} />

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#8F94A3]">• Weight</span>
            <Tag className="m-0 rounded border-none bg-[#E0E7FF] px-2 py-0.5 text-xs font-semibold text-[#3730A3]">
              {formatNumber(task.weight)}
            </Tag>
          </div>

          {viewMode === 'planning' && task.target !== undefined && task.target !== 0 && metricType !== 'Milestone' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#8F94A3]">• Target</span>
              <Tag className="m-0 rounded border-none bg-[#E0E7FF] px-2 py-0.5 text-xs font-semibold text-[#3730A3]">
                {formatNumber(task.target)}
              </Tag>
            </div>
          )}

          {viewMode === 'reporting' && task.achieved !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#8F94A3]">• Achieved</span>
              <Tag className={`m-0 rounded border-none px-2 py-0.5 text-xs font-semibold ${task.status === 'completed' ? 'bg-[#DCFCE7] text-[#166534]' :
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

