import React from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import { PlanTask, ViewMode, Priority } from './types';
import { PR_BORDER } from './planningUiTokens';

/** Horizontal branch — matches spine (#E5E7EB) on parent border-l */
const TREE_LINE = '#E5E7EB';

interface TaskRowProps {
  task: PlanTask;
  viewMode: ViewMode;
  /** Passed from parent for future metric-specific row rules; optional. */
  metricType?: string;
  /** Rendered after Weight/Target chips (e.g. compact +AI). */
  trailingSlot?: React.ReactNode;
}

/**
 * antd 5 Tag has no `size` in typings; these classes match `size="small"` density.
 */
const tagChipClass =
  '!m-0 !inline-flex !h-[22px] !min-h-[22px] !max-h-[22px] !items-center !border !px-2 !py-0 !text-xs !font-normal !leading-[22px]';

const priorityStyles: Record<
  Priority,
  { bg: string; text: string; border: string }
> = {
  Low: { bg: '#F6FFED', text: '#52C41A', border: '#B7EB8F' },
  Medium: { bg: '#FFF7E6', text: '#FA8C16', border: '#FFD591' },
  High: { bg: '#FFF1F0', text: '#F5222D', border: '#FFA39E' },
  Priority: { bg: '#E8EDFF', text: '#1E40AF', border: '#C7D2FE' },
};

function PriorityTagAnt({ priority }: { priority: Priority }) {
  const safePriority: Priority =
    priority && priorityStyles[priority] ? priority : 'Low';
  const colors = priorityStyles[safePriority];
  const level = priority || 'Low';
  const displayText =
    safePriority === 'Priority' ? level : `Priority: ${level}`;

  return (
    <Tag
      bordered
      className={tagChipClass}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text,
      }}
      data-cy="planning-reporting-priority-tag"
    >
      {displayText}
    </Tag>
  );
}

/** Column 1: fixed w-8; L-branch centered on row height */
function TreeGutter() {
  return (
    <div
      className="relative h-9 w-8 shrink-0"
      aria-hidden
      data-cy="planning-reporting-taskrow-tree-gutter"
    >
      <div
        className="pointer-events-none absolute left-0 top-1/2 z-0 h-px w-full -translate-y-1/2"
        style={{ backgroundColor: TREE_LINE }}
        data-cy="planning-reporting-taskrow-branch"
      />
    </div>
  );
}

export default function TaskRow({
  task,
  viewMode,
  trailingSlot,
}: TaskRowProps) {
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

  const isFailedReporting =
    viewMode === 'reporting' &&
    (task.status === 'failed' || (task as any).isAchieved === false);

  const isCompletedReporting =
    viewMode === 'reporting' &&
    (task.status === 'completed' ||
      task.status === 'Done' ||
      (task as any).isAchieved === true);

  const getStatusIcon = () => {
    if (viewMode === 'reporting') {
      if (task.status === 'completed' || (task as any).isAchieved) {
        return (
          <span
            data-cy="planning-reporting-taskrow-status-pass"
            className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#16A34A] text-[10px] text-white"
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
            className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#DC2626] text-[10px] text-white"
            aria-label="Not achieved"
          >
            <CloseOutlined />
          </span>
        );
      }
      return (
        <div
          data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-55"
          className="h-[18px] w-[18px] shrink-0 rounded-full border border-[#E5E7EB] bg-[#F9FAFB]"
          aria-hidden
        />
      );
    }
    return null;
  };

  const showTree = viewMode === 'planning' || viewMode === 'reporting';
  const title = getTaskName();

  return (
    <div
      data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-62"
      className="flex h-9 min-h-9 w-full min-w-0 shrink-0 items-center gap-3"
    >
      {/* Column 1 — tree gutter */}
      {showTree ? (
        <TreeGutter />
      ) : (
        <div
          className="h-9 w-8 shrink-0"
          aria-hidden
          data-cy="planning-reporting-taskrow-tree-placeholder"
        />
      )}

      {/* Column 2 — title + reporting status (fixed-width status zone) */}
      <div
        data-cy="planning-reporting-taskrow-title-status"
        className="flex min-w-0 flex-1 items-center gap-2"
      >
        <p
          className={`min-w-0 flex-1 truncate text-sm font-normal leading-none ${
            viewMode === 'reporting' ? 'text-[#64748B]' : 'text-[#111827]'
          } ${
            isFailedReporting
              ? 'line-through decoration-[#DC2626] decoration-[1.5px] opacity-80'
              : isCompletedReporting
                ? 'line-through decoration-[#16A34A] decoration-[1.5px] opacity-80'
                : ''
          }`}
          title={title}
          data-cy="planningandreporting-planning-and-reporting-components-taskrow-tsx-p-96"
        >
          {title}
        </p>
        {viewMode === 'reporting' ? (
          <div
            data-cy="planning-reporting-taskrow-status-slot"
            className="flex h-9 w-8 shrink-0 items-center justify-center"
          >
            {getStatusIcon()}
          </div>
        ) : null}
      </div>

      {/* Column 3 — chips + optional AI */}
      <div
        data-cy="planning-reporting-taskrow-chip-group"
        className="flex shrink-0 items-center justify-end gap-2"
      >
        <PriorityTagAnt priority={task.priority} />

        <Tag
          bordered
          className={tagChipClass}
          style={{
            borderColor: PR_BORDER,
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            color: 'rgba(0, 0, 0, 0.7)',
          }}
          data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-86"
        >
          <span
            data-cy="planning-reporting-taskrow-weight-label"
            className="text-[rgba(0,0,0,0.45)]"
          >
            Weight:{' '}
          </span>
          <span
            data-cy="planning-reporting-taskrow-weight-value"
            className="text-[#111827]"
          >
            {formatNumber(task.weight)}
          </span>
        </Tag>

        {viewMode === 'planning' && (
          <Tag
            bordered
            className={tagChipClass}
            style={{
              borderColor: PR_BORDER,
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              color: 'rgba(0, 0, 0, 0.7)',
            }}
            data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-div-105"
          >
            <span
              data-cy="planning-reporting-taskrow-target-label-planning"
              className="text-[rgba(0,0,0,0.45)]"
            >
              Target:{' '}
            </span>
            <span
              data-cy="planning-reporting-taskrow-target-value-planning"
              className="text-[#111827]"
            >
              {formatNumber(task.target)}
            </span>
          </Tag>
        )}

        {viewMode === 'reporting' &&
          task.target !== undefined &&
          task.target !== null &&
          Number(task.target) !== 0 && (
            <Tag
              bordered
              className={tagChipClass}
              style={{
                borderColor: PR_BORDER,
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                color: 'rgba(0, 0, 0, 0.7)',
              }}
              data-cy="-planningandreporting-planning-and-reporting-components-taskrow-tsx-taskrow-target-reporting"
            >
              <span
                data-cy="planning-reporting-taskrow-target-label-reporting"
                className="text-[rgba(0,0,0,0.45)]"
              >
                Target:{' '}
              </span>
              <span
                data-cy="planning-reporting-taskrow-target-value-reporting"
                className="text-[#111827]"
              >
                {formatNumber(task.target)}
              </span>
            </Tag>
          )}

        {trailingSlot ? (
          <span
            data-cy="planning-reporting-taskrow-trailing-slot"
            className="inline-flex shrink-0 items-center"
          >
            {trailingSlot}
          </span>
        ) : null}
      </div>
    </div>
  );
}
