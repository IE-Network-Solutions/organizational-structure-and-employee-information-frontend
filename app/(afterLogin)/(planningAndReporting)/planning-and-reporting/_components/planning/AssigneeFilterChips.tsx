'use client';

import { useMemo, useState } from 'react';
import classNames from 'classnames';
import { Avatar, Tooltip } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
  concreteSelectedUserIds,
  mergeMeWithPickerSelection,
  toggleMeInSelection,
  type AssigneeChip,
} from './assigneeChipRoster';
import { useAssigneeChipRoster } from './useAssigneeChipRoster';
import { useAssigneePickerScope } from './useAssigneePickerScope';
import AssigneePickerModal from './AssigneePickerModal';

/** Fixed preview row: Me + this many subordinate slots before … */
const PREVIEW_SLOT_COUNT = 2;

function StackedAvatarButton({
  chip,
  selected,
  stacked,
  zIndex,
  onClick,
  'data-cy': dataCy,
}: {
  chip: AssigneeChip;
  selected: boolean;
  stacked?: boolean;
  zIndex: number;
  onClick: () => void;
  'data-cy'?: string;
}) {
  return (
    <Tooltip title={chip.label}>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        aria-label={chip.label}
        data-cy={dataCy ?? `assignee-chip-${chip.userId}`}
        style={{ zIndex }}
        className={classNames(
          'relative inline-flex shrink-0 rounded-full p-px transition-all hover:z-[30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF]/35 focus-visible:ring-offset-1',
          stacked && '-ml-2',
        )}
      >
        <span
          className={classNames(
            'inline-flex rounded-full',
            selected
              ? 'shadow-[0_0_0_2px_#1E40AF]'
              : 'shadow-[0_0_0_2px_#fff]',
          )}
        >
          <Avatar
            size={24}
            className="h-6 w-6 shrink-0"
            src={chip.avatar}
            style={
              chip.avatar
                ? undefined
                : {
                    backgroundColor: chip.isSelf ? '#DBEAFE' : '#F3F4F6',
                    color: chip.isSelf ? '#1E40AF' : '#6B7280',
                    fontSize: chip.isSelf ? '9px' : '10px',
                    fontWeight: 600,
                  }
            }
            data-cy={`assignee-chip-avatar-${chip.userId}`}
          >
            {!chip.avatar ? chip.initials : null}
          </Avatar>
        </span>
      </button>
    </Tooltip>
  );
}

