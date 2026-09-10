'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Input, Modal, message } from 'antd';
import { PlusOutlined, CloseOutlined, LockOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import {
  formatDate,
  todayIso,
  validateDailySubtask,
  validateWeeklySubtask,
} from '@/app/(afterLogin)/dashboard/_components/plan/deadline/bucket';
import type { DeadlineKind } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';
import {
  childCapForParent,
  childKindForParent,
} from '../prototype/mockPlanningConstants';
import {
  useUserPlanRepositoryMock,
  type MockPlanTask,
} from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';

type DraftRow = {
  id: string;
  title: string;
  start: Dayjs | null;
  deadline: Dayjs | null;
};

function newDraftId() {
  return typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `draft-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyDraft(parent: MockPlanTask, childKind: DeadlineKind): DraftRow {
  const start = dayjs(parent.start);
  return {
    id: newDraftId(),
    title: '',
    start,
    deadline: childKind === 'daily' ? start : dayjs(parent.deadline),
  };
}

function childKindLabel(kind: DeadlineKind | null): string {
  if (kind === 'daily') return 'daily';
  if (kind === 'week') return 'weekly';
  return 'subtask';
}

type SubtasksModalProps = {
  open: boolean;
  parent: MockPlanTask | null;
  ownerUserId: string;
  allActiveTasks: MockPlanTask[];
  canAdd?: boolean;
  onClose: () => void;
};

export default function SubtasksModal({
  open,
  parent,
  ownerUserId,
  allActiveTasks,
  canAdd = true,
  onClose,
}: SubtasksModalProps) {
  const appendTask = useUserPlanRepositoryMock((s) => s.appendTask);
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  const childKind = parent ? childKindForParent(parent.kind) : null;
  const cap = parent
    ? childCapForParent(parent.kind, parent.start, parent.deadline)
    : 0;

  const existingChildren = useMemo(() => {
    if (!parent || !childKind) return [];
    return allActiveTasks.filter(
      (t) => t.parentId === parent.id && t.kind === childKind,
    );
  }, [allActiveTasks, childKind, parent]);

  const remainingSlots = Math.max(0, cap - existingChildren.length);

  useEffect(() => {
    if (!open || !parent || !childKind) return;
    setRows([emptyDraft(parent, childKind)]);
    setSubmitting(false);
    const childCount = allActiveTasks.filter(
      (t) => t.parentId === parent.id && t.kind === childKind,
    ).length;
    // No subtasks yet → empty state + create form ready.
    setShowComposer(!!canAdd && childCount === 0);
  }, [open, parent, childKind, canAdd, allActiveTasks]);

  const updateRow = (id: string, patch: Partial<DraftRow>) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const addRow = () => {
    if (!parent || !childKind) return;
    if (rows.length >= remainingSlots) {
      message.warning(`Maximum ${cap} ${childKindLabel(childKind)} subtasks.`);
      return;
    }
    setRows((prev) => [...prev, emptyDraft(parent, childKind)]);
  };

  const removeRow = (id: string) => {
    setRows((prev) =>
      prev.length <= 1 ? prev : prev.filter((r) => r.id !== id),
    );
  };

  const handleSubmit = () => {
    if (!parent || !childKind) return;
    const drafts = rows
      .map((r) => ({
        ...r,
        title: r.title.trim(),
      }))
      .filter((r) => r.title.length > 0);

    if (drafts.length === 0) {
      message.warning('Enter at least one subtask title.');
      return;
    }
    if (drafts.length > remainingSlots) {
      message.warning(
        `Only ${remainingSlots} ${childKindLabel(childKind)} slot(s) left.`,
      );
      return;
    }

    setSubmitting(true);
    let created = 0;
    for (const draft of drafts) {
      const startIso = draft.start ? formatDate(draft.start) : todayIso();
      const deadlineIso =
        childKind === 'daily'
          ? startIso
          : draft.deadline
            ? formatDate(draft.deadline)
            : '';
      if (!deadlineIso) {
        message.warning('Choose an end date for each weekly subtask.');
        setSubmitting(false);
        return;
      }
      if (childKind === 'daily') {
        const valid = validateDailySubtask(parent, startIso);
        if (!valid.ok) {
          message.warning(valid.error);
          setSubmitting(false);
          return;
        }
      } else {
        const valid = validateWeeklySubtask(parent, startIso, deadlineIso);
        if (!valid.ok) {
          message.warning(valid.error);
          setSubmitting(false);
          return;
        }
      }
      const result = appendTask(ownerUserId, {
        title: draft.title,
        start: startIso,
        deadline: deadlineIso,
        parentId: parent.id,
        keyResultId: parent.keyResultId,
        priority: parent.priority ?? 'medium',
      });
      if (!result.ok) {
        message.warning(result.error);
        setSubmitting(false);
        return;
      }
      created += 1;
    }
    message.success(
      created === 1
        ? `${childKindLabel(childKind)} subtask added.`
        : `${created} ${childKindLabel(childKind)} subtasks added.`,
    );
    setSubmitting(false);
    setRows([emptyDraft(parent, childKind)]);
    setShowComposer(false);
  };

  const label = childKindLabel(childKind);

  return (
    <Modal
      title={
        <div
          data-cy="planning-and-reporting-components-cards-subtasksmodal-tsx-subtasksmodal-div-201"
          className="pr-6"
        >
          <p
            data-cy="planning-and-reporting-components-cards-subtasksmodal-tsx-subtasksmodal-p-202"
            className="m-0 text-[16px] font-semibold text-[#161A2C]"
          >
            {parent ? `Subtasks · ${parent.title}` : 'Subtasks'}
          </p>
          <p
            data-cy="planning-and-reporting-components-cards-subtasksmodal-tsx-subtasksmodal-p-205"
            className="m-0 mt-1 text-[12px] font-normal text-[#8F94A3]"
          >
            {existingChildren.length}/{cap} {label} under this{' '}
            {parent?.kind ?? 'parent'}
            {parent ? ` · ${parent.start} → ${parent.deadline}` : ''}
          </p>
        </div>
      }
      open={open && !!parent}
      onCancel={onClose}
      destroyOnClose
      width={560}
      centered
      data-cy="subtasks-modal"
      footer={
        <div
          data-cy="planning-and-reporting-components-cards-subtasksmodal-tsx-subtasksmodal-div-219"
          className="flex items-center justify-between gap-2"
        >
          {canAdd && remainingSlots > 0 && !showComposer ? (
            <Button
              type="link"
              icon={<PlusOutlined />}
              className="!px-0 !text-[#574CFF]"
              onClick={() => setShowComposer(true)}
              data-cy="subtasks-modal-show-composer"
            >
              Add {label}
            </Button>
          ) : (
            <span data-cy="planning-and-reporting-components-cards-subtasksmodal-tsx-subtasksmodal-span-231" />
          )}
          <div
            data-cy="planning-and-reporting-components-cards-subtasksmodal-tsx-subtasksmodal-div-233"
            className="flex gap-2"
          >
            <Button
              onClick={() => {
                if (showComposer && existingChildren.length > 0) {
                  setShowComposer(false);
                  return;
                }
                onClose();
              }}
              disabled={submitting}
            >
              {showComposer && existingChildren.length > 0 ? 'Back' : 'Close'}
            </Button>
            {showComposer && canAdd ? (
              <Button
                type="primary"
                loading={submitting}
                disabled={remainingSlots <= 0}
                onClick={handleSubmit}
                data-cy="subtasks-modal-submit"
                className="!border-[#574CFF] !bg-[#574CFF] hover:!bg-[#4639E8]"
              >
                Add subtasks
              </Button>
            ) : null}
          </div>
        </div>
      }
    >
      <div
        className="mb-3 max-h-[min(45vh,20rem)] space-y-1.5 overflow-y-auto"
        data-cy="subtasks-modal-existing"
      >
        {existingChildren.length === 0 ? (
          <p
            data-cy="planning-and-reporting-components-cards-subtasksmodal-tsx-subtasksmodal-p-267"
            className="m-0 rounded-lg border border-dashed border-[#E5E7EB] bg-[#FAFBFC] px-3 py-4 text-center text-[13px] text-[#8F94A3]"
          >
            No {label} subtasks yet.
          </p>
        ) : (
          existingChildren.map((child) => (
            <div
              key={child.id}
              className="flex items-start justify-between gap-2 rounded-lg border border-[#F1F2F6] bg-white px-3 py-2.5"
              data-cy={`subtasks-modal-child-${child.id}`}
            >
              <div
                data-cy="planning-and-reporting-components-cards-subtasksmodal-tsx-subtasksmodal-div-277"
                className="min-w-0 flex-1"
              >
                <p
                  data-cy="planning-and-reporting-components-cards-subtasksmodal-tsx-subtasksmodal-p-278"
                  className="m-0 truncate text-[13px] font-medium text-[#2D2F45]"
                >
                  {child.title}
                </p>
                <p
                  data-cy="planning-and-reporting-components-cards-subtasksmodal-tsx-subtasksmodal-p-281"
                  className="mb-0 mt-0.5 text-[11px] tabular-nums text-[#8F94A3]"
                >
                  {child.kind === 'daily'
                    ? child.start
                    : `${child.start} → ${child.deadline}`}
                </p>
              </div>
              {child.isLocked ? (
                <span
                  data-cy="subtasks-modal-child-locked"
                  className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded text-[#64748B]"
                  title="Locked"
                >
                  <LockOutlined className="text-[11px]" />
                </span>
              ) : null}
            </div>
          ))
        )}
      </div>

      {showComposer && canAdd ? (
        <div
          data-cy="planning-and-reporting-components-cards-subtasksmodal-tsx-subtasksmodal-div-301"
          className="space-y-2.5 border-t border-[#F1F2F6] pt-3"
        >
          <p
            data-cy="planning-and-reporting-components-cards-subtasksmodal-tsx-subtasksmodal-p-302"
            className="m-0 text-[12px] font-semibold text-[#575B7A]"
          >
            New {label} subtasks
          </p>
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="rounded-xl border border-[#F1F2F6] bg-[#FAFBFC] p-3"
              data-cy={`subtasks-modal-row-${index}`}
            >
              <div
                data-cy="planning-and-reporting-components-cards-subtasksmodal-tsx-subtasksmodal-div-311"
                className="mb-2 flex items-center gap-2"
              >
                <Input
                  placeholder={`${label} title`}
                  value={row.title}
                  onChange={(e) => updateRow(row.id, { title: e.target.value })}
                  data-cy={`subtasks-modal-title-${index}`}
                />
                {rows.length > 1 ? (
                  <button
                    data-cy={`subtasks-modal-remove-row-${index}`}
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                    aria-label="Remove draft row"
                  >
                    <CloseOutlined className="text-[12px]" />
                  </button>
                ) : null}
              </div>
              <div
                data-cy="planning-and-reporting-components-cards-subtasksmodal-tsx-subtasksmodal-div-329"
                className="flex flex-wrap gap-2"
              >
                <DatePicker
                  className="min-w-[140px] flex-1"
                  value={row.start}
                  onChange={(v) => {
                    if (childKind === 'daily') {
                      updateRow(row.id, { start: v, deadline: v });
                    } else {
                      updateRow(row.id, { start: v });
                    }
                  }}
                  placeholder="Start"
                  allowClear={false}
                />
                {childKind !== 'daily' ? (
                  <DatePicker
                    className="min-w-[140px] flex-1"
                    value={row.deadline}
                    onChange={(v) => updateRow(row.id, { deadline: v })}
                    placeholder="End"
                    allowClear={false}
                  />
                ) : null}
              </div>
            </div>
          ))}

          {remainingSlots > rows.length ? (
            <button
              type="button"
              onClick={addRow}
              data-cy="subtasks-modal-add-row"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#D6D3FF] bg-[#FAFBFF] px-3 py-2 text-[13px] font-semibold text-[#574CFF] hover:border-[#574CFF] hover:bg-[#F0EEFF]"
            >
              <PlusOutlined className="text-[12px]" />
              Add another
            </button>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
