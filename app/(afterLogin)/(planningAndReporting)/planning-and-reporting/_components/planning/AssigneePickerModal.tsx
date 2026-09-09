'use client';

import { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Checkbox, Input, Modal, Tabs } from 'antd';
import type { AssigneeChip } from './assigneeChipRoster';

type AssigneePickerModalProps = {
  open: boolean;
  onClose: () => void;
  onApply: (otherUserIds: string[]) => void;
  initialOtherIds: string[];
  subordinates: AssigneeChip[];
  allEmployees: AssigneeChip[];
  canPickAllEmployees: boolean;
};

function filterChips(chips: AssigneeChip[], query: string): AssigneeChip[] {
  const q = query.trim().toLowerCase();
  if (!q) return chips;
  return chips.filter(
    (chip) =>
      chip.label.toLowerCase().includes(q) ||
      chip.initials.toLowerCase().includes(q),
  );
}

function AssigneeCheckboxList({
  chips,
  selected,
  onChange,
}: {
  chips: AssigneeChip[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  if (chips.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[#8F94A3]">
        No people in this list
      </p>
    );
  }

  return (
    <div className="max-h-[min(52vh,22rem)] overflow-y-auto scrollbar-hide">
      <ul className="space-y-0.5" data-cy="assignee-picker-list">
        {chips.map((chip) => {
          const checked = selected.has(chip.userId);
          return (
            <li key={chip.userId}>
              <label
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#F9FAFB]"
                data-cy={`assignee-picker-row-${chip.userId}`}
              >
                <Checkbox
                  checked={checked}
                  onChange={(e) => {
                    const next = new Set(selected);
                    if (e.target.checked) next.add(chip.userId);
                    else next.delete(chip.userId);
                    onChange(next);
                  }}
                />
                <Avatar
                  size={28}
                  src={chip.avatar}
                  className="shrink-0"
                  style={
                    chip.avatar
                      ? undefined
                      : {
                          backgroundColor: '#F3F4F6',
                          color: '#6B7280',
                          fontSize: '10px',
                          fontWeight: 600,
                        }
                  }
                >
                  {!chip.avatar ? chip.initials : null}
                </Avatar>
                <span className="min-w-0 truncate text-sm text-[#161A2C]">
                  {chip.label}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function AssigneePickerModal({
  open,
  onClose,
  onApply,
  initialOtherIds,
  subordinates,
  allEmployees,
  canPickAllEmployees,
}: AssigneePickerModalProps) {
  const [activeTab, setActiveTab] = useState<'subordinates' | 'all'>(
    'subordinates',
  );
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!open) return;
    setDraft(new Set(initialOtherIds));
    setSearch('');
    setActiveTab('subordinates');
  }, [open, initialOtherIds]);

  const activeList =
    activeTab === 'all' && canPickAllEmployees ? allEmployees : subordinates;

  const filteredSubordinates = useMemo(
    () => filterChips(subordinates, search),
    [subordinates, search],
  );

  const filteredAllEmployees = useMemo(
    () => filterChips(allEmployees, search),
    [allEmployees, search],
  );

  const tabItems = useMemo(() => {
    const items = [
      {
        key: 'subordinates',
        label: `Subordinates (${subordinates.length})`,
        children: (
          <AssigneeCheckboxList
            chips={filteredSubordinates}
            selected={draft}
            onChange={setDraft}
          />
        ),
      },
    ];
    if (canPickAllEmployees) {
      items.push({
        key: 'all',
        label: `All employees (${allEmployees.length})`,
        children: (
          <AssigneeCheckboxList
            chips={filteredAllEmployees}
            selected={draft}
            onChange={setDraft}
          />
        ),
      });
    }
    return items;
  }, [
    subordinates.length,
    allEmployees.length,
    canPickAllEmployees,
    filteredSubordinates,
    filteredAllEmployees,
    draft,
  ]);

  const handleSelectAllTab = () => {
    setDraft((prev) => {
      const next = new Set(prev);
      for (const chip of activeList) next.add(chip.userId);
      return next;
    });
  };

  const handleClearTab = () => {
    setDraft((prev) => {
      const next = new Set(prev);
      for (const chip of activeList) next.delete(chip.userId);
      return next;
    });
  };

  return (
    <Modal
      title="Choose people to show"
      open={open}
      onCancel={onClose}
      destroyOnClose
      width={440}
      centered
      data-cy="assignee-picker-modal"
      footer={
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button
              type="link"
              size="small"
              onClick={handleSelectAllTab}
              className="!p-0 !text-[#1E40AF] hover:!text-[#1E3A8A]"
            >
              Select all
            </Button>
            <Button
              type="link"
              size="small"
              onClick={handleClearTab}
              className="!p-0 !text-[#1E40AF] hover:!text-[#1E3A8A]"
            >
              Clear
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              data-cy="assignee-picker-apply"
              onClick={() => onApply(Array.from(draft))}
            >
              Apply
            </Button>
          </div>
        </div>
      }
    >
      <Input.Search
        allowClear
        placeholder="Search by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3"
        data-cy="assignee-picker-search"
      />
      {canPickAllEmployees ? (
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key as 'subordinates' | 'all');
            setSearch('');
          }}
          items={tabItems}
          size="small"
        />
      ) : (
        <AssigneeCheckboxList
          chips={filteredSubordinates}
          selected={draft}
          onChange={setDraft}
        />
      )}
    </Modal>
  );
}
