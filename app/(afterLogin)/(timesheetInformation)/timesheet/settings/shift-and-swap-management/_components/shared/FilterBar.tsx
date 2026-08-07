'use client';

import { Button, DatePicker, Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useShiftSwapStore } from '@/store/uistate/features/timesheet/shiftSwap';
import { ShiftTemplate } from '@/types/timesheet/shiftSwap';
import { DirectoryPerson } from './utils';

const { RangePicker } = DatePicker;

type FilterBarProps = {
  people: DirectoryPerson[];
  templates: ShiftTemplate[];
  compact?: boolean;
};

const FilterBar = ({ people, templates, compact = false }: FilterBarProps) => {
  const { filters, setFilters, resetFilters } = useShiftSwapStore();

  const departments = Array.from(
    new Map(
      people
        .filter((person) => person.departmentId)
        .map((person) => [
          person.departmentId,
          { value: person.departmentId, label: person.departmentName },
        ]),
    ).values(),
  );
  const locations = Array.from(
    new Map(
      people
        .filter((person) => person.locationId)
        .map((person) => [
          person.locationId,
          { value: person.locationId, label: person.locationName },
        ]),
    ).values(),
  );
  const teams = Array.from(
    new Map(
      people
        .filter((person) => person.teamId)
        .map((person) => [
          person.teamId,
          { value: person.teamId, label: person.teamName },
        ]),
    ).values(),
  );

  return (
    <div
      className={`grid grid-cols-1 ${compact ? 'md:grid-cols-3' : 'md:grid-cols-3 xl:grid-cols-7'} gap-3`}
      id="time-attendance-settings-shift-swap-filter-bar"
      data-cy="time-attendance-settings-shift-swap-filter-bar"
    >
      <Input
        placeholder="Search employee, team, shift"
        className="h-10"
        allowClear
        prefix={<SearchOutlined className="text-gray-400" />}
        value={filters.search}
        onChange={(event) => setFilters({ search: event.target.value })}
        id="time-attendance-settings-shift-swap-search"
        data-cy="time-attendance-settings-shift-swap-search"
      />
      <Select
        allowClear
        showSearch
        optionFilterProp="label"
        className="w-full h-10"
        placeholder="Employee"
        value={filters.employeeId}
        options={people.map((person) => ({
          value: person.id,
          label: person.name,
        }))}
        onChange={(value) => setFilters({ employeeId: value })}
        id="time-attendance-settings-shift-swap-filter-employee"
        data-cy="time-attendance-settings-shift-swap-filter-employee"
      />
      <Select
        allowClear
        showSearch
        optionFilterProp="label"
        className="w-full h-10"
        placeholder="Department"
        value={filters.departmentId}
        options={departments}
        onChange={(value) => setFilters({ departmentId: value })}
        id="time-attendance-settings-shift-swap-filter-department"
        data-cy="time-attendance-settings-shift-swap-filter-department"
      />
      {!compact && (
        <>
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            className="w-full h-10"
            placeholder="Location"
            value={filters.locationId}
            options={locations}
            onChange={(value) => setFilters({ locationId: value })}
            id="time-attendance-settings-shift-swap-filter-location"
            data-cy="time-attendance-settings-shift-swap-filter-location"
          />
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            className="w-full h-10"
            placeholder="Team"
            value={filters.teamId}
            options={teams}
            onChange={(value) => setFilters({ teamId: value })}
            id="time-attendance-settings-shift-swap-filter-team"
            data-cy="time-attendance-settings-shift-swap-filter-team"
          />
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            className="w-full h-10"
            placeholder="Shift type"
            value={filters.shiftTemplateId}
            options={templates.map((template) => ({
              value: template.id,
              label: template.name,
            }))}
            onChange={(value) => setFilters({ shiftTemplateId: value })}
            id="time-attendance-settings-shift-swap-filter-shift"
            data-cy="time-attendance-settings-shift-swap-filter-shift"
          />
          <RangePicker
            className="w-full h-10"
            value={
              filters.dateFrom && filters.dateTo
                ? [dayjs(filters.dateFrom), dayjs(filters.dateTo)]
                : null
            }
            onChange={(values) =>
              setFilters({
                dateFrom: values?.[0]?.format('YYYY-MM-DD'),
                dateTo: values?.[1]?.format('YYYY-MM-DD'),
              })
            }
            id="time-attendance-settings-shift-swap-filter-dates"
            data-cy="time-attendance-settings-shift-swap-filter-dates"
          />
        </>
      )}
      <Button
        className="h-10 border border-[#D9D9D9] text-[#4d4d4d]"
        onClick={resetFilters}
        id="time-attendance-settings-shift-swap-filter-reset"
        data-cy="time-attendance-settings-shift-swap-filter-reset"
      >
        Reset
      </Button>
    </div>
  );
};

export default FilterBar;
