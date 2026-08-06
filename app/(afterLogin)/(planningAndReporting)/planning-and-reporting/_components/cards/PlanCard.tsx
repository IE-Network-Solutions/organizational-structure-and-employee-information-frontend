import React, { useState, useCallback, useEffect } from 'react';
import classNames from 'classnames';
import { createPortal } from 'react-dom';
import { Button, Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  MoreOutlined,
  CheckOutlined,
  ExclamationCircleFilled,
  FlagOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { FaBomb, FaRegThumbsUp } from 'react-icons/fa';
import { AiOutlineEdit } from 'react-icons/ai';
import { IoCheckmarkSharp, IoOpen } from 'react-icons/io5';
import { LuLoader } from 'react-icons/lu';
import { PlanSummary, PlanTask, ViewMode, Cadence } from '../types';
import { formatPlanningReportDate } from '../utils';
import UserInfo from '../UserInfo';
import StatusBadge from '../StatusBadge';
import CommentsSection from '../comments/CommentsSection';
import { useUpdateStatus } from '@/store/server/features/okrPlanningAndReporting/mutations';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import CustomButton from '@/components/common/buttons/customButton';
import { PlanCardInlineReportForm } from '../createReport/PlanCardInlineReportForm';
import { useRecentReportTaskStatuses } from '@/utils/recentReportTaskStatuses';

interface PlanCardProps {
  plan: PlanSummary;
  viewMode: ViewMode;
  activeCadence: Cadence;
  onApprove?: () => void;
  onOpen?: () => void;
  onEdit?: () => void;
  canApprove?: boolean;
  canEdit?: boolean;
  isApprovalLoading?: boolean;
  dateLabel?: string;
  onHoverKR?: (krId: string | null) => void;
  planningPeriodId?: string;
  onOpenThread?: (entityId: string, threadKind: 'plan' | 'report') => void;
  /** Starts inline report flow on the card (planning + owner only). */
  onSubmitReport?: () => void;
  showSubmitReport?: boolean;
  inlineReportActive?: boolean;
  onCloseInlineReport?: () => void;
  /** Period name for inline / drawer labels (e.g. Weekly) */
  planningPeriodLabel?: string;
  /** Optional custom inline section (used for report edit mode). */
  inlineReportContent?: React.ReactNode;
}

function flattenAllTasks(plan: PlanSummary) {
  const sections: {
    sectionTitle: string;
    krId?: string;
    tasks: any[];
    metricType?: string;
  }[] = [];

  if (plan.keyResults && plan.keyResults.length > 0) {
    for (const kr of plan.keyResults) {
      const sectionTasks: any[] = [];
      if (kr.tasks) sectionTasks.push(...kr.tasks);
      kr.parentTask?.forEach((pt: any) => {
        if (pt.tasks) sectionTasks.push(...pt.tasks);
      });
      kr.milestones?.forEach((m: any) => {
        if (m.tasks) sectionTasks.push(...m.tasks);
        m.parentTask?.forEach((pt: any) => {
          if (pt.tasks) sectionTasks.push(...pt.tasks);
        });
      });

      if (sectionTasks.length > 0) {
        sections.push({
          sectionTitle: kr.title || kr.name || plan.summary,
          krId: kr.id,
          tasks: sectionTasks,
          metricType: kr.metricType?.name,
        });
      }
    }
  } else if (plan.tasks && plan.tasks.length > 0) {
    sections.push({
      sectionTitle: plan.summary,
      tasks: plan.tasks,
      metricType: plan.milestoneLabel,
    });
  }

  return sections;
}

function formatNum(v: number | string | null | undefined): string {
  if (v == null) return '0';
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  if (isNaN(n)) return '0';
  return n.toString();
}

/** Tighter meta columns on small screens; align header + task rows. */
const meta = {
  pri: 'w-[52px] sm:w-[68px]',
  wt: 'w-[28px] sm:w-[38px]',
  tgt: 'w-[32px] sm:w-[46px]',
  out: 'w-[13px] sm:w-[18px]',
} as const;

const metaHead =
  'text-right text-[11px] font-medium uppercase leading-none tracking-tighter text-[#B0B3C0] sm:text-[12px] sm:tracking-wider';

/** Priority pill: on small screens use a 3-letter label for Medium ("Med"). */
function priorityChipText(priorityKey: string): React.ReactNode {
  if (priorityKey === 'Priority') return 'Urgent';
  if (priorityKey === 'Medium') {
    return (
      <>
        <span
          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-118"
          className="md:hidden"
        >
          Med
        </span>
        <span
          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-119"
          className="hidden md:inline"
        >
          Medium
        </span>
      </>
    );
  }
  return priorityKey;
}

/** Fixed panel near pointer; clamped so it stays in the viewport. */
function clampFailReasonPanelPosition(clientX: number, clientY: number) {
  if (typeof window === 'undefined') {
    return { left: clientX + 14, top: clientY + 18 };
  }
  const margin = 10;
  const offX = 14;
  const offY = 18;
  const estW = 300;
  const estH = 160;
  let left = clientX + offX;
  let top = clientY + offY;
  if (left + estW > window.innerWidth - margin) {
    left = Math.max(margin, window.innerWidth - estW - margin);
  }
  if (top + estH > window.innerHeight - margin) {
    top = Math.max(margin, clientY - estH - margin);
  }
  left = Math.max(margin, left);
  top = Math.max(margin, top);
  return { left, top };
}

export default function PlanCard({
  plan,
  viewMode,
  activeCadence,
  onApprove,
  onOpen,
  onEdit,
  canApprove = false,
  canEdit = false,
  isApprovalLoading = false,
  dateLabel,
  onHoverKR,
  planningPeriodId,
  onOpenThread,
  onSubmitReport,
  showSubmitReport,
  inlineReportActive = false,
  onCloseInlineReport,
  planningPeriodLabel,
  inlineReportContent,
}: PlanCardProps) {
  const { mutate: updateStatus } = useUpdateStatus();
  const viewerUserId = useAuthenticationStore((s) => s.userId);
  const isTeammatePlan =
    viewMode === 'planning' &&
    Boolean(
      plan.ownerUserId && viewerUserId && plan.ownerUserId !== viewerUserId,
    );
  const isPlanReadOnly =
    viewMode === 'planning' &&
    (!canEdit || Boolean(plan.isReported) || plan.status?.label !== 'Open');
  const [optimisticStatuses, setOptimisticStatuses] = useState<
    Record<string, string>
  >({});
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());
  const [failReasonCursorPanel, setFailReasonCursorPanel] = useState<{
    left: number;
    top: number;
    text: string;
  } | null>(null);

  const serverTaskStatusMap = React.useMemo(() => {
    const map: Record<string, string | undefined> = {};
    const collect = (tasks: any[]) => {
      tasks?.forEach((t: any) => {
        map[t.id] = t.status;
      });
    };
    if (plan.keyResults?.length) {
      plan.keyResults.forEach((kr) => {
        collect(kr.tasks);
        kr.parentTask?.forEach((pt: any) => collect(pt.tasks));
        kr.milestones?.forEach((m: any) => {
          collect(m.tasks);
          m.parentTask?.forEach((pt: any) => collect(pt.tasks));
        });
      });
    } else {
      collect(plan.tasks);
    }
    return map;
  }, [plan]);

  useEffect(() => {
    setOptimisticStatuses((prev) => {
      const remaining: Record<string, string> = {};
      for (const [taskId, optimisticStatus] of Object.entries(prev)) {
        if (serverTaskStatusMap[taskId] !== optimisticStatus) {
          remaining[taskId] = optimisticStatus;
        }
      }
      return Object.keys(remaining).length === Object.keys(prev).length
        ? prev
        : remaining;
    });
  }, [serverTaskStatusMap]);

  useEffect(() => {
    setFailReasonCursorPanel(null);
  }, [viewMode, plan.id]);

  const handleTaskToggle = useCallback(
    (taskId: string, currentStatus: string) => {
      if (isPlanReadOnly) return;
      const nextStatus =
        currentStatus === 'pre_achieved' ? 'pre_pending' : 'pre_achieved';

      setOptimisticStatuses((prev) => ({ ...prev, [taskId]: nextStatus }));
      setLoadingTasks((prev) => new Set(prev).add(taskId));

      updateStatus(
        { id: taskId, status: nextStatus, planningPeriodId },
        {
          onSuccess: () => {
            setLoadingTasks((prev) => {
              const next = new Set(prev);
              next.delete(taskId);
              return next;
            });
          },
          onError: () => {
            setOptimisticStatuses((prev) => {
              const next = { ...prev };
              delete next[taskId];
              return next;
            });
            setLoadingTasks((prev) => {
              const next = new Set(prev);
              next.delete(taskId);
              return next;
            });
          },
        },
      );
    },
    [updateStatus, planningPeriodId, isPlanReadOnly],
  );
  const approvalMenuItems: MenuProps['items'] =
    plan.status?.label === 'Open'
      ? [
          {
            key: 'approve',
            icon: <IoCheckmarkSharp />,
            label: (
              <Tooltip
                title={
                  isApprovalLoading
                    ? 'Processing approval...'
                    : "Approve Plan! Once you approve, you can't edit"
                }
              >
                Approve
              </Tooltip>
            ),
            onClick: onApprove,
            className: 'text-green-500',
          },
        ]
      : [
          {
            key: 'open',
            icon: <IoOpen size={16} />,
            label: <Tooltip title="Open approved Plan">Open</Tooltip>,
            onClick: onOpen,
            className: 'text-red-400',
          },
        ];

  const editMenuItems: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <AiOutlineEdit size={16} />,
      label: (
        <Tooltip title="Edit Plan">
          <span data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-90">
            Edit
          </span>
        </Tooltip>
      ),
      onClick: onEdit,
    },
  ];

  const getDateLabel = (): string => {
    if (dateLabel) return dateLabel;
    return formatPlanningReportDate(plan.createdAt ?? '');
  };

  const totalAchieved = React.useMemo(() => {
    if (viewMode !== 'reporting') return 0;
    let total = 0;
    const sumTasks = (tasks: any[]) => {
      tasks.forEach((task) => {
        const isCompleted =
          task.status === 'completed' ||
          task.status === 'Done' ||
          task.isAchieved === true;
        if (isCompleted) total += Number(task.weight) || 0;
      });
    };
    if (plan.keyResults && plan.keyResults.length > 0) {
      plan.keyResults.forEach((kr) => {
        const tasks: any[] = [];
        if (kr.tasks) tasks.push(...kr.tasks);
        kr.milestones?.forEach((m: any) => {
          if (m.tasks) tasks.push(...m.tasks);
          m.parentTask?.forEach((p: any) => {
            if (p.tasks) tasks.push(...p.tasks);
          });
        });
        kr.parentTask?.forEach((p: any) => {
          if (p.tasks) tasks.push(...p.tasks);
        });
        sumTasks(tasks);
      });
    } else if (plan.tasks && plan.tasks.length > 0) {
      sumTasks(plan.tasks);
    }
    return total;
  }, [plan, viewMode]);

  const sections = React.useMemo(() => flattenAllTasks(plan), [plan]);
  const reportTaskOverrides = useRecentReportTaskStatuses(
    (s) => s.byReport[String(plan.id)],
  );

  if (viewMode === 'reporting') {
    const reportTasks = sections.flatMap((s) =>
      s.tasks.map((t: any) => ({
        ...t,
        _krId: s.krId,
        _metricType: s.metricType,
      })),
    );
    const resolveStatus = (t: any): string => {
      const override =
        reportTaskOverrides?.[String(t.planTaskId ?? '')] ||
        reportTaskOverrides?.[String(t.id ?? '')];
      if (override?.status) return String(override.status);
      return String(t.status ?? '');
    };
    const resolveAchieved = (t: any): boolean | undefined => {
      const override =
        reportTaskOverrides?.[String(t.planTaskId ?? '')] ||
        reportTaskOverrides?.[String(t.id ?? '')];
      if (override?.isAchieved !== undefined) return override.isAchieved;
      if (override?.status) {
        const s = String(override.status).trim().toLowerCase();
        if (
          s === 'done' ||
          s === 'completed' ||
          s === 'complete' ||
          s === 'achieved'
        )
          return true;
        if (
          s === 'not' ||
          s === 'failed' ||
          s === 'not_done' ||
          s === 'unachieved'
        )
          return false;
      }
      return t.isAchieved;
    };
    const completedCount = reportTasks.filter((t: any) => {
      const s = resolveStatus(t)
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, '_');
      const achieved = resolveAchieved(t);
      if (
        s === 'not' ||
        s === 'failed' ||
        s === 'not_done' ||
        s === 'unachieved' ||
        achieved === false
      ) {
        return false;
      }
      return (
        s === 'completed' ||
        s === 'done' ||
        s === 'complete' ||
        s === 'achieved' ||
        achieved === true
      );
    }).length;
    const reportTotal = reportTasks.length;
    const reportPct =
      reportTotal > 0 ? Math.round((completedCount / reportTotal) * 100) : 0;

    return (
      <article
        data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-article-160"
        className="group/card min-w-0 max-w-full overflow-hidden rounded-xl border border-[#F1F2F6] bg-white transition-all duration-200 hover:border-[#D6D3FF] hover:shadow-[0_4px_20px_rgba(87,76,255,0.06)]"
        data-active-cadence={activeCadence}
      >
        {/* Header */}
        <div
          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-375"
          className="px-4 pt-3.5 pb-3 md:px-5"
        >
          <div
            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-376"
            className="flex items-center justify-between gap-2"
          >
            <div
              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-377"
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <UserInfo
                owner={plan.owner}
                notificationCount={plan.notificationCount}
              />
            </div>

            <div
              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-384"
              className="flex items-center gap-1.5 flex-shrink-0"
            >
              {plan.reprimandCount && plan.reprimandCount > 0 ? (
                <div
                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-386"
                  className="flex items-center gap-1 rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[#991B1B]"
                >
                  <span
                    data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-387"
                    className="text-[12px] font-bold"
                  >
                    {plan.reprimandCount}
                  </span>
                  <FaBomb className="text-[11px]" />
                </div>
              ) : null}
              {plan.appreciationCount && plan.appreciationCount > 0 ? (
                <div
                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-394"
                  className="flex items-center gap-1 rounded-full bg-[#D1FAE5] px-2 py-0.5 text-[#059669]"
                >
                  <span
                    data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-395"
                    className="text-[12px] font-bold"
                  >
                    {plan.appreciationCount}
                  </span>
                  <FaRegThumbsUp className="text-[11px]" />
                </div>
              ) : null}
              {plan.status && <StatusBadge status={plan.status} />}
              {inlineReportActive && onCloseInlineReport ? (
                <button
                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-button-437"
                  type="button"
                  id={`plan-card-${plan.id}-cancel-inline-report`}
                  onClick={onCloseInlineReport}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#574CFF]"
                  aria-label="Close inline report"
                >
                  <CloseOutlined className="text-[14px]" />
                </button>
              ) : null}
              {canApprove && (
                <Dropdown
                  menu={{ items: approvalMenuItems }}
                  trigger={['click']}
                >
                  <Button
                    id={`plan-card-approve-dropdown-button-${plan.id}`}
                    data-cy={`plan-card-approve-dropdown-button-${plan.id}`}
                    loading={isApprovalLoading}
                    type="text"
                    icon={<MoreOutlined />}
                    className="text-green-600 hover:bg-transparent !p-0 !h-auto !w-auto text-base"
                    style={{ minWidth: 'auto' }}
                  />
                </Dropdown>
              )}
              {canEdit && plan.status?.label === 'Open' && (
                <Dropdown menu={{ items: editMenuItems }} trigger={['click']}>
                  <Button
                    id={`plan-card-edit-dropdown-button-${plan.id}`}
                    data-cy={`plan-card-edit-dropdown-button-${plan.id}`}
                    type="text"
                    icon={<MoreOutlined />}
                    className="text-[#8F94A3] hover:bg-transparent !p-0 !h-auto !w-auto text-base"
                    style={{ minWidth: 'auto' }}
                  />
                </Dropdown>
              )}
            </div>
          </div>
        </div>

        {inlineReportActive && onCloseInlineReport ? inlineReportContent : null}

        {/* Task list (hidden while inline report form is open) */}
        {!inlineReportActive ? (
          <div
            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-449"
            className="px-3 md:px-4 pb-2"
          >
            {reportTasks.length > 0 && (
              <div
                data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-451"
                className="flex items-center px-2.5 pb-1 mb-0.5 mt-1"
              >
                <div
                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-452"
                  className="flex items-center gap-2 flex-1 min-w-0"
                >
                  <span
                    data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-453"
                    className="text-[13px] font-medium text-[#8F94A3]"
                  >
                    {getDateLabel()}
                  </span>
                  <span
                    data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-456"
                    className="text-[13px] font-medium text-[#8F94A3]"
                  >
                    {completedCount}/{reportTotal}
                  </span>
                  <div
                    data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-459"
                    className="h-[4px] w-[52px] overflow-hidden rounded-full bg-[#F1F2F6]"
                  >
                    <div
                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-512"
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${reportPct}%`,
                        backgroundColor:
                          reportPct === 100
                            ? '#10B981'
                            : reportPct >= 50
                              ? '#574CFF'
                              : '#F59E0B',
                      }}
                    />
                  </div>
                </div>
                <div
                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-474"
                  className="flex flex-shrink-0 items-center"
                >
                  <div
                    data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-475"
                    className={classNames(meta.pri, metaHead)}
                  >
                    <span
                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-476"
                      className="sm:hidden"
                    >
                      Pri
                    </span>
                    <span
                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-477"
                      className="hidden sm:inline"
                    >
                      Priority
                    </span>
                  </div>
                  <div
                    data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-479"
                    className={classNames(meta.wt, metaHead)}
                  >
                    Wt
                  </div>
                  <div
                    data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-480"
                    className={classNames(meta.tgt, metaHead)}
                  >
                    <span
                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-481"
                      className="sm:hidden"
                    >
                      Scr
                    </span>
                    <span
                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-482"
                      className="hidden sm:inline"
                    >
                      Score
                    </span>
                  </div>
                  <div
                    data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-570"
                    className={classNames(meta.out, 'flex-shrink-0')}
                    aria-hidden
                  />
                </div>
              </div>
            )}
            <div
              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-491"
              className="space-y-[2px]"
            >
              {reportTasks.map((task: any) => {
                const taskAny = task as any;
                const taskName =
                  taskAny.taskName ||
                  taskAny.task ||
                  taskAny.name ||
                  task.title ||
                  taskAny.planTask?.task ||
                  'Untitled Task';

                const priorityKey = task.priority || 'Low';
                const priorityColors: Record<
                  string,
                  { dot: string; bg: string; text: string }
                > = {
                  High: { dot: '#EF4444', bg: '#FEE2E2', text: '#991B1B' },
                  Priority: { dot: '#7C3AED', bg: '#EDE9FE', text: '#5B21B6' },
                  Medium: { dot: '#F59E0B', bg: '#FEF9C3', text: '#854D0E' },
                  Low: { dot: '#22C55E', bg: '#DCFCE7', text: '#166534' },
                };
                const pc = priorityColors[priorityKey] || priorityColors.Low;

                const isCompleted =
                  task.status === 'completed' || task.isAchieved === true;
                const isFailed =
                  task.status === 'failed' || task.isAchieved === false;
                const failReason = String(
                  (task as PlanTask).customReason || taskAny.customReason || '',
                ).trim();

                const rowClassName = `group/row flex w-full min-w-0 items-start gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-150 ${
                  isCompleted
                    ? 'bg-[#F0FDF4]/50'
                    : isFailed
                      ? 'bg-[#FEF2F2]/40'
                      : 'hover:bg-[#FAFBFC]'
                } ${isFailed && failReason ? 'cursor-help' : ''}`;

                const row = (
                  <div
                    data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-620"
                    className={rowClassName}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      task._krId && onHoverKR?.(task._krId);
                      if (isFailed && failReason) {
                        const { left, top } = clampFailReasonPanelPosition(
                          e.clientX,
                          e.clientY,
                        );
                        setFailReasonCursorPanel({
                          left,
                          top,
                          text: failReason,
                        });
                      }
                    }}
                    onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
                      if (isFailed && failReason) {
                        const { left, top } = clampFailReasonPanelPosition(
                          e.clientX,
                          e.clientY,
                        );
                        setFailReasonCursorPanel({
                          left,
                          top,
                          text: failReason,
                        });
                      }
                    }}
                    onMouseLeave={() => {
                      onHoverKR?.(null);
                      if (isFailed && failReason) {
                        setFailReasonCursorPanel(null);
                      }
                    }}
                  >
                    <div
                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-567"
                      className="mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center"
                    >
                      {isCompleted ? (
                        <CheckOutlined className="text-[11px] text-[#10B981]" />
                      ) : isFailed ? (
                        <ExclamationCircleFilled className="text-[13px] text-[#EF4444]/80" />
                      ) : (
                        <span
                          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-573"
                          className="inline-block h-2 w-2 rounded-full bg-[#D1D5DB]"
                        />
                      )}
                    </div>

                    <p
                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-p-672"
                      className={`min-w-0 flex-1 break-words text-[14px] leading-snug line-clamp-2 transition-all duration-200 ${
                        isCompleted
                          ? 'line-through text-[#B0B3C0]'
                          : isFailed
                            ? 'text-[#DC2626]'
                            : 'text-[#2D2F45]'
                      }`}
                      title={isFailed && failReason ? undefined : taskName}
                    >
                      {taskName}
                    </p>

                    <div
                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-590"
                      className="flex flex-shrink-0 items-center self-center"
                    >
                      <div
                        data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-591"
                        className={classNames(meta.pri, 'flex justify-end')}
                      >
                        <span
                          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-693"
                          className="inline-flex max-w-full items-center gap-1 rounded-full px-1.5 py-[4px] text-[11px] font-bold leading-none sm:gap-1 sm:px-2 sm:py-1 sm:text-[12px]"
                          style={{ backgroundColor: pc.bg, color: pc.text }}
                        >
                          <span
                            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-697"
                            className="inline-block h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: pc.dot }}
                          />
                          {priorityChipText(priorityKey)}
                        </span>
                      </div>

                      <div
                        data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-604"
                        className={classNames(meta.wt, 'text-right')}
                      >
                        <span
                          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-605"
                          className="text-[12px] font-semibold text-[#8F94A3] tabular-nums sm:text-[13px]"
                        >
                          {formatNum(task.weight)}
                        </span>
                      </div>

                      <div
                        data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-610"
                        className={classNames(meta.tgt, 'text-right')}
                      >
                        {task.achieved !== undefined ? (
                          <span
                            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-722"
                            className={`text-[12px] font-semibold tabular-nums sm:text-[13px] ${
                              isCompleted
                                ? 'text-[#10B981]'
                                : isFailed
                                  ? 'text-[#EF4444]'
                                  : 'text-[#F59E0B]'
                            }`}
                          >
                            {formatNum(task.achieved)}
                          </span>
                        ) : null}
                      </div>

                      <div
                        data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-736"
                        className={classNames(
                          meta.out,
                          'flex flex-shrink-0 items-center justify-center self-center',
                        )}
                      >
                        {(task as PlanTask).achieveMK ? (
                          <Tooltip
                            title={
                              (task as PlanTask).outcomeMilestoneId
                                ? 'Milestone planned as outcome'
                                : 'Key result planned as outcome'
                            }
                          >
                            <FlagOutlined
                              className="text-[10px] text-[#059669] sm:text-[12px]"
                              aria-label="Outcome task"
                            />
                          </Tooltip>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );

                return (
                  <div
                    data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-652"
                    key={task.id}
                    className="w-full min-w-0"
                  >
                    {row}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Footer: comments + points */}
        <div
          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-662"
          className="border-t border-[#F1F2F6] px-4 py-2 md:px-5"
        >
          <CommentsSection
            commentCount={plan.commentCount}
            commentAvatars={plan.commentAvatars}
            planId={plan.id}
            isPlanCard={false}
            comments={plan.comments}
            achieved={totalAchieved}
            onOpenThread={
              onOpenThread ? () => onOpenThread(plan.id, 'report') : undefined
            }
          />
        </div>
        {failReasonCursorPanel &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-795"
              role="tooltip"
              className="pointer-events-none fixed z-[10000] max-w-[min(340px,80vw)] rounded-[10px] px-3.5 py-2.5"
              style={{
                left: failReasonCursorPanel.left,
                top: failReasonCursorPanel.top,
                background: 'linear-gradient(135deg, #1F1F2E 0%, #2A2A3C 100%)',
                boxShadow:
                  '0 8px 30px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F3F4F6',
                fontSize: 13,
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {failReasonCursorPanel.text}
            </div>,
            document.body,
          )}
      </article>
    );
  }

  // ─── Planning view ─────────────────────────────────────────────────────

  const allTasks = sections.flatMap((s) =>
    s.tasks.map((t: any) => ({
      ...t,
      _krId: s.krId,
      _metricType: s.metricType,
    })),
  );

  const checkedCount = allTasks.filter((t: any) => {
    const s = optimisticStatuses[t.id] ?? t.status;
    return s === 'pre_achieved' || s === 'completed';
  }).length;
  const totalTasks = allTasks.length;
  const progressPct =
    totalTasks > 0 ? Math.round((checkedCount / totalTasks) * 100) : 0;

  return (
    <article
      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-article-160"
      className="group/card min-w-0 max-w-full overflow-hidden rounded-xl border border-[#F1F2F6] bg-white transition-all duration-200 hover:border-[#D6D3FF] hover:shadow-[0_4px_20px_rgba(87,76,255,0.06)]"
      data-active-cadence={activeCadence}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div
        data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-728"
        className="px-4 pt-3.5 pb-3 md:px-5"
      >
        <div
          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-729"
          className="flex items-center justify-between gap-2"
        >
          <div
            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-730"
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <UserInfo
              owner={plan.owner}
              notificationCount={plan.notificationCount}
            />
          </div>

          <div
            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-737"
            className="flex flex-wrap items-center justify-end gap-1.5 flex-shrink-0"
          >
            {plan.reprimandCount && plan.reprimandCount > 0 ? (
              <div
                data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-739"
                className="flex items-center gap-1 rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[#991B1B]"
              >
                <span
                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-740"
                  className="text-[12px] font-bold"
                >
                  {plan.reprimandCount}
                </span>
                <FaBomb className="text-[11px]" />
              </div>
            ) : null}
            {plan.appreciationCount && plan.appreciationCount > 0 ? (
              <div
                data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-747"
                className="flex items-center gap-1 rounded-full bg-[#D1FAE5] px-2 py-0.5 text-[#059669]"
              >
                <span
                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-748"
                  className="text-[12px] font-bold"
                >
                  {plan.appreciationCount}
                </span>
                <FaRegThumbsUp className="text-[11px]" />
              </div>
            ) : null}
            {!inlineReportActive && showSubmitReport && onSubmitReport ? (
              <CustomButton
                title="Report"
                id={`plan-card-${plan.id}-submit-report`}
                size="small"
                textClassName="text-[11px] font-semibold leading-tight sm:text-xs"
                style={{ paddingInline: 10 }}
                onClick={onSubmitReport}
                className="!h-7 !min-h-7 !w-auto !min-w-0 !shrink-0 !rounded-md !px-2.5 !py-0 !bg-[#1E40AF] !text-white hover:!bg-[#1E3A8A]"
              />
            ) : null}
            {plan.status && <StatusBadge status={plan.status} />}
            {inlineReportActive && onCloseInlineReport ? (
              <button
                data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-button-897"
                type="button"
                id={`plan-card-${plan.id}-cancel-inline-report`}
                onClick={onCloseInlineReport}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#574CFF]"
                aria-label="Close inline report"
              >
                <CloseOutlined className="text-[14px]" />
              </button>
            ) : null}
            {canApprove && (
              <Dropdown menu={{ items: approvalMenuItems }} trigger={['click']}>
                <Button
                  id={`plan-card-approve-dropdown-button-${plan.id}`}
                  data-cy={`plan-card-approve-dropdown-button-${plan.id}`}
                  loading={isApprovalLoading}
                  type="text"
                  icon={<MoreOutlined />}
                  className="text-green-600 hover:bg-transparent !p-0 !h-auto !w-auto text-base"
                  style={{ minWidth: 'auto' }}
                />
              </Dropdown>
            )}
            {canEdit && plan.status?.label === 'Open' && (
              <Dropdown menu={{ items: editMenuItems }} trigger={['click']}>
                <Button
                  id={`plan-card-edit-dropdown-button-${plan.id}`}
                  data-cy={`plan-card-edit-dropdown-button-${plan.id}`}
                  type="text"
                  icon={<MoreOutlined />}
                  className="text-[#8F94A3] hover:bg-transparent !p-0 !h-auto !w-auto text-base"
                  style={{ minWidth: 'auto' }}
                />
              </Dropdown>
            )}
          </div>
        </div>
      </div>

      {inlineReportActive && onCloseInlineReport
        ? (inlineReportContent ??
          (planningPeriodId ? (
            <PlanCardInlineReportForm
              planId={plan.id}
              planningPeriodId={planningPeriodId}
              planningPeriodName={planningPeriodLabel}
              onClose={onCloseInlineReport}
            />
          ) : null))
        : null}

      {/* ── Task list ─────────────────────────────────────────── */}
      <div
        data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-819"
        className="px-3 md:px-4 pb-2"
      >
        {/* Column titles + date + progress */}
        {!inlineReportActive && allTasks.length > 0 && (
          <div
            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-822"
            className="flex items-center px-2.5 pb-1 mb-0.5 mt-1"
          >
            <div
              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-823"
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              <span
                data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-824"
                className="text-[13px] font-medium text-[#8F94A3]"
              >
                {getDateLabel()}
              </span>
              <span
                data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-827"
                className="text-[13px] font-medium text-[#8F94A3]"
              >
                {checkedCount}/{totalTasks}
              </span>
              <div
                data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-830"
                className="h-[4px] w-[52px] overflow-hidden rounded-full bg-[#F1F2F6]"
              >
                <div
                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-990"
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPct}%`,
                    backgroundColor:
                      progressPct === 100
                        ? '#10B981'
                        : progressPct >= 50
                          ? '#1E40AF'
                          : '#F59E0B',
                  }}
                />
              </div>
            </div>
            <div
              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-845"
              className="flex flex-shrink-0 items-center"
            >
              <div
                data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-846"
                className={classNames(meta.pri, metaHead)}
              >
                <span
                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-847"
                  className="sm:hidden"
                >
                  Pri
                </span>
                <span
                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-848"
                  className="hidden sm:inline"
                >
                  Priority
                </span>
              </div>
              <div
                data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-850"
                className={classNames(meta.wt, metaHead)}
              >
                Wt
              </div>
              <div
                data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-851"
                className={classNames(meta.tgt, metaHead)}
              >
                <span
                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-852"
                  className="sm:hidden"
                >
                  Tgt
                </span>
                <span
                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-853"
                  className="hidden sm:inline"
                >
                  Target
                </span>
              </div>
              <div
                data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-1048"
                className={classNames(meta.out, 'flex-shrink-0')}
                aria-hidden
              />
            </div>
          </div>
        )}
        <div
          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-862"
          className="space-y-[2px]"
        >
          {!inlineReportActive &&
            allTasks.map((task: any) => {
              const taskAny = task as any;
              const taskName =
                taskAny.taskName ||
                taskAny.task ||
                taskAny.name ||
                task.title ||
                taskAny.planTask?.task ||
                'Untitled Task';

              const priorityKey = task.priority || 'Low';
              const priorityColors: Record<
                string,
                { dot: string; bg: string; text: string }
              > = {
                High: { dot: '#EF4444', bg: '#FEE2E2', text: '#991B1B' },
                Priority: { dot: '#7C3AED', bg: '#EDE9FE', text: '#5B21B6' },
                Medium: { dot: '#F59E0B', bg: '#FEF9C3', text: '#854D0E' },
                Low: { dot: '#22C55E', bg: '#DCFCE7', text: '#166534' },
              };
              const pc = priorityColors[priorityKey] || priorityColors.Low;

              const showTarget =
                task.target !== undefined &&
                task.target !== 0 &&
                task._metricType !== 'Milestone';

              const effectiveStatus =
                optimisticStatuses[task.id] ?? task.status;
              const isChecked = effectiveStatus === 'pre_achieved';
              const isCompleted = effectiveStatus === 'completed';
              const isLoading = loadingTasks.has(task.id);

              return (
                <div
                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-1094"
                  key={task.id}
                  className={`group/row flex items-start gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-150 ${
                    isChecked ? 'bg-[#2563EB]/[0.03]' : 'hover:bg-[#FAFBFC]'
                  }`}
                  onMouseEnter={() => task._krId && onHoverKR?.(task._krId)}
                  onMouseLeave={() => onHoverKR?.(null)}
                >
                  {/* Pre-achieve: owner uses interactive control; teammates see same visuals, read-only */}
                  {isTeammatePlan ? (
                    <span
                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-1104"
                      className={`relative mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-all duration-200 ${
                        isCompleted
                          ? 'border-[#D1D5DB] bg-[#F3F4F6]'
                          : isChecked
                            ? 'border-[#2563EB] bg-[#2563EB] shadow-[0_0_0_2px_rgba(37,99,235,0.10)]'
                            : 'border-current bg-white text-[#D1D5DB]'
                      }`}
                      aria-hidden
                    >
                      {isChecked || isCompleted ? (
                        <CheckOutlined
                          className={`text-[10px] ${isCompleted ? 'text-[#B0B3C0]' : 'text-white'}`}
                        />
                      ) : (
                        <span
                          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-1119"
                          className="inline-block h-1.5 w-1.5 rounded-full bg-current"
                          aria-hidden
                        />
                      )}
                    </span>
                  ) : (
                    <button
                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-button-1126"
                      type="button"
                      onClick={() =>
                        !isPlanReadOnly &&
                        !isCompleted &&
                        !isLoading &&
                        handleTaskToggle(task.id, effectiveStatus ?? '')
                      }
                      disabled={isPlanReadOnly || isCompleted || isLoading}
                      className={`relative mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-all duration-200 ${
                        isPlanReadOnly || isCompleted
                          ? 'border-[#D1D5DB] bg-[#F3F4F6] cursor-not-allowed'
                          : isChecked
                            ? 'border-[#2563EB] bg-[#2563EB] shadow-[0_0_0_2px_rgba(37,99,235,0.10)]'
                            : 'border-[#D1D5DB] bg-white hover:border-[#2563EB]/45 hover:shadow-[0_0_0_2px_rgba(37,99,235,0.07)] cursor-pointer'
                      }`}
                    >
                      {isLoading ? (
                        <LuLoader className="h-3 w-3 animate-spin text-[#2563EB]" />
                      ) : isChecked || isCompleted ? (
                        <CheckOutlined
                          className={`text-[10px] ${isCompleted ? 'text-[#B0B3C0]' : 'text-white'}`}
                        />
                      ) : null}
                    </button>
                  )}

                  <p
                    data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-p-1153"
                    className={`min-w-0 flex-1 break-words text-[14px] leading-snug line-clamp-2 transition-all duration-200 ${
                      isChecked
                        ? 'line-through text-[#B0B3C0]'
                        : isCompleted
                          ? 'line-through text-[#D1D5DB]'
                          : 'text-[#2D2F45]'
                    }`}
                    title={taskName}
                  >
                    {taskName}
                  </p>

                  {/* Right-side meta columns — fixed widths for alignment */}
                  <div
                    data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-971"
                    className="flex flex-shrink-0 items-center self-center"
                  >
                    <div
                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-972"
                      className={classNames(meta.pri, 'flex justify-end')}
                    >
                      <span
                        data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-1175"
                        className="inline-flex max-w-full items-center gap-1 rounded-full px-1.5 py-[4px] text-[11px] font-bold leading-none sm:gap-1 sm:px-2 sm:py-1 sm:text-[12px]"
                        style={{ backgroundColor: pc.bg, color: pc.text }}
                      >
                        <span
                          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-1179"
                          className="inline-block h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: pc.dot }}
                        />
                        {priorityChipText(priorityKey)}
                      </span>
                    </div>

                    <div
                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-985"
                      className={classNames(meta.wt, 'text-right')}
                    >
                      <span
                        data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-986"
                        className="text-[12px] font-semibold text-[#8F94A3] tabular-nums sm:text-[13px]"
                      >
                        {formatNum(task.weight)}
                      </span>
                    </div>

                    <div
                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-991"
                      className={classNames(meta.tgt, 'text-right')}
                    >
                      {showTarget ? (
                        <span
                          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-993"
                          className="text-[11px] font-semibold text-[#10B981] tabular-nums sm:text-[12px]"
                        >
                          {formatNum(task.target)}
                        </span>
                      ) : null}
                    </div>

                    <div
                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-1213"
                      className={classNames(
                        meta.out,
                        'flex flex-shrink-0 items-center justify-center self-center',
                      )}
                    >
                      {(task as PlanTask).achieveMK ? (
                        <Tooltip
                          title={
                            (task as PlanTask).outcomeMilestoneId
                              ? 'Milestone planned as outcome'
                              : 'Key result planned as outcome'
                          }
                        >
                          <FlagOutlined
                            className="text-[10px] text-[#059669] sm:text-[12px]"
                            aria-label="Outcome task"
                          />
                        </Tooltip>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ── Footer: comments (hidden during inline report submit) ─ */}
      {!inlineReportActive ? (
        <div
          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-1029"
          className="border-t border-[#F1F2F6] px-4 py-2 md:px-5"
        >
          <CommentsSection
            commentCount={plan.commentCount}
            commentAvatars={plan.commentAvatars}
            planId={plan.id}
            isPlanCard={viewMode === 'planning'}
            comments={plan.comments}
            achieved={totalAchieved}
            onOpenThread={
              onOpenThread ? () => onOpenThread(plan.id, 'plan') : undefined
            }
          />
        </div>
      ) : null}
    </article>
  );
}
