'use client';
import React, { useMemo, useState } from 'react';
import { Button, Checkbox, Input, Popover } from 'antd';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { UserAvatar } from './TaskBadges';
import { PersonOption } from './useDeadlinePeople';

interface AssigneePickerProps {
  userId: string;
  people: PersonOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

/** "Me +N" chip that opens a searchable multi-select of assignees. */
export default function AssigneePicker({
  userId,
  people,
  selectedIds,
  onChange,
}: AssigneePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = useMemo(() => new Set(selectedIds), [selectedIds]);
  const visiblePeople = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term
      ? people.filter((person) => person.name.toLowerCase().includes(term))
      : people;
  }, [people, search]);

  const firstSelected =
    people.find((person) => person.id === userId && selected.has(userId)) ??
    people.find((person) => selected.has(person.id));
  const othersCount = firstSelected ? selectedIds.length - 1 : 0;

  const toggle = (id: string, checked: boolean) =>
    onChange(
      checked
        ? [...selectedIds, id]
        : selectedIds.filter((selectedId) => selectedId !== id),
    );

  const content = (
    <div
      data-cy="deadline-assignee-picker"
      className="flex w-72 flex-col gap-2"
    >
      <Input
        allowClear
        prefix={<SearchOutlined className="text-slate-400" />}
        placeholder="Search people"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        data-cy="deadline-assignee-search"
      />
      <div
        data-cy="deadline-assignee-bulk"
        className="flex items-center justify-between text-xs"
      >
        <span data-cy="deadline-assignee-count" className="text-slate-500">
          {selectedIds.length} selected
        </span>
        <span
          data-cy="deadline-assignee-bulk-actions"
          className="inline-flex gap-1"
        >
          <Button
            type="link"
            size="small"
            onClick={() => onChange(people.map((person) => person.id))}
            data-cy="deadline-assignee-select-all"
          >
            Select all
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => onChange([userId])}
            data-cy="deadline-assignee-only-me"
          >
            Only me
          </Button>
        </span>
      </div>
      <div
        data-cy="deadline-assignee-options"
        className="flex max-h-72 flex-col overflow-y-auto"
      >
        {visiblePeople.map((person) => (
          <label
            key={person.id}
            data-cy={`deadline-assignee-option-${person.id}`}
            className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1.5 hover:bg-slate-50"
          >
            <Checkbox
              checked={selected.has(person.id)}
              onChange={(event) => toggle(person.id, event.target.checked)}
            />
            <UserAvatar name={person.name} size="sm" />
            <span
              data-cy="deadline-assignee-option-text"
              className="flex min-w-0 flex-col"
            >
              <span
                data-cy="deadline-assignee-option-name"
                className="truncate text-sm text-slate-700"
              >
                {person.id === userId ? `${person.name} (You)` : person.name}
              </span>
              {person.departmentName ? (
                <span
                  data-cy="deadline-assignee-option-department"
                  className="truncate text-xs text-slate-400"
                >
                  {person.departmentName}
                </span>
              ) : null}
            </span>
          </label>
        ))}
        {visiblePeople.length === 0 ? (
          <span
            data-cy="deadline-assignee-empty"
            className="px-1 py-3 text-sm text-slate-400"
          >
            No one matches that search.
          </span>
        ) : null}
      </div>
    </div>
  );

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      content={content}
    >
      <button
        type="button"
        data-cy="deadline-assignee-trigger"
        aria-label="Choose assignees"
        className="inline-flex h-10 min-w-[200px] max-w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2 text-sm hover:border-slate-300"
      >
        <span
          data-cy="deadline-assignee-summary"
          className="inline-flex min-w-0 items-center gap-2"
        >
          {firstSelected ? (
            <span
              data-cy="deadline-assignee-chip"
              className="inline-flex min-w-0 items-center gap-1.5 rounded-md bg-slate-100 py-0.5 pl-1 pr-2"
            >
              <UserAvatar name={firstSelected.name} size="sm" />
              <span
                data-cy="deadline-assignee-chip-name"
                className="truncate text-slate-700"
              >
                {firstSelected.id === userId
                  ? `${firstSelected.name} (You)`
                  : firstSelected.name}
              </span>
            </span>
          ) : (
            <span data-cy="deadline-assignee-none" className="text-slate-400">
              No one selected
            </span>
          )}
          {othersCount > 0 ? (
            <span
              data-cy="deadline-assignee-more"
              className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700"
            >
              +{othersCount}
            </span>
          ) : null}
        </span>
        <DownOutlined className="text-xs text-slate-400" />
      </button>
    </Popover>
  );
}
