import React, { useState, useCallback, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { createPortal } from 'react-dom';
import {
  Button,
  Collapse,
  Dropdown,
  Input,
  Modal,
  Pagination,
  Tooltip,
  message,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  MoreOutlined,
  CheckOutlined,
  ExclamationCircleFilled,
  FlagOutlined,
  CloseOutlined,
  LockOutlined,
  UnlockOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { FaBomb, FaRegThumbsUp } from 'react-icons/fa';
import { AiOutlineEdit } from 'react-icons/ai';
import { LuLoader } from 'react-icons/lu';
import { BsKey } from 'react-icons/bs';
import { PlanSummary, PlanTask, ViewMode, Cadence } from '../types';
import { formatLastReportedLabel, formatPlanningReportDate } from '../utils';
import UserInfo from '../UserInfo';
import StatusBadge from '../StatusBadge';
import { useUpdateStatus } from '@/store/server/features/okrPlanningAndReporting/mutations';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useUserPlanRepositoryMock } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import { usePlanTaskDatesStore } from '@/store/uistate/features/planningAndReporting/taskDates';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { isDeadlinePlanningMockEnabled } from '@/utils/deadlinePlanningMocks';
import {
  todayIso,
  parseDate,
  formatDate,
} from '@/app/(afterLogin)/dashboard/_components/plan/deadline/bucket';
import type { DeadlineKind } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';
import CustomButton from '@/components/common/buttons/customButton';
import { PlanCardInlineReportForm } from '../createReport/PlanCardInlineReportForm';
import { useRecentReportTaskStatuses } from '@/utils/recentReportTaskStatuses';
import {
  durationFilterMatchesTask,
  isPlanHistoryFilter,
  planFilterValueToKind,
  taskInHistoryRange,
} from '../planning/durationFilter';
import { mockDisplayNameForUserId } from '../prototype/mockPlanningConstants';
import {
  planCardAssigneeLabel,
  planCardAssigneeRole,
  type PlanCardDisplayMode,
} from '../planning/planCardDisplay';
import PlanCardTasksTable from './PlanCardTasksTable';
import LockTasksModal from './LockTasksModal';
import TaskCommentsModal from './TaskCommentsModal';
import type { MockPlanTask } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import {
  filterMockHistoryTasks,
  filterMockTasksByDuration,
} from '../prototype/mockDurationFilter';
import { UNLINKED_KR_ID } from '../prototype/mockPlanningConstants';
import {
  collectMockTasksForStatusFilter,
  normalizePlanningTaskStatusFilter,
} from '../planning/planningTaskStatusFilter';

const HISTORY_PAGE_SIZE = 8;

function renderTaskDelegationLabel(
  taskId: string,
  assignedByUserId: string | null | undefined,
  viewerUserId: string | null | undefined,
) {
  if (!assignedByUserId) return null;
  const isDelegator = String(assignedByUserId) === String(viewerUserId ?? '');
  return (
    <span
      data-cy={`plan-card-task-delegation-${taskId}`}
      className="mt-0.5 inline-flex max-w-full items-center rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold text-[#1E40AF]"
    >
      {isDelegator ? (
        'Delegated'
      ) : (
        <>
          Assigned by{' '}
          {mockDisplayNameForUserId(
            String(assignedByUserId),
            String(viewerUserId ?? ''),
          )}
        </>
      )}
    </span>
  );
}

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
  /** Starts inline add-task / add-plan composer (owner My Plan only). */
  onAddPlan?: () => void;
  showAddPlan?: boolean;
  /** Manager assigns a new task onto this teammate's plan. */
  /** Composer rendered inside My Plan when adding to the existing plan. */
  addPlanComposer?: React.ReactNode;
  inlineReportActive?: boolean;
  onCloseInlineReport?: () => void;
  /** Period name for inline / drawer labels (e.g. Weekly) */
  planningPeriodLabel?: string;
  /** Optional custom inline section (used for report edit mode). */
  inlineReportContent?: React.ReactNode;
  /** Layout driven by assignee chip selection (compact / team / full). */
  displayMode?: PlanCardDisplayMode;
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

/** Target applies only when the task is linked to a real key result. */
function isTaskLinkedToKeyResult(task: any): boolean {
  const id =
    task?.keyResultId ??
    task?._krId ??
    task?.keyResult?.id ??
    task?.planTask?.keyResultId ??
    null;
  if (id == null || id === '') return false;
  return String(id) !== UNLINKED_KR_ID;
}

function resolveTaskKeyResultMeta(
  task: any,
  plan?: PlanSummary,
): { id: string; title: string } | null {
  if (!isTaskLinkedToKeyResult(task)) return null;
  const id = String(
    task?.keyResultId ??
      task?._krId ??
      task?.keyResult?.id ??
      task?.planTask?.keyResultId ??
      '',
  );
  if (!id) return null;

  const fromTask =
    task?.keyResultTitle ||
    task?.keyResult?.title ||
    task?.keyResult?.name ||
    task?.planTask?.keyResultTitle ||
    task?.planTask?.keyResult?.title ||
    task?.planTask?.keyResult?.name;

  const fromPlan = plan?.keyResults?.find((kr) => String(kr.id) === id);
  const title = String(
    fromTask || fromPlan?.title || fromPlan?.name || '',
  ).trim();
  if (!title) return null;
  return { id, title };
}

function taskTargetDisplay(task: any): string {
  if (!isTaskLinkedToKeyResult(task)) return '—';
  const raw =
    task?.targetValue ??
    task?.target ??
    task?.planTask?.targetValue ??
    task?.weight;
  return formatNum(raw);
}

/** Tighter meta columns on small screens; align header + task rows. */
const meta = {
  pri: 'w-[52px] sm:w-[68px]',
  tgtPlan: 'w-[36px] sm:w-[52px]',
  tgt: 'w-[32px] sm:w-[46px]',
  out: 'w-[13px] sm:w-[18px]',
  deadline: 'w-[72px] sm:w-[88px]',
  daysLeft: 'w-[78px] sm:w-[96px]',
  /** Lock / comments / unlock — keep header + rows aligned. */
  actions: 'w-[64px] sm:w-[72px]',
} as const;

const metaHead =
  'text-right text-[11px] font-medium uppercase leading-none tracking-tighter text-[#B0B3C0] sm:text-[12px] sm:tracking-wider';

/** Flat light tint — same pattern as locked/completed rows (no ring/border). */
const pendingTaskRowClass = 'bg-[#FFF7ED]/50';

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
  onSubmitReport,
  showSubmitReport,
  onAddPlan,
  showAddPlan,
  addPlanComposer,
  inlineReportActive = false,
  onCloseInlineReport,
  planningPeriodLabel,
  inlineReportContent,
  displayMode = 'full',
}: PlanCardProps) {
  const { mutate: updateStatus } = useUpdateStatus();
  const togglePreAchieved = useUserPlanRepositoryMock(
    (s) => s.togglePreAchieved,
  );
  const reportMockTasks = useUserPlanRepositoryMock((s) => s.reportTasks);
  const archiveMockTasks = useUserPlanRepositoryMock((s) => s.archiveTasks);
  const lockMockTasks = useUserPlanRepositoryMock((s) => s.lockTasks);
  const unlockMockTask = useUserPlanRepositoryMock((s) => s.unlockTask);
  const validatePendingReportTasks = useUserPlanRepositoryMock(
    (s) => s.validatePendingReportTasks,
  );
  const mockPlansByUserId = useUserPlanRepositoryMock((s) => s.plansByUserId);
  const mockEnabled = isDeadlinePlanningMockEnabled();
  const viewerUserId = useAuthenticationStore((s) => s.userId);
  const isTeammatePlan =
    viewMode === 'planning' &&
    Boolean(
      plan.ownerUserId && viewerUserId && plan.ownerUserId !== viewerUserId,
    );
  // Pre-achieve ticks stay available for the owner even when the edit menu is hidden.
  // Closed mock plans still allow hierarchy subtask adds (land under Pending).
  const isPlanReadOnly =
    viewMode === 'planning' &&
    (isTeammatePlan ||
      Boolean(plan.isReported) ||
      (plan.status?.label !== 'Open' && !mockEnabled));
  const canAddMockSubtasks =
    mockEnabled &&
    viewMode === 'planning' &&
    !isTeammatePlan &&
    !plan.isReported;

  /** Mock: checked tasks waiting to be submitted via Report */
  const mockCheckedTasks = useMemo(() => {
    if (!mockEnabled || !plan.ownerUserId) return [];
    const mockPlan = mockPlansByUserId[plan.ownerUserId];
    return (mockPlan?.activeTasks ?? []).filter(
      (t) => !t.isReported && !!t.done,
    );
  }, [mockEnabled, plan.ownerUserId, mockPlansByUserId]);

  const showMockReportButton =
    mockEnabled &&
    viewMode === 'planning' &&
    !isTeammatePlan &&
    !plan.isReported &&
    mockCheckedTasks.length > 0;

  const handleMockReportSelected = useCallback(() => {
    if (!plan.ownerUserId || mockCheckedTasks.length === 0) return;
    reportMockTasks(
      plan.ownerUserId,
      mockCheckedTasks.map((t) => ({
        taskId: t.id,
        status: 'Done' as const,
      })),
    );
  }, [plan.ownerUserId, mockCheckedTasks, reportMockTasks]);
  const [optimisticStatuses, setOptimisticStatuses] = useState<
    Record<string, string>
  >({});
  const [loadingTasks, setLoadingTasks] = useState<Set<string>>(new Set());
  const [failReasonCursorPanel, setFailReasonCursorPanel] = useState<{
    left: number;
    top: number;
    text: string;
  } | null>(null);
  const {
    planningDurationFilter,
    planningHistoryRange,
    planningTaskStatusFilter,
  } = PlanningAndReportingStore();
  const planningStatusFilter = normalizePlanningTaskStatusFilter(
    planningTaskStatusFilter,
  );
  const isReportedStatusFilter = planningStatusFilter === 'reported';
  const isHistoryMode = isPlanHistoryFilter(planningDurationFilter);
  const durationKind: DeadlineKind = planFilterValueToKind(
    planningDurationFilter,
  );
  const historyRange = planningHistoryRange;
  const [historyPage, setHistoryPage] = useState(1);
  const datesByTaskId = usePlanTaskDatesStore((s) => s.datesByTaskId);
  const [lockTarget, setLockTarget] = useState<{
    taskIds: string[];
    titles: string[];
    mergePending: boolean;
  } | null>(null);
  const [commentsTask, setCommentsTask] = useState<MockPlanTask | null>(null);
  const [addComposerExpanded, setAddComposerExpanded] = useState(false);
  const [liveLockConfirm, setLiveLockConfirm] = useState<{
    mode: 'lock' | 'unlock';
  } | null>(null);
  const [liveLockComment, setLiveLockComment] = useState('');
  const [lockSubmitting, setLockSubmitting] = useState(false);

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

      if (mockEnabled) {
        const ownerId = plan.ownerUserId;
        if (ownerId) togglePreAchieved(ownerId, taskId);
        setLoadingTasks((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
        return;
      }

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
    [
      updateStatus,
      planningPeriodId,
      isPlanReadOnly,
      mockEnabled,
      plan.ownerUserId,
      togglePreAchieved,
    ],
  );
  const mockPendingReportTasks = useMemo(() => {
    if (!mockEnabled || !plan.ownerUserId) return [] as MockPlanTask[];
    return mockPlansByUserId[plan.ownerUserId]?.pendingReportTasks ?? [];
  }, [mockEnabled, plan.ownerUserId, mockPlansByUserId]);

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
    ...(mockEnabled &&
    viewMode === 'planning' &&
    plan.ownerUserId &&
    !isTeammatePlan
      ? [
          {
            key: 'archive-old',
            label: (
              <Tooltip title="Move tasks with deadlines before this month into History">
                <span data-cy={`plan-card-archive-old-${plan.id}`}>
                  Archive old tasks
                </span>
              </Tooltip>
            ),
            onClick: () => {
              const ownerId = plan.ownerUserId;
              if (!ownerId) return;
              const monthStart = formatDate(
                parseDate(todayIso()).startOf('month'),
              );
              const mockPlan = mockPlansByUserId[ownerId];
              const ids = (mockPlan?.activeTasks ?? [])
                .filter(
                  (t) =>
                    !t.isPendingApproval &&
                    String(t.deadline).slice(0, 10) < monthStart,
                )
                .map((t) => t.id);
              const { archivedCount } = archiveMockTasks(ownerId, ids);
              if (archivedCount === 0) {
                message.info('No old tasks to archive.');
                return;
              }
              message.success(
                `Archived ${archivedCount} task${archivedCount === 1 ? '' : 's'} to History.`,
              );
            },
          },
        ]
      : []),
  ];

  const getDateLabel = (): string => {
    if (dateLabel) return dateLabel;
    if (viewMode === 'reporting') {
      return formatLastReportedLabel(plan.createdAt ?? '');
    }
    return formatPlanningReportDate(plan.createdAt ?? '');
  };

  const sections = React.useMemo(() => {
    const raw = flattenAllTasks(plan);
    if (viewMode !== 'planning') return raw;
    const today = todayIso();
    return raw
      .map((section) => ({
        ...section,
        // Pending (new/unclosed) tasks always stay visible under the Pending tag;
        // duration filter only applies to confirmed/closed tasks.
        tasks: section.tasks.filter(
          (task: any) =>
            !!task.isPendingApproval ||
            !!task.assignedByUserId ||
            durationFilterMatchesTask(
              task,
              durationKind,
              today,
              datesByTaskId,
              durationKind,
            ),
        ),
      }))
      .filter((section) => section.tasks.length > 0);
  }, [plan, viewMode, durationKind, datesByTaskId]);
  const reportTaskOverrides = useRecentReportTaskStatuses(
    (s) => s.byReport[String(plan.id)],
  );

  // ─── Planning view ─────────────────────────────────────────────────────

  const mockPlanRecord = React.useMemo(() => {
    if (!mockEnabled || !plan.ownerUserId) return null;
    return mockPlansByUserId[plan.ownerUserId] ?? null;
  }, [mockEnabled, mockPlansByUserId, plan.ownerUserId]);

  const mockActiveTasks: MockPlanTask[] = React.useMemo(() => {
    return (mockPlanRecord?.activeTasks ?? []).filter((t) => !t.isReported);
  }, [mockPlanRecord]);

  const mockReportedTasks: MockPlanTask[] = React.useMemo(() => {
    return mockPlanRecord?.archivedTasks ?? [];
  }, [mockPlanRecord]);

  const mockStatusFilteredTasks = React.useMemo(() => {
    if (!mockPlanRecord) return [] as MockPlanTask[];
    return collectMockTasksForStatusFilter(
      mockPlanRecord,
      planningStatusFilter,
    );
  }, [mockPlanRecord, planningStatusFilter]);

  const mapMockTaskToPlanningTask = useCallback((t: MockPlanTask) => {
    return {
      id: t.id,
      title: t.title,
      task: t.title,
      taskName: t.title,
      priority:
        t.priority === 'high'
          ? 'High'
          : t.priority === 'medium'
            ? 'Medium'
            : t.priority === 'priority'
              ? 'Priority'
              : 'Low',
      weight: t.weight ?? 0,
      targetValue: t.targetValue ?? t.weight ?? 0,
      status: t.done ? 'pre_achieved' : 'pre_pending',
      deadline: t.deadline,
      startDate: t.start,
      endDate: t.deadline,
      isPendingApproval: t.isPendingApproval,
      isLocked: t.isLocked,
      isReported: !!t.isReported,
      done: !!t.done,
      lockComment: t.lockComment,
      commentCount: t.comments?.length ?? 0,
      kind: t.kind,
      parentId: t.parentId,
      keyResultId: t.keyResultId ?? null,
      keyResultTitle: t.keyResultTitle ?? null,
      assignedByUserId: t.assignedByUserId ?? null,
    };
  }, []);

  const rawPlanningTasks = React.useMemo(() => {
    if (mockEnabled && plan.ownerUserId) {
      const pendingSource = mockStatusFilteredTasks.filter(
        (t) => !!t.isPendingApproval,
      );
      const confirmedSource = mockStatusFilteredTasks.filter(
        (t) => !t.isPendingApproval,
      );
      return [...confirmedSource, ...pendingSource].map(
        mapMockTaskToPlanningTask,
      );
    }
    return flattenAllTasks(plan).flatMap((s) =>
      s.tasks.map((t: any) => ({
        ...t,
        _krId: s.krId,
        _metricType: s.metricType,
      })),
    );
  }, [
    plan,
    mockEnabled,
    mockStatusFilteredTasks,
    plan.ownerUserId,
    mapMockTaskToPlanningTask,
  ]);

  const pendingTasks = rawPlanningTasks.filter(
    (t: any) => !!t.isPendingApproval,
  );
  const isLockedPlanningTask = (t: any) =>
    !t.isPendingApproval && (!!t.isLocked || !!t.assignedByUserId);
  const lockedTasks = rawPlanningTasks.filter(isLockedPlanningTask);
  const allConfirmedTasks = rawPlanningTasks.filter(
    (t: any) => !t.isPendingApproval && !isLockedPlanningTask(t),
  );

  // Always respect Today / This Week / This Month (including Closed plans).
  // Pending tasks stay visible regardless of duration.
  const confirmedTasks = React.useMemo(() => {
    if (mockEnabled) {
      const today = todayIso();
      const confirmedSource = isReportedStatusFilter
        ? mockStatusFilteredTasks.filter((t) => !t.isPendingApproval)
        : mockStatusFilteredTasks.filter(
            (t) => !t.isPendingApproval && !t.isLocked && !t.assignedByUserId,
          );
      const filtered = filterMockTasksByDuration(
        confirmedSource,
        durationKind,
        today,
      );
      if (isReportedStatusFilter) {
        return filtered.map(mapMockTaskToPlanningTask);
      }
      const ids = new Set(filtered.map((t) => t.id));
      return allConfirmedTasks.filter((t: any) => ids.has(t.id));
    }
    const today = todayIso();
    return allConfirmedTasks.filter((task: any) =>
      durationFilterMatchesTask(
        task,
        durationKind,
        today,
        datesByTaskId,
        durationKind,
      ),
    );
  }, [
    allConfirmedTasks,
    durationKind,
    datesByTaskId,
    mockEnabled,
    mockStatusFilteredTasks,
    isReportedStatusFilter,
    mapMockTaskToPlanningTask,
  ]);

  const isClosedPlan = plan.status?.label === 'Closed';
  /** One Locked section: closed-plan confirmed tasks + manager-delegated tasks. */
  const lockedSectionTasks = React.useMemo(() => {
    const merged: any[] = [];
    const seen = new Set<string>();
    const push = (task: any) => {
      if (!task?.id || seen.has(task.id)) return;
      seen.add(task.id);
      merged.push(task);
    };
    if (isClosedPlan) {
      confirmedTasks.forEach(push);
    }
    lockedTasks.forEach(push);
    return merged;
  }, [isClosedPlan, confirmedTasks, lockedTasks]);

  const showPendingSection = pendingTasks.length > 0;

  const reportPendingTaskCount = useMemo(() => {
    if (viewMode !== 'reporting') return 0;
    return sections
      .flatMap((s) => s.tasks)
      .filter((t: { isPendingApproval?: boolean }) => !!t.isPendingApproval)
      .length;
  }, [viewMode, sections]);

  const hasPendingForManagerMenu =
    viewMode === 'reporting' ? reportPendingTaskCount > 0 : showPendingSection;

  /** Confirmed tasks on open plans (closed plans fold into Locked section). */
  const flatTasks = isClosedPlan ? [] : confirmedTasks;
  const visibleTaskCount =
    flatTasks.length + lockedSectionTasks.length + pendingTasks.length;

  /** Per-task comments + lock column (mock planning / reporting). */
  const showTaskActionsColumn =
    mockEnabled &&
    (viewMode === 'planning' ? !plan.isReported : viewMode === 'reporting');

  const mockPendingTasks = useMemo(
    () => mockStatusFilteredTasks.filter((t) => !!t.isPendingApproval),
    [mockStatusFilteredTasks],
  );

  const managerApprovalMenuItems: MenuProps['items'] = useMemo(() => {
    const planOpen = plan.status?.label === 'Open';
    const items: NonNullable<MenuProps['items']> = [];

    const lockPending = () => {
      if (!mockEnabled || !plan.ownerUserId) {
        onApprove?.();
        return;
      }
      const pending =
        viewMode === 'reporting' ? mockPendingReportTasks : mockPendingTasks;
      setLockTarget({
        taskIds: pending.map((t) => t.id),
        titles: pending.map((t) => t.title),
        mergePending: true,
      });
    };

    const lockAllTasks = () => {
      if (!mockEnabled || !plan.ownerUserId) {
        onApprove?.();
        return;
      }
      const pool =
        viewMode === 'reporting'
          ? [...mockPendingReportTasks, ...mockReportedTasks]
          : [...mockActiveTasks, ...mockReportedTasks];
      const toLock = pool.filter((t) => !t.isLocked);
      if (toLock.length === 0) {
        message.info('All tasks are already locked.');
        return;
      }
      setLockTarget({
        taskIds: toLock.map((t) => t.id),
        titles: toLock.map((t) => t.title),
        mergePending: toLock.some((t) => !!t.isPendingApproval),
      });
    };

    if (planOpen) {
      items.push({
        key: 'lock-plan',
        icon: <LockOutlined />,
        label: (
          <Tooltip
            title={
              isApprovalLoading
                ? 'Processing…'
                : "Lock plan. Once locked, the owner can't edit"
            }
          >
            Lock plan
          </Tooltip>
        ),
        onClick: () => {
          if (mockEnabled) {
            onApprove?.();
            return;
          }
          setLiveLockComment('');
          setLiveLockConfirm({ mode: 'lock' });
        },
        className: 'text-green-500',
      });
      items.push({
        key: 'lock-all',
        icon: <LockOutlined />,
        label: (
          <Tooltip title="Lock every unlocked task on this plan">
            Lock all tasks
          </Tooltip>
        ),
        onClick: lockAllTasks,
        className: 'text-green-500',
      });
      if (hasPendingForManagerMenu) {
        items.push({
          key: 'lock-pending',
          icon: <LockOutlined />,
          label: (
            <Tooltip
              title={
                isApprovalLoading
                  ? 'Processing…'
                  : 'Lock pending tasks and merge them into the closed plan'
              }
            >
              Lock pending
            </Tooltip>
          ),
          onClick: lockPending,
          className: 'text-green-500',
        });
      }
    } else {
      items.push({
        key: 'unlock-plan',
        icon: <UnlockOutlined />,
        label: <Tooltip title="Unlock plan">Unlock plan</Tooltip>,
        onClick: () => {
          if (mockEnabled) {
            onOpen?.();
            return;
          }
          setLiveLockComment('');
          setLiveLockConfirm({ mode: 'unlock' });
        },
        className: 'text-red-400',
      });
    }

    return items;
  }, [
    plan.status?.label,
    hasPendingForManagerMenu,
    isApprovalLoading,
    mockEnabled,
    plan.ownerUserId,
    viewMode,
    mockPendingReportTasks,
    mockPendingTasks,
    mockActiveTasks,
    mockReportedTasks,
    onApprove,
    onOpen,
  ]);

  const mockLockedTasks = useMemo(
    () =>
      isReportedStatusFilter
        ? []
        : mockStatusFilteredTasks.filter(
            (t) =>
              !t.isPendingApproval && (!!t.isLocked || !!t.assignedByUserId),
          ),
    [mockStatusFilteredTasks, isReportedStatusFilter],
  );
  const mockConfirmedForTree = useMemo(() => {
    if (!mockEnabled) return [] as MockPlanTask[];
    const treeSource = isReportedStatusFilter
      ? mockStatusFilteredTasks.filter((t) => !t.isPendingApproval)
      : mockStatusFilteredTasks.filter(
          (t) => !t.isPendingApproval && !t.isLocked && !t.assignedByUserId,
        );
    const matchIds = new Set(confirmedTasks.map((t: any) => t.id));

    // Today: flat matching tasks only (no ancestor accordion nesting).
    if (durationKind === 'daily') {
      return treeSource.filter(
        (t) => !t.isPendingApproval && matchIds.has(t.id),
      );
    }

    // Week → only direct daily children; Month → only direct weekly children.
    // Do not pull ancestors (keeps weeks as roots on week filter).
    const expectedChildKind: DeadlineKind =
      durationKind === 'week' ? 'daily' : 'week';
    const include = new Set<string>(matchIds);

    for (const id of matchIds) {
      for (const t of treeSource) {
        if (
          t.parentId === id &&
          !t.isPendingApproval &&
          t.kind === expectedChildKind
        ) {
          include.add(t.id);
        }
      }
    }

    return treeSource.filter((t) => !t.isPendingApproval && include.has(t.id));
  }, [
    mockEnabled,
    mockStatusFilteredTasks,
    isReportedStatusFilter,
    confirmedTasks,
    durationKind,
  ]);

  const mockLockedSectionForTree = useMemo(() => {
    if (!mockEnabled) return [] as MockPlanTask[];
    const sources = isClosedPlan
      ? [...mockConfirmedForTree, ...mockLockedTasks]
      : [...mockLockedTasks];
    const idSet = new Set<string>();
    const merged: MockPlanTask[] = [];
    for (const task of sources) {
      if (idSet.has(task.id)) continue;
      idSet.add(task.id);
      merged.push(task);
    }
    return merged;
  }, [mockEnabled, isClosedPlan, mockConfirmedForTree, mockLockedTasks]);

  const historySourceTasks = useMemo(() => {
    if (mockEnabled) return mockReportedTasks;
    // Live path: treat completed/failed tasks as history candidates.
    return allConfirmedTasks.filter((t: any) => {
      const s = String(t.status ?? '')
        .trim()
        .toLowerCase();
      return (
        s === 'completed' ||
        s === 'done' ||
        s === 'failed' ||
        t.isAchieved === true ||
        t.isAchieved === false
      );
    });
  }, [mockEnabled, mockReportedTasks, allConfirmedTasks]);

  const historyFilteredTasks = useMemo(() => {
    if (mockEnabled) {
      return filterMockHistoryTasks(
        historySourceTasks as MockPlanTask[],
        historyRange.from,
        historyRange.to,
      ).map(mapMockTaskToPlanningTask);
    }
    return (historySourceTasks as any[]).filter((task) =>
      taskInHistoryRange(task, historyRange.from, historyRange.to),
    );
  }, [
    mockEnabled,
    historySourceTasks,
    historyRange.from,
    historyRange.to,
    mapMockTaskToPlanningTask,
  ]);

  const historyTotal = historyFilteredTasks.length;
  const historyPageCount = Math.max(
    1,
    Math.ceil(historyTotal / HISTORY_PAGE_SIZE),
  );
  const historyPageSafe = Math.min(historyPage, historyPageCount);
  const historyPageTasks = useMemo(() => {
    const start = (historyPageSafe - 1) * HISTORY_PAGE_SIZE;
    return historyFilteredTasks.slice(start, start + HISTORY_PAGE_SIZE);
  }, [historyFilteredTasks, historyPageSafe]);

  const mockTasksById = useMemo(() => {
    const map = new Map<string, MockPlanTask>();
    for (const task of [...mockActiveTasks, ...mockReportedTasks]) {
      map.set(task.id, task);
    }
    return map;
  }, [mockActiveTasks, mockReportedTasks]);

  const resolvePlanPersonName = useCallback(
    (personId: string) =>
      mockDisplayNameForUserId(String(personId), String(viewerUserId ?? '')),
    [viewerUserId],
  );

  const lockedTableTasks = useMemo(
    () =>
      mockEnabled
        ? mockLockedSectionForTree.map((task) =>
            mapMockTaskToPlanningTask(task),
          )
        : lockedSectionTasks,
    [
      mockEnabled,
      mockLockedSectionForTree,
      lockedSectionTasks,
      mapMockTaskToPlanningTask,
    ],
  );

  const confirmedTableTasks = useMemo(
    () =>
      mockEnabled
        ? mockConfirmedForTree.map((task) => mapMockTaskToPlanningTask(task))
        : flatTasks,
    [mockEnabled, mockConfirmedForTree, flatTasks, mapMockTaskToPlanningTask],
  );

  const pendingTableTasks = useMemo(
    () =>
      mockEnabled
        ? mockPendingTasks.map((task) => mapMockTaskToPlanningTask(task))
        : pendingTasks,
    [mockEnabled, mockPendingTasks, pendingTasks, mapMockTaskToPlanningTask],
  );

  const mergedTableTasks = useMemo(() => {
    const merged: Record<string, unknown>[] = [];
    const seen = new Set<string>();
    const push = (task: Record<string, unknown>) => {
      const id = String(task.id ?? '');
      if (!id || seen.has(id)) return;
      seen.add(id);
      merged.push(task);
    };
    lockedTableTasks.forEach((task) => push(task as Record<string, unknown>));
    confirmedTableTasks.forEach((task) =>
      push(task as Record<string, unknown>),
    );
    pendingTableTasks.forEach((task) => push(task as Record<string, unknown>));
    return merged;
  }, [lockedTableTasks, confirmedTableTasks, pendingTableTasks]);

  const renderTaskCheckboxCell = useCallback(
    (task: Record<string, unknown>) => {
      const taskId = String(task.id ?? '');
      const effectiveStatus = optimisticStatuses[taskId] ?? task.status;
      const isChecked = effectiveStatus === 'pre_achieved';
      const isCompleted = effectiveStatus === 'completed';
      const isLoading = loadingTasks.has(taskId);
      const isLocked = !!task.isLocked;
      const taskLockedReadOnly = mockEnabled && isLocked;
      const rowReadOnly = isPlanReadOnly || taskLockedReadOnly;

      if (isTeammatePlan) {
        return (
          <span
            data-cy={`plan-card-task-checkbox-readonly-${taskId}`}
            className={`relative flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border-[1.5px] ${
              isCompleted
                ? 'border-[#D1D5DB] bg-[#F3F4F6]'
                : isChecked
                  ? 'border-[#52c41a] bg-[#52c41a] shadow-[0_0_0_2px_rgba(82,196,26,0.15)]'
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
                data-cy={`plan-card-task-checkbox-dot-${taskId}`}
                className="inline-block h-1.5 w-1.5 rounded-full bg-current"
              />
            )}
          </span>
        );
      }

      return (
        <button
          type="button"
          data-cy={`plan-card-task-checkbox-${taskId}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!rowReadOnly && !isCompleted && !isLoading) {
              handleTaskToggle(taskId, String(effectiveStatus ?? ''));
            }
          }}
          disabled={rowReadOnly || isCompleted || isLoading}
          aria-label={
            isChecked ? 'Mark task not achieved' : 'Mark task achieved'
          }
          className={`relative flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-all duration-200 ${
            rowReadOnly || isCompleted
              ? 'border-[#D1D5DB] bg-[#F3F4F6] cursor-not-allowed'
              : isChecked
                ? 'border-[#52c41a] bg-[#52c41a] shadow-[0_0_0_2px_rgba(82,196,26,0.15)]'
                : 'border-[#D1D5DB] bg-white hover:border-[#52c41a]/45 cursor-pointer'
          }`}
        >
          {isLoading ? (
            <LuLoader className="h-3 w-3 animate-spin text-[#52c41a]" />
          ) : isChecked || isCompleted ? (
            <CheckOutlined
              className={`text-[10px] ${isCompleted ? 'text-[#B0B3C0]' : 'text-white'}`}
            />
          ) : null}
        </button>
      );
    },
    [
      optimisticStatuses,
      loadingTasks,
      mockEnabled,
      isPlanReadOnly,
      isTeammatePlan,
      handleTaskToggle,
    ],
  );

  const renderTaskActionsCell = useCallback(
    (task: Record<string, unknown>) => {
      const taskId = String(task.id ?? '');
      const isLocked = !!task.isLocked;
      const commentCount = Number(task.commentCount || 0);
      const taskName = String(
        task.taskName ??
          task.task ??
          task.title ??
          task.name ??
          'Untitled Task',
      );

      if (!showTaskActionsColumn) {
        return null;
      }

      const resolveMockTask = () =>
        mockActiveTasks.find((t) => t.id === taskId) ??
        mockReportedTasks.find((t) => t.id === taskId) ??
        mockPendingTasks.find((t) => t.id === taskId) ??
        null;

      const isPending = !!task.isPendingApproval;

      return (
        <div
          data-cy={`plan-card-task-actions-${taskId}`}
          className="flex items-center justify-end gap-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip
            title={commentCount > 0 ? `${commentCount} comments` : 'Comments'}
          >
            <button
              type="button"
              data-cy={`plan-card-task-comments-btn-${taskId}`}
              className="inline-flex h-[18px] items-center gap-0.5 rounded px-1 text-[#8F94A3] hover:bg-[#F1F2F6] hover:text-[#574CFF]"
              onClick={() => {
                const full = resolveMockTask();
                if (full) setCommentsTask(full);
              }}
              aria-label="Task comments"
            >
              <MessageOutlined className="text-[11px]" />
              {commentCount > 0 ? (
                <span
                  data-cy={`plan-card-task-comments-count-${taskId}`}
                  className="text-[10px] font-bold tabular-nums"
                >
                  {commentCount}
                </span>
              ) : null}
            </button>
          </Tooltip>
          {canApprove && isPending ? (
            isLocked ? (
              <Tooltip title="Unlock task">
                <button
                  type="button"
                  data-cy={`plan-card-task-unlock-btn-${taskId}`}
                  className="inline-flex h-[18px] w-[18px] items-center justify-center rounded text-[#059669] hover:bg-[#ECFDF5]"
                  onClick={() => {
                    if (!plan.ownerUserId) return;
                    unlockMockTask(plan.ownerUserId, taskId);
                    message.success('Task unlocked.');
                  }}
                  aria-label="Unlock task"
                >
                  <UnlockOutlined className="text-[11px]" />
                </button>
              </Tooltip>
            ) : (
              <Tooltip title="Lock task">
                <button
                  type="button"
                  data-cy={`plan-card-task-lock-btn-${taskId}`}
                  className="inline-flex h-[18px] w-[18px] items-center justify-center rounded text-[#574CFF] hover:bg-[#EEF2FF]"
                  onClick={() => {
                    setLockTarget({
                      taskIds: [taskId],
                      titles: [taskName],
                      mergePending: false,
                    });
                  }}
                  aria-label="Lock task"
                >
                  <LockOutlined className="text-[11px]" />
                </button>
              </Tooltip>
            )
          ) : null}
        </div>
      );
    },
    [
      showTaskActionsColumn,
      canApprove,
      mockActiveTasks,
      mockReportedTasks,
      mockPendingTasks,
      plan.ownerUserId,
      unlockMockTask,
    ],
  );

  useEffect(() => {
    setHistoryPage(1);
  }, [planningDurationFilter, historyRange.from, historyRange.to, plan.id]);

  const cardSurfaceClass = classNames(
    'group/card min-w-0 max-w-full overflow-hidden rounded-xl border bg-white transition-all duration-200',
    displayMode !== 'full' && isTeammatePlan
      ? 'border-[#F3F4F6] hover:border-[#E5E7EB] hover:shadow-none'
      : 'border-[#F1F2F6] hover:border-[#D6D3FF] hover:shadow-[0_4px_20px_rgba(87,76,255,0.06)]',
  );

  const renderPlanningOwnerHeader = () => {
    if (viewMode === 'reporting') {
      const reportTitle = plan.owner?.name || plan.summary || 'Report';
      if (displayMode === 'full') {
        return (
          <UserInfo
            owner={plan.owner}
            notificationCount={plan.notificationCount}
          />
        );
      }
      const role =
        displayMode === 'team' ? planCardAssigneeRole(plan.owner?.role) : null;
      return (
        <div
          data-cy={`plan-card-assignee-label-${plan.id}`}
          className="min-w-0 flex-1"
        >
          <p
            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-p-968"
            className="m-0 min-w-0 truncate text-[15px] font-bold leading-snug tracking-tight text-[#161A2C] sm:text-[16px]"
          >
            {reportTitle}
          </p>
          {role ? (
            <p
              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-p-972"
              className="mb-0 mt-0.5 min-w-0 truncate text-[12px] font-medium leading-snug text-[#8F94A3] sm:text-[13px]"
            >
              {role}
            </p>
          ) : null}
        </div>
      );
    }
    if (displayMode === 'full') {
      return (
        <UserInfo
          owner={plan.owner}
          notificationCount={plan.notificationCount}
        />
      );
    }
    if (displayMode === 'team') {
      const role = planCardAssigneeRole(plan.owner?.role);
      return (
        <div
          data-cy={`plan-card-assignee-label-${plan.id}`}
          className="min-w-0 flex-1"
        >
          <p
            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-p-994"
            className="m-0 min-w-0 truncate text-[15px] font-bold leading-snug tracking-tight text-[#161A2C] sm:text-[16px]"
          >
            {planCardAssigneeLabel(plan.owner?.name)}
          </p>
          {role ? (
            <p
              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-p-998"
              className="mb-0 mt-0.5 min-w-0 truncate text-[12px] font-medium leading-snug text-[#8F94A3] sm:text-[13px]"
            >
              {role}
            </p>
          ) : null}
        </div>
      );
    }
    return (
      <div
        data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-1005"
        className="min-w-0 flex-1"
        aria-hidden
      />
    );
  };

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
    const reportPendingTasks = reportTasks.filter(
      (t: any) => !!t.isPendingApproval,
    );
    const reportConfirmedTasks = reportTasks.filter(
      (t: any) => !t.isPendingApproval,
    );
    const showReportClosedSection =
      reportConfirmedTasks.length > 0 && plan.status?.label === 'Closed';
    const showReportPendingSection = reportPendingTasks.length > 0;
    const showReportPendingActionsColumn =
      mockEnabled && showReportPendingSection && canApprove;

    const resolveMockReportTask = (task: any): MockPlanTask | null => {
      const planTaskId = String(task.planTaskId ?? task.planTask?.id ?? '');
      return (
        mockPendingReportTasks.find((t) => t.id === planTaskId) ??
        mockActiveTasks.find((t) => t.id === planTaskId) ??
        null
      );
    };

    const renderReportTaskRow = (task: any, showActions = false) => {
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
      const isPending = !!taskAny.isPendingApproval;
      const isCompleted =
        task.status === 'completed' || task.isAchieved === true;
      const isFailed =
        !isPending && (task.status === 'failed' || task.isAchieved === false);
      const failReason =
        isPending || isFailed
          ? ''
          : String(
              (task as PlanTask).customReason || taskAny.customReason || '',
            ).trim();
      const krMeta = resolveTaskKeyResultMeta(task, plan);
      const mockTask = resolveMockReportTask(task);
      const isLocked = !!taskAny.isLocked || !!mockTask?.isLocked;
      const lockComment = String(
        taskAny.lockComment || mockTask?.lockComment || '',
      ).trim();
      const commentCount = Number(
        taskAny.commentCount ?? mockTask?.comments?.length ?? 0,
      );
      const planTaskId = String(
        task.planTaskId ?? task.planTask?.id ?? task.id,
      );

      return (
        <div
          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-652"
          key={task.id}
          className="w-full min-w-0"
        >
          <div
            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-620"
            className={`group/row flex w-full min-w-0 items-start gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-150 ${
              isPending
                ? pendingTaskRowClass
                : isCompleted
                  ? 'bg-[#F0FDF4]/50'
                  : isFailed
                    ? 'bg-[#FEF2F2]/40'
                    : 'hover:bg-[#FAFBFC]'
            } ${isFailed && failReason ? 'cursor-help' : ''}`}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
              if (krMeta) onHoverKR?.(krMeta.id);
              if (isFailed && failReason) {
                const { left, top } = clampFailReasonPanelPosition(
                  e.clientX,
                  e.clientY,
                );
                setFailReasonCursorPanel({ left, top, text: failReason });
              }
            }}
            onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
              if (isFailed && failReason) {
                const { left, top } = clampFailReasonPanelPosition(
                  e.clientX,
                  e.clientY,
                );
                setFailReasonCursorPanel({ left, top, text: failReason });
              }
            }}
            onMouseLeave={() => {
              if (krMeta) onHoverKR?.(null);
              if (isFailed && failReason) setFailReasonCursorPanel(null);
            }}
          >
            <div
              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-567"
              className="mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center"
            >
              {isPending ? (
                <span
                  data-cy="plan-card-report-task-pending-dot"
                  className="inline-block h-2 w-2 rounded-full bg-[#F59E0B]"
                />
              ) : isCompleted ? (
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
            <div
              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-1381"
              className="min-w-0 flex-1"
            >
              <p
                data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-p-672"
                className={`min-w-0 break-words text-[14px] leading-snug line-clamp-2 transition-all duration-200 ${
                  isPending
                    ? 'text-[#2D2F45]'
                    : isCompleted
                      ? 'line-through text-[#B0B3C0]'
                      : isFailed
                        ? 'text-[#DC2626]'
                        : 'text-[#2D2F45]'
                }`}
                title={isFailed && failReason ? undefined : taskName}
              >
                {taskName}
              </p>
              {krMeta ? (
                <span
                  data-cy={`plan-card-report-task-kr-${task.id}`}
                  className="mt-0.5 flex max-w-full items-center gap-1 text-[11px] font-medium leading-snug text-[#94A3B8] transition-colors group-hover/row:text-[#64748B]"
                  title={krMeta.title}
                >
                  <BsKey
                    size={10}
                    className="shrink-0 text-[#94A3B8] group-hover/row:text-[#1E40AF]/70"
                    aria-hidden
                  />
                  <span
                    data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-1406"
                    className="min-w-0 truncate"
                  >
                    {krMeta.title}
                  </span>
                </span>
              ) : null}
              {renderTaskDelegationLabel(
                String(task.id),
                taskAny.assignedByUserId ?? mockTask?.assignedByUserId,
                viewerUserId,
              )}
            </div>
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
                className={classNames(meta.tgtPlan, 'text-right')}
              >
                <span
                  data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-605"
                  className="text-[12px] font-semibold text-[#8F94A3] tabular-nums sm:text-[13px]"
                >
                  {taskTargetDisplay(task)}
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
              {showActions && canApprove && !isLocked ? (
                <div
                  className={classNames(
                    meta.actions,
                    'flex items-center justify-end gap-0.5',
                  )}
                  data-cy={`plan-card-report-task-actions-${task.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {canApprove ? (
                    <Tooltip
                      title={
                        commentCount > 0
                          ? `${commentCount} comments`
                          : 'Comments'
                      }
                    >
                      <button
                        type="button"
                        data-cy={`plan-card-report-task-comments-${task.id}`}
                        className="inline-flex h-[18px] items-center gap-0.5 rounded px-1 text-[#8F94A3] hover:bg-[#F1F2F6] hover:text-[#574CFF]"
                        onClick={(e) => {
                          e.stopPropagation();
                          const full = resolveMockReportTask(task);
                          if (full) setCommentsTask(full);
                        }}
                        aria-label="Task comments"
                      >
                        <MessageOutlined className="text-[11px]" />
                        {commentCount > 0 ? (
                          <span
                            data-cy={`plan-card-report-task-comment-count-${task.id}`}
                            className="text-[10px] font-bold tabular-nums"
                          >
                            {commentCount}
                          </span>
                        ) : null}
                      </button>
                    </Tooltip>
                  ) : null}
                  {canApprove ? (
                    <Tooltip title="Lock task">
                      <button
                        type="button"
                        data-cy={`plan-card-report-task-lock-${task.id}`}
                        className="inline-flex h-[18px] w-[18px] items-center justify-center rounded text-[#574CFF] hover:bg-[#EEF2FF]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLockTarget({
                            taskIds: [planTaskId],
                            titles: [taskName],
                            mergePending: true,
                          });
                        }}
                        aria-label="Lock report task"
                      >
                        <LockOutlined className="text-[11px]" />
                      </button>
                    </Tooltip>
                  ) : null}
                </div>
              ) : isLocked ? (
                <div
                  data-cy={`plan-card-report-task-locked-actions-${task.id}`}
                  className={classNames(meta.actions, 'flex justify-end')}
                >
                  <Tooltip
                    title={
                      lockComment
                        ? `Locked: ${lockComment}`
                        : 'Locked by manager'
                    }
                  >
                    <span
                      data-cy={`plan-card-report-task-locked-${task.id}`}
                      className="inline-flex h-[18px] w-[18px] items-center justify-center rounded text-[#64748B]"
                    >
                      <LockOutlined className="text-[11px]" />
                    </span>
                  </Tooltip>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      );
    };

    return (
      <article
        data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-article-160"
        className={cardSurfaceClass}
        data-active-cadence={activeCadence}
        data-display-mode={displayMode}
      >
        {/* Header — same chrome as Active Plans (compact / team / full) */}
        <div
          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-375"
          className={classNames(
            'px-4 md:px-5',
            displayMode === 'compact' ? 'pt-2.5 pb-2' : 'pt-3.5 pb-3',
          )}
        >
          <div
            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-376"
            className="flex items-center justify-between gap-2"
          >
            <div
              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-377"
              className="flex min-w-0 flex-1 items-center gap-3"
            >
              {renderPlanningOwnerHeader()}
            </div>

            <div
              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-384"
              className="flex flex-shrink-0 items-center gap-1.5"
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
              {plan.status && displayMode === 'compact' ? (
                <StatusBadge status={plan.status} />
              ) : null}
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
              {canApprove ? (
                <Dropdown
                  menu={{ items: managerApprovalMenuItems }}
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
                    aria-label="Plan manager actions"
                  />
                </Dropdown>
              ) : null}
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
                    className={
                      viewMode === 'reporting'
                        ? 'text-[13px] font-normal text-[#8F94A3]'
                        : 'text-[13px] font-medium text-[#8F94A3]'
                    }
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
                    className={classNames(meta.tgtPlan, metaHead)}
                  >
                    <span
                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-1256"
                      className="sm:hidden"
                    >
                      Tgt
                    </span>
                    <span
                      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-1257"
                      className="hidden sm:inline"
                    >
                      Target
                    </span>
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
                  {showReportPendingActionsColumn ? (
                    <div
                      data-cy="plan-card-report-col-actions"
                      className={classNames(meta.actions, metaHead)}
                      aria-hidden
                    />
                  ) : null}
                </div>
              </div>
            )}
            <div
              data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-491"
              className="space-y-3"
            >
              {showReportClosedSection ? (
                <div
                  className="space-y-[2px] rounded-lg bg-[#F8FAFC] px-1 py-1.5"
                  data-cy={`plan-card-report-closed-section-${plan.id}`}
                >
                  <div
                    className="flex items-center gap-2 px-2.5 pb-1 pt-1"
                    data-cy={`plan-card-report-closed-section-header-${plan.id}`}
                  >
                    <StatusBadge
                      status={
                        plan.status ?? {
                          label: 'Closed',
                          updatedAt: '',
                          tone: 'success',
                        }
                      }
                    />
                  </div>
                  {reportConfirmedTasks.map((task) =>
                    renderReportTaskRow(task, false),
                  )}
                </div>
              ) : (
                reportConfirmedTasks.map((task) =>
                  renderReportTaskRow(task, false),
                )
              )}

              {showReportPendingSection ? (
                <div
                  className="space-y-[2px]"
                  data-cy={`plan-card-report-pending-section-${plan.id}`}
                >
                  <div
                    className="flex items-center justify-between gap-2 px-2.5 pb-1 pt-1"
                    data-cy={`plan-card-report-pending-section-header-${plan.id}`}
                  >
                    <StatusBadge
                      status={{
                        label: 'Open',
                        updatedAt: '',
                        tone: 'warning',
                      }}
                    />
                  </div>
                  {reportPendingTasks.map((task) =>
                    renderReportTaskRow(task, true),
                  )}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

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

        <LockTasksModal
          open={!!lockTarget}
          taskCount={lockTarget?.taskIds.length ?? 0}
          taskTitles={lockTarget?.titles}
          confirming={lockSubmitting}
          onClose={() => setLockTarget(null)}
          onConfirm={(comment) => {
            if (!lockTarget || !plan.ownerUserId) return;
            setLockSubmitting(true);
            if (mockEnabled) {
              const { validatedCount } = validatePendingReportTasks(
                plan.ownerUserId,
                lockTarget.taskIds,
                comment,
              );
              setLockSubmitting(false);
              setLockTarget(null);
              if (validatedCount > 0) {
                message.success(
                  validatedCount === 1
                    ? 'Report task locked.'
                    : `${validatedCount} report tasks locked.`,
                );
              }
              return;
            }
            setLockSubmitting(false);
            setLockTarget(null);
          }}
        />

        <TaskCommentsModal
          open={!!commentsTask}
          ownerUserId={plan.ownerUserId ?? ''}
          task={commentsTask}
          canComment={canApprove}
          onClose={() => setCommentsTask(null)}
        />
      </article>
    );
  }

  return (
    <article
      data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-article-160"
      className={cardSurfaceClass}
      data-active-cadence={activeCadence}
      data-display-mode={displayMode}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div
        data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-728"
        className={classNames(
          'px-4 md:px-5',
          displayMode === 'compact' ? 'pt-2.5 pb-2' : 'pt-3.5 pb-3',
        )}
      >
        <div
          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-729"
          className="flex items-center justify-between gap-2"
        >
          <div
            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-730"
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            {renderPlanningOwnerHeader()}
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
            {!inlineReportActive && showAddPlan && onAddPlan ? (
              <CustomButton
                title="Add Plan"
                id={`plan-card-${plan.id}-add-plan`}
                size="small"
                textClassName="text-[11px] font-semibold leading-tight sm:text-xs"
                style={{ paddingInline: 10 }}
                onClick={() => {
                  setAddComposerExpanded(true);
                  onAddPlan?.();
                }}
                className="!h-7 !min-h-7 !w-auto !min-w-0 !shrink-0 !rounded-md !px-2.5 !py-0 !bg-[#1E40AF] !text-white hover:!bg-[#1E3A8A]"
              />
            ) : null}
            {!inlineReportActive &&
            (showMockReportButton || (showSubmitReport && onSubmitReport)) ? (
              <CustomButton
                title={
                  showMockReportButton
                    ? `Report (${mockCheckedTasks.length})`
                    : 'Report'
                }
                id={`plan-card-${plan.id}-submit-report`}
                size="small"
                textClassName="text-[11px] font-semibold leading-tight sm:text-xs"
                style={{ paddingInline: 10 }}
                onClick={
                  showMockReportButton
                    ? handleMockReportSelected
                    : onSubmitReport
                }
                className="!h-7 !min-h-7 !w-auto !min-w-0 !shrink-0 !rounded-md !px-2.5 !py-0 !border !border-[#1E40AF] !bg-white !text-[#1E40AF] hover:!bg-[#EFF6FF]"
              />
            ) : null}
            {plan.status &&
            (viewMode !== 'planning' || displayMode === 'compact') ? (
              <StatusBadge status={plan.status} />
            ) : null}
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
            {canApprove ? (
              <Dropdown
                menu={{ items: managerApprovalMenuItems }}
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
                  aria-label="Plan manager actions"
                />
              </Dropdown>
            ) : null}
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
        {!inlineReportActive &&
        !isHistoryMode &&
        visibleTaskCount === 0 &&
        !addPlanComposer ? (
          <p
            data-cy={`plan-card-empty-duration-${plan.id}`}
            className="px-2 py-4 text-center text-[13px] text-[#8F94A3]"
          >
            No tasks for this period
          </p>
        ) : null}
        {!inlineReportActive && isHistoryMode ? (
          <div
            className="space-y-2"
            data-cy={`plan-card-history-section-${plan.id}`}
          >
            <PlanCardTasksTable
              tasks={historyPageTasks as Record<string, unknown>[]}
              plan={plan}
              durationKind={durationKind}
              resolveUserName={resolvePlanPersonName}
              mockTasksById={mockEnabled ? mockTasksById : undefined}
              allActiveTasks={
                plan.isReported ? mockReportedTasks : mockActiveTasks
              }
              viewerUserId={String(viewerUserId ?? '')}
              emptyText="No history in this range"
              data-cy={`plan-card-history-table-${plan.id}`}
            />
            {historyTotal > HISTORY_PAGE_SIZE ? (
              <div
                className="flex justify-end"
                data-cy={`plan-card-history-pagination-${plan.id}`}
              >
                <Pagination
                  size="small"
                  current={historyPageSafe}
                  pageSize={HISTORY_PAGE_SIZE}
                  total={historyTotal}
                  onChange={setHistoryPage}
                  showSizeChanger={false}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {!inlineReportActive && !isHistoryMode && visibleTaskCount > 0 ? (
          <div data-cy={`plan-card-tasks-section-${plan.id}`}>
            <PlanCardTasksTable
              tasks={mergedTableTasks}
              plan={plan}
              durationKind={durationKind}
              resolveUserName={resolvePlanPersonName}
              mockTasksById={mockEnabled ? mockTasksById : undefined}
              allActiveTasks={
                plan.isReported ? mockReportedTasks : mockActiveTasks
              }
              isTeammatePlan={isTeammatePlan}
              canAddSubtasks={canAddMockSubtasks}
              hideInteractiveMarkers={!!plan.isReported}
              viewerUserId={String(viewerUserId ?? '')}
              showCheckboxColumn={!plan.isReported}
              showActionsColumn={showTaskActionsColumn}
              renderCheckboxCell={renderTaskCheckboxCell}
              renderActionsCell={renderTaskActionsCell}
              data-cy={`plan-card-tasks-table-${plan.id}`}
            />
          </div>
        ) : null}

        {!isHistoryMode && addPlanComposer ? (
          <Collapse
            bordered={false}
            activeKey={addComposerExpanded ? ['add-plan-composer'] : []}
            onChange={(keys) =>
              setAddComposerExpanded(
                Array.isArray(keys) && keys.includes('add-plan-composer'),
              )
            }
            className="mt-3 !bg-transparent [&_.ant-collapse-item]:!border-[#F1F2F6] [&_.ant-collapse-header]:!px-0 [&_.ant-collapse-content-box]:!px-0"
            data-cy={`plan-card-add-composer-${plan.id}`}
          >
            <Collapse.Panel header="Add plan" key="add-plan-composer">
              {addPlanComposer}
            </Collapse.Panel>
          </Collapse>
        ) : null}
      </div>

      <LockTasksModal
        open={!!lockTarget}
        taskCount={lockTarget?.taskIds.length ?? 0}
        taskTitles={lockTarget?.titles}
        confirming={lockSubmitting}
        onClose={() => setLockTarget(null)}
        onConfirm={(comment) => {
          if (!lockTarget || !plan.ownerUserId) return;
          setLockSubmitting(true);
          const { lockedCount } = lockMockTasks(
            plan.ownerUserId,
            lockTarget.taskIds,
            comment,
          );
          if (lockTarget.mergePending) {
            onApprove?.();
          }
          setLockSubmitting(false);
          setLockTarget(null);
          if (lockedCount > 0) {
            message.success(
              lockedCount === 1
                ? 'Task locked.'
                : `${lockedCount} tasks locked.`,
            );
          }
        }}
      />

      <TaskCommentsModal
        open={!!commentsTask}
        ownerUserId={plan.ownerUserId ?? ''}
        task={commentsTask}
        canComment={canApprove}
        onClose={() => setCommentsTask(null)}
      />

      <Modal
        title={liveLockConfirm?.mode === 'unlock' ? 'Unlock plan' : 'Lock plan'}
        open={!!liveLockConfirm}
        onCancel={() => setLiveLockConfirm(null)}
        destroyOnClose
        centered
        data-cy="live-plan-lock-modal"
        footer={
          <div
            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-div-2331"
            className="flex justify-end gap-2"
          >
            <Button onClick={() => setLiveLockConfirm(null)}>Cancel</Button>
            <Button
              type="primary"
              loading={isApprovalLoading}
              data-cy="live-plan-lock-confirm"
              className="!border-[#574CFF] !bg-[#574CFF] hover:!bg-[#4639E8]"
              onClick={() => {
                if (liveLockConfirm?.mode === 'unlock') onOpen?.();
                else onApprove?.();
                setLiveLockConfirm(null);
                setLiveLockComment('');
              }}
            >
              {liveLockConfirm?.mode === 'unlock' ? 'Unlock' : 'Lock'}
            </Button>
          </div>
        }
      >
        <p
          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-p-2350"
          className="mb-3 text-[13px] text-[#575B7A]"
        >
          {liveLockConfirm?.mode === 'unlock'
            ? 'Unlock this plan so the owner can edit again.'
            : 'Lock this plan. The owner will not be able to edit until it is unlocked.'}
        </p>
        <label
          data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-label-2355"
          className="block"
        >
          <span
            data-cy="planning-and-reporting-components-cards-plancard-tsx-plancard-span-2356"
            className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.04em] text-[#8F94A3]"
          >
            Comment (optional)
          </span>
          <Input.TextArea
            rows={3}
            value={liveLockComment}
            onChange={(e) => setLiveLockComment(e.target.value)}
            placeholder="Add a note…"
            data-cy="live-plan-lock-comment"
          />
        </label>
      </Modal>
    </article>
  );
}
