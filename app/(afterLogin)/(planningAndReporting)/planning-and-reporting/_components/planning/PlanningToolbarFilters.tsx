'use client';

import classNames from 'classnames';
import { Select } from 'antd';
import React from 'react';
import PlanningEmployeeFilterSelect from './PlanningEmployeeFilterSelect';
import { planTaskStatusOptions } from './planningTaskStatusFilter';
import { usePlanningToolbarFilters } from './usePlanningToolbarFilters';

const inlineFilterSelectClass = classNames(
  'planning-inline-filter-select min-w-[128px] max-w-[200px]',
  '[&_.ant-select-selector]:!h-9 [&_.ant-select-selector]:!min-h-9',
  '[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E5E7EB]',
  '[&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!px-3',
  '[&_.ant-select-selector]:!text-[13px] [&_.ant-select-selector]:!font-medium',
  '[&_.ant-select-selection-item]:!text-[#161A2C] [&_.ant-select-selection-item]:!leading-9',
  '[&_.ant-select-selection-placeholder]:!text-[#8F94A3] [&_.ant-select-selection-placeholder]:!leading-9',
  '[&.ant-select-focused_.ant-select-selector]:!border-[#BFDBFE]',
  '[&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(30,64,175,0.1)]',
  '[&.ant-select-open_.ant-select-selector]:!border-[#BFDBFE]',
);

function filterLabel(
  options: { label: string; value: string }[],
  value: string | undefined | null,
  fallback: string,
): string {
  if (!value) return fallback;
  return options.find((o) => o.value === value)?.label ?? fallback;
}

export default function PlanningToolbarFilters() {
  const {
    departmentOptions,
    planningTaskStatusFilter,
    planningFilterDepartment,
    handleDepartmentChange,
    handleTaskStatusChange,
  } = usePlanningToolbarFilters();

  return (
    <div
      className="flex flex-wrap items-center justify-end gap-2"
      data-cy="planning-inline-filters"
    >
      <Select
        id="planning-department-select"
        data-cy="planning-department-select"
        className={inlineFilterSelectClass}
        placeholder="Department"
        options={departmentOptions}
        value={planningFilterDepartment ?? 'all'}
        onChange={handleDepartmentChange}
        size="middle"
        showSearch
        optionFilterProp="label"
        popupMatchSelectWidth={false}
        aria-label={filterLabel(
          departmentOptions,
          planningFilterDepartment ?? 'all',
          'Department',
        )}
      />

      <Select
        data-cy="planning-task-status-select"
        className={inlineFilterSelectClass}
        placeholder="Status"
        options={planTaskStatusOptions}
        value={planningTaskStatusFilter}
        onChange={handleTaskStatusChange}
        size="middle"
        popupMatchSelectWidth={false}
        aria-label={filterLabel(
          planTaskStatusOptions,
          planningTaskStatusFilter,
          'Status',
        )}
      />

      <PlanningEmployeeFilterSelect />
    </div>
  );
}
