'use client';

import { Calendar, CalendarProps, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useMemo } from 'react';
import ShiftCard from '../shiftCard';
import { useWorkScheduleUiStore } from '@/store/uistate/features/timesheet/workSchedule';
import {
  useGetBaselineBands,
  useGetBlueprints,
  useGetMockEmployees,
  useGetShiftInstances,
} from '@/store/server/features/timesheet/workSchedule/queries';
import {
  DATE_FORMAT,
  formatTimeRange,
} from '@/store/server/features/timesheet/workSchedule/helpers';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/mockService';

const RosterCalendar = () => {
  const {
    rosterMonth,
    setRosterMonth,
    rosterEmployeeId,
    setRosterEmployeeId,
    rosterBlueprintId,
    setRosterBlueprintId,
    openInstanceDrawer,
  } = useWorkScheduleUiStore();

  const month = dayjs(rosterMonth);
  const from = month.startOf('month').format(DATE_FORMAT);
  const to = month.endOf('month').format(DATE_FORMAT);
  const filters = {
    from,
    to,
    userId: rosterEmployeeId || undefined,
    blueprintId: rosterBlueprintId || undefined,
  };

  const { data: instances = [] } = useGetShiftInstances(filters);
  const { data: baselineBands = [] } = useGetBaselineBands(filters);
  const { data: employees = [] } = useGetMockEmployees();
  const { data: blueprints = [] } = useGetBlueprints();

  const instancesByDate = useMemo(() => {
    const map = new Map<string, typeof instances>();
    for (const instance of instances) {
      const list = map.get(instance.date) || [];
      list.push(instance);
      map.set(instance.date, list);
    }
    return map;
  }, [instances]);

  const bandsByDate = useMemo(() => {
    const map = new Map<string, typeof baselineBands>();
    for (const band of baselineBands) {
      const list = map.get(band.date) || [];
      list.push(band);
      map.set(band.date, list);
    }
    return map;
  }, [baselineBands]);

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
    if (info.type !== 'date') return null;
    const key = current.format(DATE_FORMAT);
    const dayInstances = instancesByDate.get(key) || [];
    const dayBands = bandsByDate.get(key) || [];
    if (!dayInstances.length && !dayBands.length) return null;

    return (
      <div
        className="flex flex-col gap-1 max-h-28 overflow-auto"
        data-cy={`time-attendance-settings-work-schedule-roster-cell-${key}`}
      >
        {dayInstances.slice(0, 2).map((instance) => (
          <ShiftCard
            key={instance.id}
            instance={instance}
            showEmployee
            compact
            onClick={() => openInstanceDrawer(instance.id)}
          />
        ))}
        {dayInstances.length > 2 && (
          <span
            className="text-[10px] text-gray-500"
            data-cy={`time-attendance-settings-work-schedule-roster-more-${key}`}
          >
            +{dayInstances.length - 2} more shifts
          </span>
        )}
        {dayBands.slice(0, 2).map((band) => (
          <div
            key={`${band.blueprint.id}-${band.employee.id}-${band.date}`}
            className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-1.5"
            data-cy={`time-attendance-settings-work-schedule-roster-band-${band.employee.id}-${band.date}`}
          >
            <div
              className="text-[10px] font-semibold text-[#4d4d4d]"
              data-cy={`time-attendance-settings-work-schedule-roster-band-time-${band.date}`}
            >
              {formatTimeRange(band.startTime, band.endTime)}
            </div>
            <div
              className="text-[10px] text-gray-500 truncate"
              data-cy={`time-attendance-settings-work-schedule-roster-band-name-${band.date}`}
            >
              {band.blueprint.title} · {getEmployeeDisplayName(band.employee)}
            </div>
            <div
              className="text-[10px] text-gray-400"
              data-cy={`time-attendance-settings-work-schedule-roster-band-label-${band.date}`}
            >
              Baseline
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="border border-[#D9D9D9] rounded-lg p-4"
      data-cy="time-attendance-settings-work-schedule-roster"
      id="time-attendance-settings-work-schedule-roster"
    >
      <div
        className="flex flex-col lg:flex-row gap-3 mb-4"
        data-cy="time-attendance-settings-work-schedule-roster-filters"
      >
        <Select
          allowClear
          placeholder="Filter by employee"
          className="w-full lg:w-64"
          value={rosterEmployeeId || undefined}
          onChange={(value) => setRosterEmployeeId(value || null)}
          options={employees.map((item) => ({
            value: item.id,
            label: getEmployeeDisplayName(item),
          }))}
          data-cy="time-attendance-settings-work-schedule-roster-employee-filter"
        />
        <Select
          allowClear
          placeholder="Filter by schedule"
          className="w-full lg:w-64"
          value={rosterBlueprintId || undefined}
          onChange={(value) => setRosterBlueprintId(value || null)}
          options={blueprints.map((item) => ({
            value: item.id,
            label: item.title,
          }))}
          data-cy="time-attendance-settings-work-schedule-roster-blueprint-filter"
        />
      </div>
      <Calendar
        value={month}
        onPanelChange={(value) =>
          setRosterMonth(value.startOf('month').format(DATE_FORMAT))
        }
        onChange={(value) =>
          setRosterMonth(value.startOf('month').format(DATE_FORMAT))
        }
        cellRender={cellRender}
      />
    </div>
  );
};

export default RosterCalendar;
