'use client';
import React, { useMemo } from 'react';
import { Button, Select } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { PersonOption } from './useDeadlinePeople';

interface AssigneePickerProps {
  userId: string;
  people: PersonOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

/** Multi-select of assignees shown as the first name plus "+N". */
export default function AssigneePicker({
  userId,
  people,
  selectedIds,
  onChange,
}: AssigneePickerProps) {
  const options = useMemo(
    () =>
      people.map((person) => ({
        value: person.id,
        label: person.name,
      })),
    [people],
  );

  return (
    <Select
      mode="multiple"
      size="large"
      className="w-[230px] max-w-full"
      placeholder="Choose assignees"
      value={selectedIds}
      options={options}
      onChange={onChange}
      optionFilterProp="label"
      maxTagCount={1}
      aria-label="Assignees"
      data-cy="deadline-plan-assignees"
      tagRender={({ label, closable, onClose }) => (
        <span
          data-cy="deadline-assignee-tag"
          className="mr-1 inline-flex min-w-0 max-w-[130px] items-center gap-1.5 rounded-md bg-slate-100 py-0.5 pl-1.5 pr-1.5 text-sm text-slate-700"
        >
          <span data-cy="deadline-assignee-tag-name" className="truncate">
            {label}
          </span>
          {closable ? (
            <button
              type="button"
              data-cy="deadline-assignee-tag-remove"
              aria-label={`Remove ${String(label ?? '')}`}
              // Keep the dropdown from toggling when a tag is removed.
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={onClose}
              className="flex items-center text-[10px] text-slate-400 hover:text-slate-600"
            >
              <CloseOutlined />
            </button>
          ) : null}
        </span>
      )}
      maxTagPlaceholder={(omitted) => (
        <span
          data-cy="deadline-assignee-more"
          className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700"
        >
          +{omitted.length}
        </span>
      )}
      dropdownRender={(menu) => (
        <>
          {menu}
          <div
            data-cy="deadline-assignee-bulk"
            className="flex items-center justify-between border-t border-slate-100 px-2 pt-1"
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
          </div>
        </>
      )}
    />
  );
}