export default function AssigneeFilterChips() {
  const { userId } = useAuthenticationStore();
  const { selectedIds, roster } = useAssigneeChipRoster();
  const {
    subordinates,
    allEmployees,
    canPickAllEmployees,
    pickerUniverseIds,
  } = useAssigneePickerScope();
  const {
    setSelectedUser,
    setPlanningFilterPlanType,
    setPlanningFilterEmployee,
    setPage,
    setPageReporting,
  } = PlanningAndReportingStore();

  const [pickerOpen, setPickerOpen] = useState(false);

  const currentUserId = String(userId ?? '');
  const meChip = roster.find((c) => c.isSelf);

  const meSelected = useMemo(
    () => selectedIds.some((id) => String(id) === currentUserId),
    [selectedIds, currentUserId],
  );

  const otherSelectedIds = useMemo(
    () => selectedIds.filter((id) => String(id) !== currentUserId),
    [selectedIds, currentUserId],
  );

  const previewSlots = useMemo(
    () => subordinates.slice(0, PREVIEW_SLOT_COUNT),
    [subordinates],
  );

  const chipById = useMemo(() => {
    const map = new Map<string, AssigneeChip>();
    for (const chip of roster) map.set(chip.userId, chip);
    for (const chip of subordinates) map.set(chip.userId, chip);
    for (const chip of allEmployees) map.set(chip.userId, chip);
    return map;
  }, [roster, subordinates, allEmployees]);

  /** Compact Me + 2 preview slots; expand when many others are selected. */
  const useExpandedStack = otherSelectedIds.length > PREVIEW_SLOT_COUNT;

  const stackChips = useMemo(() => {
    if (useExpandedStack) {
      return otherSelectedIds
        .map((id) => chipById.get(String(id)))
        .filter((chip): chip is AssigneeChip => Boolean(chip));
    }
    return previewSlots;
  }, [useExpandedStack, otherSelectedIds, chipById, previewSlots]);

  const showOverflow = subordinates.length > 0 || canPickAllEmployees;

  if (!meChip && !showOverflow) return null;

  const applySelection = (ids: string[]) => {
    setPlanningFilterPlanType('all');
    setPlanningFilterEmployee('all');
    setSelectedUser(ids);
    setPage(1);
    setPageReporting(1);
  };

  const handleMeToggle = () => {
    const normalized = concreteSelectedUserIds(selectedIds).filter((id) =>
      pickerUniverseIds.has(id),
    );
    applySelection(toggleMeInSelection(normalized, currentUserId));
  };

  const handlePickerApply = (otherIds: string[]) => {
    const allowed = otherIds.filter((id) => pickerUniverseIds.has(id));
    applySelection(
      mergeMeWithPickerSelection(meSelected, allowed, currentUserId),
    );
    setPickerOpen(false);
  };

  const handleOtherToggle = (userId: string) => {
    const normalized = concreteSelectedUserIds(selectedIds).filter((id) =>
      pickerUniverseIds.has(id),
    );
    const isSelected = normalized.some((id) => String(id) === String(userId));
    if (isSelected && normalized.length <= 1) return;
    const nextOthers = isSelected
      ? normalized.filter(
          (id) =>
            String(id) !== String(userId) &&
            String(id) !== String(currentUserId),
        )
      : [...normalized.filter((id) => String(id) !== String(currentUserId)), userId];
    applySelection(
      mergeMeWithPickerSelection(meSelected, nextOthers, currentUserId),
    );
  };

  const overflowTitle = useExpandedStack
    ? 'Change selection'
    : subordinates.length > PREVIEW_SLOT_COUNT
      ? `${subordinates.length - PREVIEW_SLOT_COUNT} more people — open picker`
      : 'Choose people';

  return (
    <>
      <div
        className="flex w-full min-w-0 items-center justify-end gap-2.5 pl-1"
        data-cy="assignee-filter-chips-wrap"
      >
        <div
          className="flex min-h-8 min-w-0 items-center justify-end overflow-x-auto overflow-y-visible py-1 pl-0.5 scrollbar-hide"
          data-cy="assignee-filter-chips"
          role="group"
          aria-label="Filter by subordinate"
        >
          {meChip ? (
            <StackedAvatarButton
              chip={meChip}
              selected={meSelected}
              zIndex={10}
              onClick={handleMeToggle}
            />
          ) : null}

          {stackChips.map((chip, index) => (
            <StackedAvatarButton
              key={chip.userId}
              chip={chip}
              selected={
                useExpandedStack ||
                otherSelectedIds.some(
                  (id) => String(id) === String(chip.userId),
                )
              }
              stacked
              zIndex={11 + index}
              onClick={() => handleOtherToggle(chip.userId)}
            />
          ))}

          {showOverflow ? (
            <Tooltip title={overflowTitle}>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                aria-label={overflowTitle}
                data-cy="assignee-chip-overflow"
                style={{ zIndex: 20 + stackChips.length }}
                className="relative -ml-2 inline-flex shrink-0 rounded-full p-px opacity-90 transition-all hover:z-[30] hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF]/35 focus-visible:ring-offset-1"
              >
                <span className="inline-flex rounded-full shadow-[0_0_0_2px_#fff]">
                  <Avatar
                    size={24}
                    className="flex h-6 w-6 shrink-0 items-center justify-center"
                    style={{
                      backgroundColor: '#4B5563',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                    icon={<EllipsisOutlined />}
                    data-cy="assignee-chip-overflow-avatar"
                  />
                </span>
              </button>
            </Tooltip>
          ) : null}
        </div>
      </div>

      <AssigneePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onApply={handlePickerApply}
        initialOtherIds={otherSelectedIds}
        subordinates={subordinates}
        allEmployees={allEmployees}
        canPickAllEmployees={canPickAllEmployees}
      />
    </>
  );
}
