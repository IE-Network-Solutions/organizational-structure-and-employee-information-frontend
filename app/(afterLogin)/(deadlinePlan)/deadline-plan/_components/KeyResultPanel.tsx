'use client';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { Skeleton, Tooltip } from 'antd';
import { BsKey } from 'react-icons/bs';
import {
  MdChevronLeft,
  MdChevronRight,
  MdExpandMore,
  MdAdd,
} from 'react-icons/md';
import {
  DeadlineKeyResult,
  DeadlineTaskSearchFilter,
} from '@/store/server/features/deadlinePlan/interface';
import {
  useDeadlineKeyResults,
  useDeadlineTaskSummary,
} from '@/store/server/features/deadlinePlan/queries';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';
import {
  buildOwnerGroup,
  PanelCard,
  PanelOwnerGroup,
  progressColor,
  progressPillClass,
} from './keyResultPanelData';
import { PersonOption } from './useDeadlinePeople';
import { getInitials } from './utils';

/** Owners beyond this are left out of the panel to keep it readable. */
export const KEY_RESULT_PANEL_OWNER_LIMIT = 20;

/** Grid placement: the panel owns the left column of the page grid. */
const HEADER_CELL = 'lg:col-start-1 lg:row-start-1 lg:w-[380px]';
const BODY_CELL = 'lg:col-start-1 lg:row-start-2 lg:w-[380px]';
const RAIL_CELL = 'lg:col-start-1 lg:row-start-1 lg:row-span-2';
const BOUNDARY = 'rounded-2xl border border-slate-100 bg-slate-50/60';

interface KeyResultPanelProps {
  userId: string;
  /** Selected assignees with the signed-in user first. */
  ownerIds: string[];
  /** The task list's filters, so task counts match what is listed. */
  filter: DeadlineTaskSearchFilter;
  getPerson: (id: string | null | undefined) => PersonOption | null;
}

