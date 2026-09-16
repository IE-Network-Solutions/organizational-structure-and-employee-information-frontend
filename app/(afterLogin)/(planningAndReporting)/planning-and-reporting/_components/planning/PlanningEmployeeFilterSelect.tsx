'use client';

import classNames from 'classnames';
import { Avatar, Checkbox, Select } from 'antd';
import type { SelectProps } from 'antd';
import React, { useMemo } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  formatSelfPlanningPersonLabel,
  initialsFromName,
  selfPersonBaseName,
  type AssigneeChip,
} from './assigneeChipRoster';
import { useAssigneeChipRoster } from './useAssigneeChipRoster';
import { useAssigneePickerScope } from './useAssigneePickerScope';
import { usePlanningToolbarFilters } from './usePlanningToolbarFilters';

const employeeSelectClass = classNames(
  'planning-inline-filter-select planning-employee-filter-select min-w-[220px] max-w-[360px] sm:min-w-[260px]',
  '[&_.ant-select-selector]:!h-9 [&_.ant-select-selector]:!min-h-9',
  '[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E5E7EB]',
  '[&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!px-2',
  '[&_.ant-select-selector]:!text-[13px] [&_.ant-select-selector]:!font-medium',
  '[&_.ant-select-selection-placeholder]:!text-[#8F94A3] [&_.ant-select-selection-placeholder]:!leading-9',
  '[&_.ant-select-selection-overflow]:!flex-nowrap [&_.ant-select-selection-overflow]:!items-center [&_.ant-select-selection-overflow]:!gap-1',
  '[&_.ant-select-selection-item]:!m-0 [&_.ant-select-selection-item]:!h-auto [&_.ant-select-selection-item]:!max-w-[calc(100%-2.5rem)] [&_.ant-select-selection-item]:!bg-transparent [&_.ant-select-selection-item]:!p-0',
  '[&_.ant-select-selection-item-remove]:!hidden',
  '[&_.ant-select-selection-overflow-item-rest]:!m-0',
  '[&.ant-select-focused_.ant-select-selector]:!border-[#BFDBFE]',
  '[&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(30,64,175,0.1)]',
  '[&.ant-select-open_.ant-select-selector]:!border-[#BFDBFE]',
);

const employeeSelectPopupClass = classNames(
  'planning-employee-filter-popup',
  '[&_.ant-select-item-option-selected:not(.ant-select-item-option-disabled)]:!bg-transparent',
  '[&_.ant-select-item-option-selected:not(.ant-select-item-option-disabled)]:!font-normal',
  '[&_.ant-select-item-option-active:not(.ant-select-item-option-disabled)]:!bg-[#F9FAFB]',
);

function AssigneeFilterAvatar({
  chip,
  size = 20,
}: {
  chip: AssigneeChip;
  size?: number;
}) {
  return (
    <Avatar
      size={size}
      src={chip.avatar}
      className="shrink-0"
      style={
        chip.avatar
          ? undefined
          : {
              backgroundColor: chip.isSelf ? '#DBEAFE' : '#F3F4F6',
              color: chip.isSelf ? '#1E40AF' : '#6B7280',
              fontSize: chip.isSelf ? 8 : 9,
              fontWeight: 600,
            }
      }
    >
      {!chip.avatar ? chip.initials : null}
    </Avatar>
  );
}

function chipForOption(
  userId: string,
  label: string,
  chipByUserId: Map<string, AssigneeChip>,
  viewerUserId: string,
): AssigneeChip {
  const isSelf = String(userId) === String(viewerUserId);
  const baseName = selfPersonBaseName(label);
  return (
    chipByUserId.get(userId) ?? {
      userId,
      label: isSelf ? formatSelfPlanningPersonLabel(baseName || label) : label,
      initials: initialsFromName(baseName || label),
      isSelf,
    }
  );
}

