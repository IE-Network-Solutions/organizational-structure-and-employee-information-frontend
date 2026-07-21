'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Avatar, Dropdown, Spin } from 'antd';
import type { MenuProps } from 'antd';
import { BsKey } from 'react-icons/bs';
import { MdExpandMore, MdChevronRight } from 'react-icons/md';
import { IoArrowBack } from 'react-icons/io5';
import { MessageOutlined, PlusOutlined } from '@ant-design/icons';
import PlanCard from '../cards/PlanCard';
import { PlanCardInlineReportForm } from '../createReport/PlanCardInlineReportForm';
import {
  isMilestoneAchievedForPlanning,
} from '@/utils/okrKeyResultProgressDisplay';
import {
  isRecentlyAchievedMilestone,
  isRecentlyReopenedKeyResult,
  isRecentlyReopenedMilestone,
  useRecentlyAchievedMilestones,
} from '@/utils/recentlyAchievedMilestones';
import type { PlanningTarget } from './buildPlanningTargets';
import {
  buildPickTargetsForKeyResult,
  isMilestoneBlockedForPlanning,
} from './buildPlanningTargets';
import CommentList from '../comments/commentList';
import type {
  PlanSummary,
  KeyResult,
  Cadence,
  PlanOwner,
  ViewMode,
} from '../types';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  aggregateKeyResultForPanel,
  buildBlockedKeyResultIdSet,
  enrichOwnerGroupsPlanningBlocked,
  mergeUserKeyResultsIntoOwnerGroups,
  type KRPanelOwnerGroup,
  type ParentPlanContext,
} from './mergeKRPanelGroups';

// ─── Helpers ────────────────────────────────────────────────────────────

function getAllKRTasks(kr: KeyResult): any[] {
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
  return tasks;
}

function formatNum(v: number | string | null | undefined): string {
  if (v == null) return '0';
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  if (isNaN(n)) return '0';
  return n.toString();
}

function progressColor(p: number): string {
  if (p >= 100) return '#10B981';
  if (p >= 60) return '#1E40AF';
  if (p > 0) return '#F59E0B';
  return '#D1D5DB';
}

function progressBg(p: number): string {
  if (p >= 100) return 'bg-[#D1FAE5]';
  if (p >= 60) return 'bg-[#DBEAFE]';
  if (p > 0) return 'bg-[#FEF3C7]';
  return 'bg-[#F3F4F6]';
}

function progressTextClass(p: number): string {
  if (p >= 100) return 'text-[#059669]';
  if (p >= 60) return 'text-[#1E40AF]';
  if (p > 0) return 'text-[#D97706]';
  return 'text-[#9CA3AF]';
}

/** KR metric name shown before task count (matches common API metricType.name values) */
function formatKrMetricTypeLabel(metricType: string): string {
  if (!metricType || metricType === 'N/A') return '';
  const n = metricType.trim();
  const map: Record<string, string> = {
    Achieve: 'Achieve',
    Milestone: 'Milestone',
    Percentage: 'Percent',
    Percent: 'Percent',
    Numeric: 'Numeric',
    Currency: 'Currency',
  };
  return map[n] ?? n;
}

/** + dropdown: single title line per planning slot */
function planningTargetMenuItemLabel(
  t: PlanningTarget,
  disabled = false,
): React.ReactNode {
  let title: string;
  if (t.isDailySlot) {
    const parts = [t.milestoneTitle, t.parentTaskTitle].filter(Boolean);
    title = parts.join(' · ') || 'Daily slot';
  } else if (t.milestoneId) {
    title = t.milestoneTitle || 'Untitled milestone';
  } else {
    title = t.keyResultTitle || 'Key result';
  }
  return (
    <div
      data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-100"
      className="max-w-[min(100vw-48px,380px)] py-0.5 pr-1"
    >
      <p
        data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-p-101"
        className={`text-[13px] font-semibold leading-snug line-clamp-3 ${
          disabled ? 'text-[#9CA3AF]' : 'text-[#161A2C]'
        }`}
      >
        {title}
        {disabled ? (
          <span
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-achieved-badge"
            className="ml-1.5 text-[11px] font-medium text-[#9CA3AF]"
          >
            (Achieved)
          </span>
        ) : null}
      </p>
    </div>
  );
}

// ─── Types ──────────────────────────────────────────────────────────────

interface AggregatedKR {
  id: string;
  title: string;
  progress: number;
  taskCount: number;
  metricType: string;
  targetValue: string | number;
  currentValue: string | number;
  progressLabel: string;
  isDeleted: boolean;
  planningBlocked: boolean;
  milestones?: Array<{
    id?: string | number;
    title?: string | null;
    name?: string | null;
    status?: string | null;
    deletedAt?: string | null;
    isAchieved?: boolean | null;
    progress?: number | string | null;
  }>;
}

/**
 * Prefer objective/API milestones for the pick modal (same as createPlanObjective).
 * Achieved milestones stay listed but marked completed/disabled.
 */