function OwnerAvatar({ name, color }: { name: string; color: string }) {
  return (
    <span
      data-cy="deadline-kr-owner-avatar"
      className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-xs font-bold text-[#1E40AF]"
    >
      {getInitials(name)}
      <span
        data-cy="deadline-kr-owner-dot"
        className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

function ProgressPill({ value }: { value: number }) {
  return (
    <span
      data-cy="deadline-kr-progress-pill"
      className={classNames(
        'shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold',
        progressPillClass(value),
      )}
    >
      {value}%
    </span>
  );
}

function KeyResultCard({
  card,
  onAddTask,
}: {
  card: PanelCard;
  onAddTask?: () => void;
}) {
  const color = progressColor(card.progress);
  // The bar stops at 100%; the pill may show stretch overshoot (e.g. 110%).
  const barWidth = Math.min(Math.max(0, card.progress), 100);

  return (
    <div
      data-cy={`deadline-kr-card-${card.id}`}
      className="group flex flex-col rounded-xl border border-[#F1F2F6] bg-white p-3 transition-all hover:border-[#1E40AF]/15 hover:shadow-[0_2px_12px_rgba(30,64,175,0.05)]"
    >
      <div
        data-cy="deadline-kr-card-head"
        className="mb-2 flex items-start justify-between gap-2"
      >
        <p
          data-cy="deadline-kr-card-title"
          className="line-clamp-2 min-w-0 flex-1 text-[13px] leading-snug text-[#161A2C]"
          title={card.title}
        >
          {card.title}
        </p>
        <span
          data-cy="deadline-kr-card-progress"
          className={classNames(
            'shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold',
            progressPillClass(card.progress),
          )}
        >
          {card.progress}%
        </span>
      </div>

      <div
        data-cy="deadline-kr-card-bar"
        className="h-[5px] w-full overflow-hidden rounded-full bg-[#F1F2F6]"
      >
        <div
          data-cy="deadline-kr-card-bar-fill"
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${barWidth}%`, backgroundColor: color }}
        />
      </div>

      <div
        data-cy="deadline-kr-card-meta"
        className="mt-2 flex items-center justify-between gap-2 text-[11px] text-[#8F94A3]"
      >
        <div
          data-cy="deadline-kr-card-meta-items"
          className="flex min-w-0 flex-1 items-center gap-x-2 overflow-hidden"
        >
          {card.metricLabel ? (
            <span
              data-cy="deadline-kr-card-metric"
              className="shrink-0 font-semibold text-[#64748B]"
            >
              {card.metricLabel}
            </span>
          ) : null}
          {card.taskCount > 0 ? (
            <span
              data-cy="deadline-kr-card-tasks"
              className="flex shrink-0 items-center gap-1"
            >
              <span
                data-cy="deadline-kr-card-tasks-dot"
                className="inline-block h-1 w-1 rounded-full"
                style={{ backgroundColor: color }}
              />
              {card.taskCount} task{card.taskCount === 1 ? '' : 's'}
            </span>
          ) : null}
          {card.ratioLabel ? (
            <span
              data-cy="deadline-kr-card-ratio"
              className="shrink-0 font-medium tabular-nums text-[#64748B]"
            >
              {card.ratioLabel}
            </span>
          ) : null}
        </div>
        {onAddTask ? (
          <button
            type="button"
            data-cy={`deadline-kr-card-add-task-${card.id}`}
            onClick={onAddTask}
            title="Add a task for this key result"
            aria-label="Add a task for this key result"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#1E40AF] opacity-0 transition-opacity hover:bg-[#1E40AF]/10 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <MdAdd className="text-base" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function OwnerSection({
  group,
  name,
  subtitle,
  expanded,
  isLoading,
  onToggle,
  onAddTask,
}: {
  group: PanelOwnerGroup;
  name: string;
  subtitle: string;
  expanded: boolean;
  isLoading: boolean;
  onToggle: () => void;
  onAddTask: (keyResultId: string) => void;
}) {
  return (
    <div data-cy={`deadline-kr-owner-${group.ownerId}`} className="min-w-0">
      <button
        type="button"
        data-cy={`deadline-kr-owner-toggle-${group.ownerId}`}
        onClick={onToggle}
        aria-expanded={expanded}
        className={classNames(
          'flex w-full items-center gap-3 rounded-xl border bg-white px-3 py-3 text-left transition-all',
          expanded
            ? 'border-[#BFDBFE] shadow-[0_1px_4px_rgba(30,64,175,0.06)]'
            : 'border-transparent hover:border-[#F1F2F6] hover:shadow-sm',
        )}
      >
        <OwnerAvatar name={name} color={progressColor(group.avgProgress)} />
        <span
          data-cy="deadline-kr-owner-text"
          className="flex min-w-0 flex-1 flex-col"
        >
          <span
            data-cy="deadline-kr-owner-name"
            className="truncate text-[13px] font-semibold leading-tight text-[#161A2C]"
          >
            {name}
          </span>
          <span
            data-cy="deadline-kr-owner-meta"
            className="mt-0.5 truncate text-[10px] text-[#8F94A3]"
          >
            {subtitle}
          </span>
        </span>
        <ProgressPill value={group.avgProgress} />
        <span
          data-cy="deadline-kr-owner-chevron"
          className="flex h-6 w-6 shrink-0 items-center justify-center text-[#8F94A3]"
        >
          {expanded ? (
            <MdExpandMore className="text-lg" />
          ) : (
            <MdChevronRight className="text-lg" />
          )}
        </span>
      </button>

      {expanded ? (
        <div
          data-cy="deadline-kr-owner-cards"
          className="mt-2 flex flex-col gap-2 px-1"
        >
          {isLoading && group.cards.length === 0 ? (
            <div
              data-cy="deadline-kr-owner-loading"
              className="rounded-xl bg-white p-3"
            >
              <Skeleton active title={false} paragraph={{ rows: 2 }} />
            </div>
          ) : null}
          {!isLoading && group.cards.length === 0 ? (
            <p
              data-cy="deadline-kr-owner-empty"
              className="rounded-xl bg-white p-3 text-xs text-[#8F94A3]"
            >
              No key results in the current session.
            </p>
          ) : null}
          {group.cards.map((card) => (
            <KeyResultCard
              key={card.id}
              card={card}
              onAddTask={
                card.keyResultId
                  ? () => onAddTask(card.keyResultId as string)
                  : undefined
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function KeyResultPanel({
  userId,
  ownerIds,
  filter,
  getPerson,
}: KeyResultPanelProps) {
  const isOpen = useDeadlinePlanStore((state) => state.isKeyResultPanelOpen);
  const setOpen = useDeadlinePlanStore((state) => state.setKeyResultPanelOpen);
  const openTaskForm = useDeadlinePlanStore((state) => state.openTaskForm);
  /** Null until the user toggles a section; the first owner starts open. */
  const [toggledOwnerIds, setToggledOwnerIds] = useState<string[] | null>(null);

  const shownOwnerIds = useMemo(
    () => ownerIds.slice(0, KEY_RESULT_PANEL_OWNER_LIMIT),
    [ownerIds],
  );
  const keyResultQueries = useDeadlineKeyResults(shownOwnerIds);
  const { data: summary } = useDeadlineTaskSummary(filter);

  const groups = shownOwnerIds.map((ownerId, index) => ({
    group: buildOwnerGroup(
      ownerId,
      (keyResultQueries[index]?.data ?? []) as DeadlineKeyResult[],
      summary ?? [],
    ),
    person: getPerson(ownerId),
    isLoading: !!keyResultQueries[index]?.isLoading,
  }));

  const totalKeyResults = groups.reduce(
    (count, item) => count + item.group.keyResultCount,
    0,
  );
  const expandedOwnerIds = toggledOwnerIds ?? shownOwnerIds.slice(0, 1);

  const toggleOwner = (ownerId: string) =>
    setToggledOwnerIds(
      expandedOwnerIds.includes(ownerId)
        ? expandedOwnerIds.filter((id) => id !== ownerId)
        : [...expandedOwnerIds, ownerId],
    );

  if (!isOpen) {
    return (
      <aside
        data-cy="deadline-kr-rail"
        className={classNames(
          RAIL_CELL,
          BOUNDARY,
          'flex w-full flex-row items-center gap-3 self-start p-3 lg:w-[68px] lg:flex-col',
        )}
      >
        <Tooltip title="Show key results" placement="right">
          <button
            type="button"
            data-cy="deadline-kr-panel-expand"
            onClick={() => setOpen(true)}
            aria-label="Show key results"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#1E40AF] hover:bg-[#1E40AF]/10"
          >
            <MdChevronRight className="text-xl" />
          </button>
        </Tooltip>
        {groups.map(({ group, person }) => {
          const name = person?.name ?? 'Unknown user';
          return (
            <Tooltip
              key={group.ownerId}
              placement="right"
              title={`${group.ownerId === userId ? 'Your key results' : name} · ${group.keyResultCount} KR${group.keyResultCount === 1 ? '' : 's'} · ${group.avgProgress}%`}
            >
              <button
                type="button"
                data-cy={`deadline-kr-rail-owner-${group.ownerId}`}
                aria-label={`Show key results for ${name}`}
                onClick={() => {
                  setToggledOwnerIds([group.ownerId]);
                  setOpen(true);
                }}
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF]/40"
              >
                <OwnerAvatar
                  name={name}
                  color={progressColor(group.avgProgress)}
                />
              </button>
            </Tooltip>
          );
        })}
      </aside>
    );
  }

  return (
    <>
      <div
        data-cy="deadline-kr-panel-header"
        className={classNames(
          HEADER_CELL,
          'flex items-center gap-2 self-center',
        )}
      >
        <span
          data-cy="deadline-kr-panel-icon"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1E40AF]/10"
        >
          <BsKey size={14} className="text-[#1E40AF]" />
        </span>
        <span
          data-cy="deadline-kr-panel-title"
          className="shrink-0 text-[13px] font-bold text-[#161A2C]"
        >
          Key Results
        </span>
        <span
          data-cy="deadline-kr-panel-summary"
          className="min-w-0 flex-1 truncate text-[13px] text-[#8F94A3]"
        >
          {totalKeyResults} key result{totalKeyResults === 1 ? '' : 's'} ·{' '}
          {groups.length} owner{groups.length === 1 ? '' : 's'}
        </span>
        <span
          data-cy="deadline-kr-panel-count"
          className="shrink-0 rounded-lg bg-[#1E40AF]/10 px-2.5 py-1 text-[11px] font-bold text-[#1E40AF]"
        >
          {totalKeyResults}
        </span>
        <button
          type="button"
          data-cy="deadline-kr-panel-collapse"
          onClick={() => setOpen(false)}
          aria-label="Hide key results"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#64748B] hover:bg-slate-100"
        >
          <MdChevronLeft className="text-xl" />
        </button>
      </div>

      <aside
        data-cy="deadline-kr-panel"
        className={classNames(
          BODY_CELL,
          BOUNDARY,
          'flex flex-col gap-2 self-start p-2',
        )}
      >
        {groups.length === 0 ? (
          <p
            data-cy="deadline-kr-panel-empty"
            className="p-4 text-sm text-[#8F94A3]"
          >
            Choose at least one person to see their key results.
          </p>
        ) : null}

        {groups.map(({ group, person, isLoading }) => {
          const isSelf = group.ownerId === userId;
          const name = person?.name ?? 'Unknown user';
          const count = `${group.keyResultCount} KR${group.keyResultCount === 1 ? '' : 's'}`;
          return (
            <OwnerSection
              key={group.ownerId}
              group={group}
              name={isSelf ? 'Your Key Results' : name}
              subtitle={
                !isSelf && person?.departmentName
                  ? `${person.departmentName} · ${count}`
                  : count
              }
              expanded={expandedOwnerIds.includes(group.ownerId)}
              isLoading={isLoading}
              onToggle={() => toggleOwner(group.ownerId)}
              onAddTask={(keyResultId) =>
                openTaskForm({
                  keyResult: { id: keyResultId, ownerId: group.ownerId },
                })
              }
            />
          );
        })}

        {ownerIds.length > shownOwnerIds.length ? (
          <p
            data-cy="deadline-kr-panel-limit"
            className="px-2 py-1 text-xs text-[#8F94A3]"
          >
            Showing the first {shownOwnerIds.length} of {ownerIds.length}{' '}
            selected people.
          </p>
        ) : null}
      </aside>
    </>
  );
}