export default function PlanningEmployeeFilterSelect() {
  const { userId } = useAuthenticationStore();
  const viewerUserId = String(userId ?? '');
  const { roster } = useAssigneeChipRoster();
  const { subordinates, allEmployees } = useAssigneePickerScope();
  const { employeeOptions, selectedEmployeeValues, handleEmployeesChange } =
    usePlanningToolbarFilters();

  const chipByUserId = useMemo(() => {
    const map = new Map<string, AssigneeChip>();
    for (const chip of [...roster, ...subordinates, ...allEmployees]) {
      map.set(chip.userId, chip);
    }
    return map;
  }, [roster, subordinates, allEmployees]);

  const selectedValues = useMemo(() => {
    return [...selectedEmployeeValues].sort((a, b) => {
      if (String(a) === viewerUserId) return -1;
      if (String(b) === viewerUserId) return 1;
      return 0;
    });
  }, [selectedEmployeeValues, viewerUserId]);

  const selectedSet = useMemo(
    () => new Set(selectedValues.map(String)),
    [selectedValues],
  );

  const tagRender: SelectProps['tagRender'] = (props) => {
    const { label, value, closable, onClose } = props;
    const labelText =
      typeof label === 'string' || typeof label === 'number'
        ? String(label)
        : '';

    if (/^\+\d+$/.test(labelText.trim())) {
      return (
        <span
          className="inline-flex shrink-0 items-center rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#4338CA]"
          data-cy="planning-employee-tag-overflow"
        >
          {labelText}
        </span>
      );
    }

    const chip = chipForOption(
      String(value),
      labelText,
      chipByUserId,
      viewerUserId,
    );

    return (
      <span
        className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-[#F3F4F6] py-0.5 pl-0.5 pr-1.5"
        data-cy={`planning-employee-tag-${chip.userId}`}
      >
        <AssigneeFilterAvatar chip={chip} size={18} />
        <span
          className="truncate text-[12px] font-medium text-[#161A2C]"
          data-cy={`planning-employee-tag-label-${chip.userId}`}
        >
          {chip.label}
        </span>
        {closable ? (
          <button
            type="button"
            onClick={onClose}
            className="ml-0.5 shrink-0 text-[11px] leading-none text-[#8F94A3] hover:text-[#161A2C]"
            aria-label={`Remove ${chip.label}`}
            data-cy={`planning-employee-tag-remove-${chip.userId}`}
          >
            ×
          </button>
        ) : null}
      </span>
    );
  };

  const maxTagPlaceholder: SelectProps['maxTagPlaceholder'] = (omittedValues) =>
    `+${omittedValues.length}`;

  const optionRender: SelectProps['optionRender'] = (option) => {
    const chip = chipForOption(
      String(option.value ?? ''),
      String(option.label ?? ''),
      chipByUserId,
      viewerUserId,
    );
    const checked = selectedSet.has(String(option.value));

    return (
      <div
        className="flex min-w-0 items-center gap-2.5 py-0.5"
        data-cy={`planning-employee-option-${chip.userId}`}
      >
        <Checkbox
          checked={checked}
          className="pointer-events-none shrink-0"
          tabIndex={-1}
        />
        <AssigneeFilterAvatar chip={chip} size={24} />
        <span
          className="min-w-0 truncate text-[13px] text-[#161A2C]"
          data-cy={`planning-employee-option-label-${chip.userId}`}
        >
          {chip.label}
        </span>
      </div>
    );
  };

  return (
    <Select
      mode="multiple"
      data-cy="planning-employee-select"
      className={employeeSelectClass}
      popupClassName={employeeSelectPopupClass}
      placeholder="All employees"
      options={employeeOptions}
      value={selectedValues}
      onChange={handleEmployeesChange}
      allowClear
      maxTagCount={1}
      maxTagPlaceholder={maxTagPlaceholder}
      size="middle"
      showSearch
      optionFilterProp="label"
      optionLabelProp="label"
      popupMatchSelectWidth={false}
      menuItemSelectedIcon={null}
      tagRender={tagRender}
      optionRender={optionRender}
      aria-label="Employee"
    />
  );
}