function resolvePlanningSlotsForKr(
  kr: AggregatedKR,
  slots: PlanningTarget[],
  userKeyResultItems: any[] = [],
  objectiveMilestonesByKrId?: Map<string, any[]>,
): PlanningTarget[] {
  const apiKr = userKeyResultItems.find(
    (k) => k && k.deletedAt == null && String(k.id) === String(kr.id),
  );
  const objectiveMilestones =
    objectiveMilestonesByKrId?.get(String(kr.id)) ?? [];
  const targets = buildPickTargetsForKeyResult({
    keyResultId: String(kr.id),
    keyResultTitle: kr.title,
    metricTypeName: kr.metricType,
    objectiveMilestones,
    panelMilestones: kr.milestones ?? [],
    apiKr,
    slots,
    userKeyResultItems,
    planningBlocked: kr.planningBlocked,
  });

  // Re-stamp disabled using the same sources createPlanObjective uses.
  // Hide-+ can succeed via planningBlocked/progress while isCompleted was still
  // false when status lived only on objective/panel rows.
  const krForBlock = {
    id: kr.id,
    metricType: { name: kr.metricType },
    progress: kr.progress,
    currentValue: kr.currentValue,
    targetValue: kr.targetValue,
    milestones:
      objectiveMilestones.length > 0
        ? objectiveMilestones
        : (kr.milestones ?? []),
  };
  const apiMilestones = apiKr?.milestones ?? apiKr?.Milestones ?? [];
  const reopenedKr = isRecentlyReopenedKeyResult(kr.id);

  return targets.map((t) => {
    if (!t.milestoneId) {
      return {
        ...t,
        isCompleted:
          !reopenedKr && (Boolean(t.isCompleted) || kr.planningBlocked),
      };
    }
    const id = String(t.milestoneId);
    const titleKey = String(t.milestoneTitle || '')
      .trim()
      .toLowerCase();
    const matchRow = (list: any[] | undefined | null) => {
      if (!Array.isArray(list)) return null;
      return (
        list.find((m) => m && String(m.id) === id) ??
        (titleKey
          ? list.find(
              (m) =>
                m &&
                String(m.title || m.name || '')
                  .trim()
                  .toLowerCase() === titleKey,
            )
          : null) ??
        null
      );
    };
    const ml = matchRow(objectiveMilestones) ??
      matchRow(kr.milestones) ??
      matchRow(apiMilestones) ?? {
        id: t.milestoneId,
        title: t.milestoneTitle,
        status: t.isCompleted ? 'Completed' : undefined,
      };
    const reopened = isRecentlyReopenedMilestone(t.milestoneId);

    const completed =
      !reopened &&
      (Boolean(t.isCompleted) ||
        isRecentlyAchievedMilestone(t.milestoneId) ||
        isMilestoneAchievedForPlanning(ml) ||
        isMilestoneBlockedForPlanning(krForBlock, ml, userKeyResultItems));

    return { ...t, isCompleted: completed };
  });
}

interface OwnerKRGroup {
  ownerKey: string;
  owner: PlanOwner;
  krs: AggregatedKR[];
  avgProgress: number;
}

export function buildOwnerKRGroups(
  plans: PlanSummary[],
  userKeyResultItems: any[] = [],
): OwnerKRGroup[] {
  const ownerMap = new Map<
    string,
    { owner: PlanOwner; seenKRs: Set<string>; krs: AggregatedKR[] }
  >();

  for (const plan of plans) {
    if (!plan.keyResults || plan.keyResults.length === 0) continue;
    const ownerKey = plan.owner?.name || plan.id;
    if (!ownerMap.has(ownerKey)) {
      ownerMap.set(ownerKey, {
        owner: plan.owner,
        seenKRs: new Set(),
        krs: [],
      });
    }
    const entry = ownerMap.get(ownerKey)!;

    for (const kr of plan.keyResults) {
      if (entry.seenKRs.has(kr.id)) continue;
      entry.seenKRs.add(kr.id);

      const allTasks = getAllKRTasks(kr);
      entry.krs.push(
        aggregateKeyResultForPanel(kr, allTasks.length, userKeyResultItems),
      );
    }
  }

  const groups: OwnerKRGroup[] = [];
  for (const [ownerKey, entry] of ownerMap) {
    if (entry.krs.length === 0) continue;
    const avg = Math.round(
      entry.krs.reduce((s, k) => s + k.progress, 0) / entry.krs.length,
    );
    groups.push({
      ownerKey,
      owner: entry.owner,
      krs: entry.krs,
      avgProgress: avg,
    });
  }
  return groups as KRPanelOwnerGroup[];
}

// ─── KR card ────────────────────────────────────────────────────────────

const inlinePickBtnClass =
  'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#1E40AF] shadow-sm transition-colors hover:border-[#D1D5DB] hover:bg-[#F8FAFC] hover:text-[#1E3A8A] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF]/30 focus-visible:ring-offset-1';

const inlinePickBtnSelectedRing =
  'ring-2 ring-[#1E40AF]/40 ring-offset-1 ring-offset-white';

/** Below lg: horizontal carousel; lg+: vertical stack */
const krCardListClass =
  'flex flex-row flex-nowrap items-start gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain py-1 pl-0.5 pr-3 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] touch-pan-x scrollbar-hide lg:flex-col lg:items-stretch lg:flex-nowrap lg:gap-2 lg:overflow-x-visible lg:overflow-y-visible lg:overscroll-auto lg:px-1 lg:py-1 lg:pr-1 lg:snap-none lg:touch-auto';

const krCardStripItemClass =
  'w-[min(72vw,240px)] shrink-0 snap-start sm:w-[min(68vw,260px)] md:w-[min(62vw,300px)] lg:w-full lg:max-w-none lg:shrink lg:snap-none';

function KRProgressCard({
  kr,
  isHighlighted,
  inlinePickEnabled = false,
  planningTargetsForKr = [],
  selectedPlanningTargetId = null,
  onPickPlanningTarget,
  objectiveMilestones = [],
  onRefreshMilestoneStatus,
}: {
  kr: AggregatedKR;
  isHighlighted: boolean;
  inlinePickEnabled?: boolean;
  planningTargetsForKr?: PlanningTarget[];
  selectedPlanningTargetId?: string | null;
  onPickPlanningTarget?: (t: PlanningTarget) => void;
  /** Objective OKR milestones (status source when panel shells omit Completed) */
  objectiveMilestones?: any[];
  /** Refetch OKR milestone Completed status when opening the + menu */
  onRefreshMilestoneStatus?: () => void;
}) {
  const color = progressColor(kr.progress);
  const pct = Math.min(kr.progress, 100);
  const ref = useRef<HTMLDivElement>(null);
  const { isMobile, isTablet } = useIsMobile();
  const pickMenuPlacement =
    isMobile || isTablet ? ('bottomCenter' as const) : ('bottomLeft' as const);
  const metricLabel = formatKrMetricTypeLabel(kr.metricType);

  // Re-render when a milestone is achieved in-session (report/OKR) so disable
  // applies immediately without a hard refresh.
  const recentlyAchievedIds = useRecentlyAchievedMilestones((s) => s.ids);
  const reopenedMilestoneIds = useRecentlyAchievedMilestones(
    (s) => s.reopenedMilestoneIds,
  );
  const reopenedKeyResultIds = useRecentlyAchievedMilestones(
    (s) => s.reopenedKeyResultIds,
  );
  const reopenedKr = reopenedKeyResultIds.has(String(kr.id));

  const showTaskCount = kr.taskCount > 0;

  const rowSelected =
    inlinePickEnabled &&
    planningTargetsForKr.some((t) => t.id === selectedPlanningTargetId);
  const showPickChrome = isHighlighted || rowSelected;

  // + only when something remains selectable. Fully achieved KRs (planningBlocked)
  // and all-completed milestone lists must hide it — including in-session achieves.
  const hasSelectableSlot = planningTargetsForKr.some((t) => {
    if (t.isCompleted) return false;
    if (
      t.milestoneId &&
      (reopenedMilestoneIds.has(String(t.milestoneId)) ||
        isRecentlyReopenedMilestone(t.milestoneId))
    ) {
      return true;
    }
    if (
      t.milestoneId &&
      (recentlyAchievedIds.has(String(t.milestoneId)) ||
        isRecentlyAchievedMilestone(t.milestoneId))
    ) {
      return false;
    }
    return true;
  });
  const showPickControl =
    inlinePickEnabled &&
    !!onPickPlanningTarget &&
    (!kr.planningBlocked || reopenedKr || isRecentlyReopenedKeyResult(kr.id)) &&
    hasSelectableSlot &&
    !kr.isDeleted;

  const isSlotDisabled = (t: PlanningTarget): boolean => {
    if (
      t.milestoneId &&
      (reopenedMilestoneIds.has(String(t.milestoneId)) ||
        isRecentlyReopenedMilestone(t.milestoneId))
    ) {
      return false;
    }
    if (t.isCompleted) return true;
    if (!t.milestoneId) return false;
    const id = String(t.milestoneId);
    if (recentlyAchievedIds.has(id) || isRecentlyAchievedMilestone(id)) {
      return true;
    }
    const titleKey = String(t.milestoneTitle || '')
      .trim()
      .toLowerCase();
    const match = (list: any[] | undefined) => {
      if (!Array.isArray(list)) return null;
      return (
        list.find((m) => m && String(m.id) === id) ??
        (titleKey
          ? list.find(
              (m) =>
                m &&
                String(m.title || m.name || '')
                  .trim()
                  .toLowerCase() === titleKey,
            )
          : null) ??
        null
      );
    };
    return (
      isMilestoneAchievedForPlanning(match(kr.milestones)) ||
      isMilestoneAchievedForPlanning(match(objectiveMilestones))
    );
  };

  const dropdownSlotItems: MenuProps['items'] = planningTargetsForKr.map(
    (t) => {
      const disabled = isSlotDisabled(t);
      return {
        key: t.id,
        disabled,
        className: `planning-target-pick-item !h-auto !py-2.5 !leading-normal${
          disabled ? ' planning-target-pick-item--achieved' : ''
        }`,
        label: planningTargetMenuItemLabel(t, disabled),
      };
    },
  );

  // Flat items (not type:group) so Ant Design reliably applies `disabled`.
  const dropdownMenuItems: MenuProps['items'] = [
    {
      key: 'planning-slots-heading',
      disabled: true,
      className: 'planning-target-pick-heading !cursor-default !opacity-100',
      label: (
        <span
          data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-pick-heading"
          className="text-[11px] font-bold uppercase tracking-[0.02em] text-[#64748b]"
        >
          Select milestone to plan
        </span>
      ),
    },
    ...(dropdownSlotItems ?? []),
  ];

  const pickButton =
    showPickControl && onPickPlanningTarget ? (
      <Dropdown
        menu={{
          items: dropdownMenuItems,
          onClick: ({ key, domEvent }) => {
            domEvent.stopPropagation();
            const t = planningTargetsForKr.find((x) => x.id === key);
            if (!t || isSlotDisabled(t)) return;
            onPickPlanningTarget(t);
          },
        }}
        trigger={['click']}
        placement={pickMenuPlacement}
        overlayClassName="planning-target-pick-menu"
        onOpenChange={(open) => {
          if (open) onRefreshMilestoneStatus?.();
        }}
      >
        <button
          data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-button-295"
          type="button"
          title="Choose a milestone or key result to plan against"
          className={`${inlinePickBtnClass} ${rowSelected ? inlinePickBtnSelectedRing : ''}`}
        >
          <PlusOutlined className="text-[13px]" />
        </button>
      </Dropdown>
    ) : null;

  useEffect(() => {
    if (showPickChrome && ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [showPickChrome]);

  return (
    <div
      data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-317"
      ref={ref}
      className={`flex h-auto min-h-0 flex-col rounded-xl border bg-white p-2.5 transition-all duration-200 sm:p-3 lg:h-full lg:min-h-0 ${
        showPickChrome
          ? 'border-[#1E40AF]/40 shadow-[0_0_0_2px_rgba(30,64,175,0.08),0_4px_16px_rgba(30,64,175,0.10)] lg:scale-[1.01]'
          : 'border-[#F1F2F6] hover:border-[#1E40AF]/15 hover:shadow-[0_2px_12px_rgba(30,64,175,0.05)]'
      }`}
    >
      <div
        data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-319"
        className="mb-2 flex items-start justify-between gap-2"
      >
        <p
          data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-p-320"
          className="line-clamp-2 min-w-0 flex-1 text-[12px] font-normal leading-snug text-[#161A2C] sm:text-[13px]"
        >
          {kr.title}
        </p>
        <span
          data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-335"
          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold sm:px-2 sm:text-[11px] ${progressBg(kr.progress)} ${progressTextClass(kr.progress)}`}
        >
          {formatNum(kr.progress)}%
        </span>
      </div>

      {kr.isDeleted && (
        <span
          data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-331"
          className="mb-2 inline-block rounded bg-[#FEE2E2] px-1.5 py-0.5 text-[9px] font-semibold text-[#991B1B] uppercase tracking-wider"
        >
          Deleted
        </span>
      )}

      <div
        data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-336"
        className="mb-0 lg:mb-2"
      >
        <div
          data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-337"
          className="h-[5px] w-full overflow-hidden rounded-full bg-[#F1F2F6]"
        >
          <div
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-359"
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>

      <div
        data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-345"
        className="mt-1.5 flex flex-row items-center justify-between gap-2 text-[10px] text-[#8F94A3] sm:text-[11px] lg:mt-auto"
      >
        <div
          data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-346"
          className="flex min-w-0 flex-1 flex-nowrap items-center gap-x-1.5 overflow-hidden sm:gap-x-2"
        >
          {metricLabel ? (
            <>
              <span
                data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-349"
                className="shrink-0 font-semibold text-[#64748B]"
              >
                {metricLabel}
              </span>
              <span
                data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-352"
                className="shrink-0 text-[#E5E7EB]"
                aria-hidden
              >
                ·
              </span>
            </>
          ) : null}
          {showTaskCount ? (
            <span
              data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-357"
              className="flex min-w-0 shrink items-center gap-1 truncate"
            >
              <span
                data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-395"
                className="inline-block h-1 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span
                data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-362"
                className="truncate"
              >
                {kr.taskCount} task{kr.taskCount !== 1 ? 's' : ''}
              </span>
            </span>
          ) : null}
          {kr.progressLabel ? (
            <>
              <span
                data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-368"
                className="shrink-0 text-[#E5E7EB]"
              >
                ·
              </span>
              <span
                data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-369"
                className="shrink-0 tabular-nums font-medium text-[#64748B]"
              >
                {kr.progressLabel}
              </span>
            </>
          ) : null}
        </div>
        {pickButton ? (
          <div
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-376"
            className="flex shrink-0 items-center"
          >
            {pickButton}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Owner section ──────────────────────────────────────────────────────

function OwnerKRSection({
  group,
  isSingleOwner,
  isCurrentUser,
  defaultExpanded,
  highlightedKRId,
  showInlinePlanningPick = false,
  planningTargetsByKrId,
  selectedPlanningTargetId = null,
  onPickPlanningTarget,
  userKeyResultItems = [],
  objectiveMilestonesByKrId,
  onRefreshMilestoneStatus,
}: {
  group: OwnerKRGroup;
  isSingleOwner: boolean;
  isCurrentUser: boolean;
  defaultExpanded: boolean;
  highlightedKRId: string | null;
  showInlinePlanningPick?: boolean;
  planningTargetsByKrId?: Map<string, PlanningTarget[]>;
  selectedPlanningTargetId?: string | null;
  onPickPlanningTarget?: (target: PlanningTarget) => void;
  userKeyResultItems?: any[];
  objectiveMilestonesByKrId?: Map<string, any[]>;
  onRefreshMilestoneStatus?: () => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const headerLabel =
    isCurrentUser && isSingleOwner
      ? 'Your Key Results'
      : group.owner?.name || 'Unknown';

  const completedCount = group.krs.filter((k) => k.progress >= 100).length;
  const totalTasks = group.krs.reduce((s, k) => s + k.taskCount, 0);
  const avgPct = Math.min(group.avgProgress, 100);
  const color = progressColor(group.avgProgress);

  if (isSingleOwner) {
    return (
      <div
        data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-419"
        className="min-w-0"
      >
        <div
          data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-420"
          className="hidden px-2 pb-2 pt-2 sm:px-3 sm:pt-3 lg:block"
        >
          <div
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-421"
            className="mb-1 flex items-center justify-between gap-2"
          >
            <div
              data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-422"
              className="flex min-w-0 items-center gap-2"
            >
              <div
                data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-423"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1E40AF]/10"
              >
                <BsKey size={13} className="text-[#1E40AF]" />
              </div>
              <p
                data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-p-426"
                className="truncate text-[12px] font-bold leading-tight text-[#161A2C] sm:text-[13px]"
              >
                Key Results
              </p>
            </div>
            <span
              data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-501"
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${progressBg(group.avgProgress)} ${progressTextClass(group.avgProgress)}`}
            >
              {group.avgProgress}%
            </span>
          </div>
          <div
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-436"
            className="mt-2 h-[5px] w-full overflow-hidden rounded-full bg-[#F1F2F6]"
          >
            <div
              data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-511"
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${avgPct}%`, backgroundColor: color }}
            />
          </div>
          <div
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-442"
            className="mt-1.5 flex items-center justify-between text-[10px] text-[#8F94A3]"
          >
            <span data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-443">
              {completedCount} of {group.krs.length} completed
            </span>
            <span data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-446">
              {totalTasks} tasks
            </span>
          </div>
        </div>

        <div
          data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-450"
          className={krCardListClass}
        >
          {group.krs.map((kr) => {
            const slots = resolvePlanningSlotsForKr(
              kr,
              planningTargetsByKrId?.get(kr.id) ?? [],
              userKeyResultItems,
              objectiveMilestonesByKrId,
            );
            const objectiveMilestones =
              objectiveMilestonesByKrId?.get(String(kr.id)) ?? [];
            return (
              <div
                data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-454"
                key={kr.id}
                className={krCardStripItemClass}
              >
                <KRProgressCard
                  kr={kr}
                  isHighlighted={highlightedKRId === kr.id}
                  inlinePickEnabled={showInlinePlanningPick}
                  planningTargetsForKr={slots}
                  selectedPlanningTargetId={selectedPlanningTargetId}
                  onPickPlanningTarget={onPickPlanningTarget}
                  objectiveMilestones={objectiveMilestones}
                  onRefreshMilestoneStatus={onRefreshMilestoneStatus}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-472"
      className="mb-2 min-w-0"
    >
      <button
        data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-button-562"
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
          expanded
            ? 'bg-white border border-[#BFDBFE] shadow-[0_1px_4px_rgba(30,64,175,0.06)]'
            : 'bg-white border border-transparent hover:border-[#F1F2F6] hover:shadow-sm'
        }`}
      >
        <div
          data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-482"
          className="relative flex-shrink-0"
        >
          <Avatar
            size={32}
            src={group.owner?.avatar}
            style={{
              backgroundColor: '#DBEAFE',
              color: '#1E40AF',
              fontSize: '12px',
              fontWeight: 700,
              lineHeight: '32px',
            }}
          >
            {group.owner?.avatarInitials}
          </Avatar>
          <div
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-588"
            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white"
            style={{ backgroundColor: color }}
          />
        </div>

        <div
          data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-502"
          className="flex-1 min-w-0"
        >
          <p
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-p-503"
            className="text-[13px] font-semibold text-[#161A2C] truncate leading-tight"
          >
            {headerLabel}
          </p>
          <div
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-506"
            className="flex items-center gap-2 mt-0.5"
          >
            {group.owner?.role && (
              <>
                <span
                  data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-509"
                  className="text-[10px] text-[#8F94A3] truncate"
                >
                  {group.owner.role}
                </span>
                <span
                  data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-512"
                  className="text-[#E5E7EB] text-[10px]"
                >
                  ·
                </span>
              </>
            )}
            <span
              data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-515"
              className="text-[10px] text-[#8F94A3]"
            >
              {group.krs.length} KR{group.krs.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div
          data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-521"
          className="flex items-center gap-2 flex-shrink-0"
        >
          <span
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-637"
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${progressBg(group.avgProgress)} ${progressTextClass(group.avgProgress)}`}
          >
            {group.avgProgress}%
          </span>
          <div
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-527"
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#8F94A3] transition-colors hover:bg-[#F1F2F6]"
          >
            {expanded ? (
              <MdExpandMore className="text-lg" />
            ) : (
              <MdChevronRight className="text-lg" />
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div
          data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-538"
          className={`mt-2 ${krCardListClass}`}
        >
          {group.krs.map((kr) => {
            const slots = resolvePlanningSlotsForKr(
              kr,
              planningTargetsByKrId?.get(kr.id) ?? [],
              userKeyResultItems,
              objectiveMilestonesByKrId,
            );
            const objectiveMilestones =
              objectiveMilestonesByKrId?.get(String(kr.id)) ?? [];
            return (
              <div
                data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-542"
                key={kr.id}
                className={krCardStripItemClass}
              >
                <KRProgressCard
                  kr={kr}
                  isHighlighted={highlightedKRId === kr.id}
                  inlinePickEnabled={showInlinePlanningPick}
                  planningTargetsForKr={slots}
                  selectedPlanningTargetId={selectedPlanningTargetId}
                  onPickPlanningTarget={onPickPlanningTarget}
                  objectiveMilestones={objectiveMilestones}
                  onRefreshMilestoneStatus={onRefreshMilestoneStatus}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Comment Thread Panel ───────────────────────────────────────────────

export type CommentThreadKind = 'plan' | 'report';

function CommentThreadPanel({
  plan,
  onClose,
  threadKind,
}: {
  plan: PlanSummary;
  onClose: () => void;
  threadKind: CommentThreadKind;
}) {
  const comments = plan.comments || [];
  const commentCount = comments.length;
  const isPlanCard = threadKind === 'plan';
  const contextLabel = isPlanCard ? 'Plan' : 'Report';

  return (
    <div
      data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-579"
      className="flex h-full flex-col"
    >
      <div
        data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-580"
        className="flex items-center gap-3 bg-white border-b border-[#F1F2F6] px-4 py-3 flex-shrink-0"
      >
        <button
          data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-button-712"
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8F94A3] transition-colors hover:bg-[#F1F2F6] hover:text-[#1E40AF]"
        >
          <IoArrowBack size={15} />
        </button>
        <div
          data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-588"
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <div
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-589"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1E40AF]/10"
          >
            <MessageOutlined className="text-[13px] text-[#1E40AF]" />
          </div>
          <div
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-592"
            className="min-w-0 flex-1"
          >
            <p
              data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-p-593"
              className="text-[13px] font-semibold text-[#161A2C] leading-tight truncate"
            >
              Comments
            </p>
            <p
              data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-p-596"
              className="text-[10px] text-[#8F94A3] mt-0.5 truncate"
            >
              {contextLabel} · {plan.owner?.name || contextLabel} ·{' '}
              {commentCount} comment{commentCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div
        data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-604"
        className="flex-1 overflow-y-auto scrollbar-hide min-h-0"
      >
        <div
          data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-605"
          className="p-3"
        >
          <CommentList
            data={comments}
            planId={plan.id}
            isPlanCard={isPlanCard}
            showAddForm={true}
            resetToggle={0}
            onEdit={() => {}}
            onFormSubmit={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Parent plan (child cadence): flat task list, pick → inline composer ──
// Header aligns with Key Results block; one scroll region for title + tasks.

function ParentPlanTasksSection({
  title,
  slots,
  showPick,
  selectedPlanningTargetId,
  onPickPlanningTarget,
  loading,
  expandToFill,
  blockedKrIds,
}: {
  title: string;
  slots: PlanningTarget[];
  showPick: boolean;
  selectedPlanningTargetId: string | null;
  onPickPlanningTarget?: (target: PlanningTarget) => void;
  loading: boolean;
  blockedKrIds?: Set<string>;
  /** Fills KR column height when Key Results list is hidden (child cadence). */
  expandToFill?: boolean;
}) {
  const rowLabel = (t: PlanningTarget) =>
    (t.parentTaskTitle || 'Task').trim() || 'Task';

  return (
    <div
      data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-798"
      className={`mx-1 min-h-0 sm:mx-2 ${
        expandToFill ? 'mb-0 flex flex-1 flex-col' : 'mb-3 shrink-0'
      }`}
      role="region"
      aria-label={title}
    >
      <div
        data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-805"
        className={`min-h-0 overflow-y-auto scrollbar-hide ${
          expandToFill ? 'flex-1' : 'max-h-[min(62vh,28rem)]'
        }`}
      >
        <div
          data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-658"
          className="hidden px-2 pb-2 pt-2 sm:px-3 sm:pt-3 lg:block"
        >
          <div
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-659"
            className="mb-1 flex items-center justify-between gap-2"
          >
            <p
              data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-p-660"
              className="min-w-0 flex-1 truncate text-[12px] font-bold leading-tight text-[#161A2C] sm:text-[13px]"
            >
              {title}
            </p>
            {!loading && slots.length > 0 ? (
              <span
                data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-664"
                className="shrink-0 rounded-lg bg-[#1E40AF]/10 px-2.5 py-1 text-[11px] font-bold text-[#1E40AF]"
              >
                {slots.length}
              </span>
            ) : null}
          </div>
          <div
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-669"
            className="mt-2 h-[5px] w-full overflow-hidden rounded-full bg-[#F1F2F6]"
          >
            <div
              data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-837"
              className="h-full rounded-full bg-[#1E40AF]/35 transition-all duration-500"
              style={{
                width: loading || slots.length === 0 ? '0%' : '100%',
              }}
            />
          </div>
          <div
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-677"
            className="mt-1.5 flex items-center justify-between text-[10px] text-[#8F94A3]"
          >
            <span data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-678">
              {showPick && slots.length > 0
                ? 'Tap + to plan under a task'
                : 'Plan tasks'}
            </span>
            <span data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-683">
              {loading
                ? '…'
                : `${slots.length} task${slots.length === 1 ? '' : 's'}`}
            </span>
          </div>
        </div>

        {loading ? (
          <div
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-692"
            className="flex flex-col items-center justify-center gap-2 px-3 py-10 sm:px-4"
          >
            <Spin size="small" />
            <p
              data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-p-694"
              className="text-[12px] font-medium text-[#8F94A3]"
            >
              Loading plan tasks…
            </p>
          </div>
        ) : slots.length === 0 ? (
          <div
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-699"
            className="px-3 py-10 text-center sm:px-4"
          >
            <p
              data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-p-700"
              className="text-[12px] font-medium text-[#8F94A3]"
            >
              No tasks on this plan yet
            </p>
          </div>
        ) : (
          <ul
            data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-ul-705"
            className="space-y-1.5 px-2 pb-2 pt-1 sm:px-3 sm:pb-3"
          >
            {slots.map((slot) => {
              const selected = selectedPlanningTargetId === slot.id;
              const canPick =
                showPick &&
                !!onPickPlanningTarget &&
                !blockedKrIds?.has(slot.keyResultId);
              return (
                <li
                  data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-li-710"
                  key={slot.id}
                  className="min-w-0"
                >
                  <div
                    data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-900"
                    className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 py-2.5 transition-all duration-200 ${
                      selected
                        ? 'border-[#1E40AF]/40 shadow-[0_0_0_2px_rgba(30,64,175,0.08),0_2px_12px_rgba(30,64,175,0.06)]'
                        : 'border-[#F1F2F6] hover:border-[#1E40AF]/15 hover:shadow-[0_2px_12px_rgba(30,64,175,0.05)]'
                    }`}
                  >
                    <p
                      data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-p-718"
                      className="line-clamp-3 min-w-0 flex-1 text-left text-[12px] font-normal leading-snug text-[#161A2C] sm:text-[13px]"
                    >
                      {rowLabel(slot)}
                    </p>
                    {canPick ? (
                      <button
                        data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-button-914"
                        type="button"
                        title="Add daily tasks under this parent task"
                        onClick={() => onPickPlanningTarget!(slot)}
                        className={`${inlinePickBtnClass} ${selected ? inlinePickBtnSelectedRing : ''}`}
                      >
                        <PlusOutlined className="text-[13px]" />
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Exported KR Left Panel ─────────────────────────────────────────────
// Rendered once at the page level, stays stable across tab switches.

export interface KRPanelProps {
  plans: PlanSummary[];
  transformedData: any[];
  userId: string;
  highlightedKRId: string | null;
  activeThread: { id: string; kind: CommentThreadKind } | null;
  onCloseThread: () => void;
  /** Plan + report summaries for resolving open comment threads (ids differ). */
  threadEntities: PlanSummary[];
  /** Embedded create-plan: + on each KR card to pick planning slot */
  inlinePlanningMode?: boolean;
  activeTab?: number;
  planningTargets?: PlanningTarget[];
  planningTargetsLoading?: boolean;
  selectedPlanningTargetId?: string | null;
  onPickPlanningTarget?: (target: PlanningTarget) => void;
  /** Flat list from GET …/key-results/user/:userId (merged with plan-backed KRs, deduped by id). */
  userKeyResultItems?: any[];
  /** Objective milestones by KR id (same rows createPlanObjective lists). */
  objectiveMilestonesByKrId?: Map<string, any[]>;
  /** Refetch milestone Completed status (user KR + objectives) when opening +. */
  onRefreshMilestoneStatus?: () => void;
  /** Unreported parent plan for current cadence (planning period hierarchy). */
  parentPlanContext?: ParentPlanContext | null;
  /** False while user KR API is loading/refetching — hides + until eligibility is current. */
  planningPickReady?: boolean;
}

export function KRLeftPanel({
  plans,
  transformedData,
  userId,
  highlightedKRId,
  activeThread,
  onCloseThread,
  threadEntities,
  inlinePlanningMode = false,
  activeTab = 1,
  planningTargets = [],
  planningTargetsLoading = false,
  selectedPlanningTargetId = null,
  onPickPlanningTarget,
  userKeyResultItems = [],
  objectiveMilestonesByKrId,
  onRefreshMilestoneStatus,
  parentPlanContext = null,
  planningPickReady = true,
}: KRPanelProps) {
  const ownerGroups = React.useMemo(() => {
    const base = buildOwnerKRGroups(plans, userKeyResultItems);
    const merged = enrichOwnerGroupsPlanningBlocked(
      mergeUserKeyResultsIntoOwnerGroups(
        base,
        userKeyResultItems,
        plans,
        transformedData,
        userId,
      ),
      userKeyResultItems,
    );
    const currentUserOwnerKeys = new Set(
      transformedData
        ?.filter((d: any) => d?.userId === userId)
        ?.map(
          (d: any) => plans.find((p) => p.id === d?.id)?.owner?.name || '',
        ) || [],
    );

    return [...merged].sort((a, b) => {
      const aMine = currentUserOwnerKeys.has(a.ownerKey);
      const bMine = currentUserOwnerKeys.has(b.ownerKey);
      if (aMine === bMine) return 0;
      return aMine ? -1 : 1;
    });
  }, [plans, userId, userKeyResultItems, transformedData]);

  const totalKRs = ownerGroups.reduce((s, g) => s + g.krs.length, 0);
  const isSingleOwner = ownerGroups.length <= 1;

  const threadPlan = activeThread
    ? (threadEntities.find((p) => p.id === activeThread.id) ?? null)
    : null;

  const showInlinePick =
    inlinePlanningMode && activeTab === 1 && !threadPlan && planningPickReady;

  const blockedKrIds = React.useMemo(() => {
    const panelKrs = ownerGroups.flatMap((g) => g.krs);
    return buildBlockedKeyResultIdSet(userKeyResultItems, panelKrs);
  }, [ownerGroups, userKeyResultItems]);

  /** Parent-plan rows (daily-under-weekly etc.) — picked from the plan section only, not KR +. */
  const parentPlanSlots = React.useMemo(
    () =>
      planningTargets.filter(
        (t) => t.isDailySlot && !blockedKrIds.has(t.keyResultId),
      ),
    [planningTargets, blockedKrIds],
  );

  const targetsByKrId = React.useMemo(() => {
    const m = new Map<string, PlanningTarget[]>();
    for (const t of planningTargets) {
      if (t.isDailySlot) continue;
      // Do NOT drop by blockedKrIds here — that hid + whenever aggregate
      // progress looked "done" while milestones remained. Card + visibility
      // is driven by hasSelectableSlot (any non-achieved / non-session-achieved).
      const kid = t.keyResultId;
      const list = m.get(kid);
      if (list) list.push(t);
      else m.set(kid, [t]);
    }
    return m;
  }, [planningTargets]);

  const showKrTargetsLoadingRow =
    showInlinePick &&
    planningTargetsLoading &&
    !parentPlanContext &&
    planningTargets.length === 0;

  /** Child cadence on Plans tab: parent plan tasks only (hide KR list). Reports tab keeps KRs. */
  const isChildCadence = !!parentPlanContext && activeTab === 1;

  return (
    <>
      {threadPlan && activeThread ? (
        <CommentThreadPanel
          plan={threadPlan}
          onClose={onCloseThread}
          threadKind={activeThread.kind}
        />
      ) : (
        <>
          {!isChildCadence && !isSingleOwner && (
            <div
              data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-853"
              className="bg-white border-b border-[#F1F2F6] px-4 py-3.5 flex-shrink-0"
            >
              <div
                data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-854"
                className="flex items-center justify-between"
              >
                <div
                  data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-855"
                  className="flex items-center gap-2"
                >
                  <div
                    data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-856"
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1E40AF]/10"
                  >
                    <BsKey size={13} className="text-[#1E40AF]" />
                  </div>
                  <div data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-859">
                    <p
                      data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-p-860"
                      className="text-[13px] font-bold text-[#161A2C] leading-tight"
                    >
                      Key Results
                    </p>
                    <p
                      data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-p-863"
                      className="text-[10px] text-[#8F94A3] mt-0.5"
                    >
                      {totalKRs} key result{totalKRs !== 1 ? 's' : ''} ·{' '}
                      {ownerGroups.length} owner
                      {ownerGroups.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <span
                  data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-span-870"
                  className="rounded-lg bg-[#1E40AF]/10 px-2.5 py-1 text-[11px] font-bold text-[#1E40AF]"
                >
                  {totalKRs}
                </span>
              </div>
            </div>
          )}

          {parentPlanContext && activeTab === 1 ? (
            <ParentPlanTasksSection
              title={parentPlanContext.title}
              slots={parentPlanSlots}
              showPick={showInlinePick}
              selectedPlanningTargetId={selectedPlanningTargetId}
              onPickPlanningTarget={onPickPlanningTarget}
              loading={planningTargetsLoading && parentPlanSlots.length === 0}
              blockedKrIds={blockedKrIds}
              expandToFill={isChildCadence}
            />
          ) : null}

          {!isChildCadence ? (
            <div
              data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-890"
              className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-1 py-2 scrollbar-hide sm:px-2 lg:overflow-x-hidden"
            >
              {showKrTargetsLoadingRow ? (
                <div
                  data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-892"
                  className="flex shrink-0 items-center justify-center gap-2 py-2 text-[11px] text-[#8F94A3]"
                >
                  <Spin size="small" />
                  Loading planning slots…
                </div>
              ) : null}
              {totalKRs === 0 ? (
                <div
                  data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-898"
                  className="flex min-h-[min(42vh,26rem)] flex-1 flex-col items-center justify-center px-4 py-8 text-center lg:min-h-0"
                >
                  <div
                    data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-899"
                    className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F2F6]"
                  >
                    <BsKey size={24} className="text-[#D1D5DB]" />
                  </div>
                  <p
                    data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-p-902"
                    className="text-sm font-medium text-[#8F94A3]"
                  >
                    No key results yet
                  </p>
                  <p
                    data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-p-905"
                    className="mt-1 text-xs text-[#C4C7CE]"
                  >
                    No key results are assigned to your profile for this view
                  </p>
                </div>
              ) : (
                ownerGroups.map((group, idx) => {
                  const isCurrentUserGroup =
                    isSingleOwner &&
                    transformedData?.some(
                      (d: any) =>
                        d.userId === userId &&
                        plans.some(
                          (p) =>
                            p.id === d.id &&
                            p.owner?.name === group.owner?.name,
                        ),
                    );

                  return (
                    <OwnerKRSection
                      key={group.ownerKey}
                      group={group}
                      isSingleOwner={isSingleOwner}
                      isCurrentUser={!!isCurrentUserGroup}
                      defaultExpanded={isSingleOwner || idx === 0}
                      highlightedKRId={highlightedKRId}
                      showInlinePlanningPick={showInlinePick}
                      planningTargetsByKrId={targetsByKrId}
                      selectedPlanningTargetId={selectedPlanningTargetId}
                      onPickPlanningTarget={onPickPlanningTarget}
                      userKeyResultItems={userKeyResultItems}
                      objectiveMilestonesByKrId={objectiveMilestonesByKrId}
                      onRefreshMilestoneStatus={onRefreshMilestoneStatus}
                    />
                  );
                })
              )}
            </div>
          ) : null}
        </>
      )}
    </>
  );
}

// ─── Main: split panel view (right panel only on desktop) ───────────────

export interface PlanningPanelViewProps {
  plans: PlanSummary[];
  transformedData: any[];
  cadence: Cadence;
  userId: string;
  getEmployeeData: (id: string) => any;
  isDataFromActiveSession: (createdAt: string) => boolean;
  onApprove: (id: string, value: boolean) => void;
  onEdit: (id: string) => void;
  isApprovalLoading: boolean;
  getDateLabel: (createdAt: string) => string;
  paginationNode?: React.ReactNode;
  planningPeriodId?: string;
  viewMode?: ViewMode;
  onHoverKR?: (krId: string | null) => void;
  onOpenThread?: (entityId: string, threadKind: CommentThreadKind) => void;
  onStartInlineReport?: (planId: string) => void;
  ownerCanOpenSubmitReport?: boolean;
  inlineReportPlanId?: string | null;
  onCloseInlineReport?: () => void;
  planningPeriodLabel?: string;
}

export default function PlanningPanelView({
  plans,
  transformedData,
  cadence,
  userId,
  getEmployeeData,
  isDataFromActiveSession,
  onApprove,
  onEdit,
  isApprovalLoading,
  getDateLabel,
  paginationNode,
  planningPeriodId,
  viewMode = 'planning',
  onHoverKR,
  onOpenThread,
  onStartInlineReport,
  ownerCanOpenSubmitReport,
  inlineReportPlanId,
  onCloseInlineReport,
  planningPeriodLabel,
}: PlanningPanelViewProps) {
  return (
    <div
      data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-995"
      className="min-w-0 max-w-full space-y-4 pr-1"
    >
      {plans.map((plan) => {
        const originalDataItem = transformedData?.find(
          (item: any) => item.id === plan.id,
        );
        if (!originalDataItem) return null;

        const ownerUserId =
          originalDataItem?.userId ?? originalDataItem?.createdBy;

        if (viewMode === 'reporting') {
          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              viewMode="reporting"
              activeCadence={cadence}
              onApprove={() => onApprove(originalDataItem.id, true)}
              onOpen={() => onApprove(originalDataItem.id, false)}
              onEdit={() => onEdit(originalDataItem.id)}
              canApprove={
                userId ===
                (getEmployeeData(ownerUserId)?.reportingTo?.id ||
                  getEmployeeData(ownerUserId)?.delegatedTo?.id)
              }
              canEdit={
                userId === ownerUserId &&
                originalDataItem?.plan?.isReportValidated == false &&
                isDataFromActiveSession(originalDataItem?.createdAt)
              }
              isApprovalLoading={isApprovalLoading}
              dateLabel={getDateLabel(originalDataItem?.createdAt ?? '')}
              onHoverKR={onHoverKR}
              onOpenThread={onOpenThread}
              inlineReportActive={inlineReportPlanId === originalDataItem.id}
              onCloseInlineReport={onCloseInlineReport}
              inlineReportContent={
                inlineReportPlanId === originalDataItem.id ? (
                  <PlanCardInlineReportForm
                    reportId={originalDataItem.id}
                    planId={
                      originalDataItem.planId ||
                      originalDataItem?.plan?.id ||
                      originalDataItem?.plan?.planId
                    }
                    planningPeriodId={planningPeriodId}
                    planningPeriodName={planningPeriodLabel}
                    onClose={onCloseInlineReport || (() => {})}
                  />
                ) : undefined
              }
            />
          );
        }

        return (
          <PlanCard
            key={plan.id}
            plan={plan}
            viewMode="planning"
            activeCadence={cadence}
            onApprove={() => onApprove(originalDataItem.id, true)}
            onOpen={() => onApprove(originalDataItem.id, false)}
            onEdit={() => onEdit(originalDataItem.id)}
            canApprove={
              userId ===
              (getEmployeeData(originalDataItem?.userId)?.delegatedTo?.id ||
                getEmployeeData(originalDataItem?.userId)?.reportingTo?.id)
            }
            canEdit={
              userId === originalDataItem?.userId &&
              originalDataItem?.isValidated == false &&
              originalDataItem?.isReported == false &&
              isDataFromActiveSession(originalDataItem?.createdAt)
            }
            isApprovalLoading={isApprovalLoading}
            dateLabel={getDateLabel(originalDataItem?.createdAt ?? '')}
            onHoverKR={onHoverKR}
            planningPeriodId={planningPeriodId}
            onOpenThread={onOpenThread}
            onSubmitReport={
              ownerUserId === userId &&
              originalDataItem?.isReported == false &&
              onStartInlineReport
                ? () => onStartInlineReport(originalDataItem.id)
                : undefined
            }
            showSubmitReport={
              ownerUserId === userId &&
              originalDataItem?.isReported == false &&
              !!ownerCanOpenSubmitReport
            }
            inlineReportActive={inlineReportPlanId === plan.id}
            onCloseInlineReport={onCloseInlineReport}
            planningPeriodLabel={planningPeriodLabel}
          />
        );
      })}
      {paginationNode && (
        <div
          data-cy="planning-and-reporting-components-planning-planningpanelview-tsx-planningpanelview-div-1093"
          className="mt-4"
        >
          {paginationNode}
        </div>
      )}
    </div>
  );
}
