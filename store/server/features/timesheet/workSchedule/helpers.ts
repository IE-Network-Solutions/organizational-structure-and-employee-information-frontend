import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  MockEmployee,
  SHIFT_TYPE_LABEL,
  ShiftInstance,
  ShiftType,
  Weekday,
  WEEKDAYS,
  WorkScheduleBlueprint,
  WorkScheduleShift,
} from '@/types/timesheet/workSchedule';

dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);

export const TIME_FORMAT = 'HH:mm';
export const DATE_FORMAT = 'YYYY-MM-DD';
export const INSTANCE_HORIZON_MONTHS = 6;

export function rollingScheduleWindow(params?: {
  assignedFrom?: string;
  assignedTo?: string;
}): { from: string; to: string } {
  const defaultFrom = dayjs().startOf('month');
  const defaultTo = dayjs()
    .add(INSTANCE_HORIZON_MONTHS, 'month')
    .endOf('month');
  const from = params?.assignedFrom ? dayjs(params.assignedFrom) : defaultFrom;
  const to = params?.assignedTo ? dayjs(params.assignedTo) : defaultTo;
  return {
    from: from.format(DATE_FORMAT),
    to: to.format(DATE_FORMAT),
  };
}

export function weekdayFromDate(date: string | Dayjs): Weekday {
  const d = typeof date === 'string' ? dayjs(date) : date;
  return WEEKDAYS[d.day()];
}

export function parseTime(value: string): Dayjs {
  const hhmm = value.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    return dayjs()
      .hour(Number(hhmm[1]))
      .minute(Number(hhmm[2]))
      .second(0)
      .millisecond(0);
  }
  const parsed = dayjs(value, [TIME_FORMAT, 'h:mm A', 'hh:mm A'], true);
  return parsed.isValid() ? parsed : dayjs(value, TIME_FORMAT);
}

export function formatTime(value: string): string {
  const parsed = parseTime(value);
  return parsed.isValid() ? parsed.format(TIME_FORMAT) : value;
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function durationHours(startTime: string, endTime: string): number {
  const start = parseTime(startTime);
  let end = parseTime(endTime);
  if (!start.isValid() || !end.isValid()) return 0;
  if (!end.isAfter(start)) {
    end = end.add(1, 'day');
  }
  return Number(end.diff(start, 'hour', true).toFixed(2));
}

export function midpointTime(startTime: string, endTime: string): string {
  const start = parseTime(startTime);
  let end = parseTime(endTime);
  if (!start.isValid() || !end.isValid()) return startTime;
  if (!end.isAfter(start)) {
    end = end.add(1, 'day');
  }
  const mid = start.add(end.diff(start) / 2, 'millisecond');
  return mid.format(TIME_FORMAT);
}

export function halfDayTimes(
  startTime: string,
  endTime: string,
  type: 'AM_HALF' | 'PM_HALF',
): { startTime: string; endTime: string; shiftType: ShiftType } {
  const mid = midpointTime(startTime, endTime);
  if (type === 'AM_HALF') {
    return {
      startTime: formatTime(startTime),
      endTime: mid,
      shiftType: 'AM_HALF',
    };
  }
  return {
    startTime: mid,
    endTime: formatTime(endTime),
    shiftType: 'PM_HALF',
  };
}

export function inferShiftType(name: string): ShiftType {
  const normalized = name.trim().toLowerCase();
  if (normalized === 'morning') return 'AM_HALF';
  if (normalized === 'afternoon') return 'PM_HALF';
  if (normalized.includes('full')) return 'FULL_DAY';
  return 'CUSTOM';
}

export function shiftLabel(
  instance: Pick<ShiftInstance, 'shiftName' | 'shiftType'>,
): string {
  return instance.shiftName?.trim() || SHIFT_TYPE_LABEL[instance.shiftType];
}

export function shiftsForWeekday(
  blueprint: Pick<WorkScheduleBlueprint, 'shifts'>,
  weekday: Weekday,
): WorkScheduleShift[] {
  return (blueprint.shifts || []).filter((shift) =>
    shift.weekdays.includes(weekday),
  );
}

export function minutesFromMidnight(time: string): number {
  const parsed = parseTime(time);
  if (!parsed.isValid()) return 0;
  return parsed.hour() * 60 + parsed.minute();
}

export function timeFromMinutes(minutes: number): string {
  const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export interface TimeGap {
  startTime: string;
  endTime: string;
  hours: number;
}

export function unallocatedGaps(
  dayStart: string,
  dayEnd: string,
  shifts: Array<{ startTime: string; endTime: string }>,
): TimeGap[] {
  const windowStart = minutesFromMidnight(dayStart);
  let windowEnd = minutesFromMidnight(dayEnd);
  if (windowEnd <= windowStart) windowEnd += 24 * 60;

  const intervals = shifts
    .map((shift) => {
      const start = minutesFromMidnight(shift.startTime);
      let end = minutesFromMidnight(shift.endTime);
      if (end <= start) end += 24 * 60;
      return { start, end };
    })
    .filter((item) => item.end > windowStart && item.start < windowEnd)
    .map((item) => ({
      start: Math.max(item.start, windowStart),
      end: Math.min(item.end, windowEnd),
    }))
    .sort((a, b) => a.start - b.start);

  const merged: Array<{ start: number; end: number }> = [];
  for (const interval of intervals) {
    const last = merged[merged.length - 1];
    if (!last || interval.start > last.end) {
      merged.push({ ...interval });
    } else {
      last.end = Math.max(last.end, interval.end);
    }
  }

  const gaps: TimeGap[] = [];
  let cursor = windowStart;
  for (const block of merged) {
    if (block.start > cursor) {
      gaps.push({
        startTime: timeFromMinutes(cursor),
        endTime: timeFromMinutes(block.start),
        hours: Number(((block.start - cursor) / 60).toFixed(2)),
      });
    }
    cursor = Math.max(cursor, block.end);
  }
  if (cursor < windowEnd) {
    gaps.push({
      startTime: timeFromMinutes(cursor),
      endTime: timeFromMinutes(windowEnd),
      hours: Number(((windowEnd - cursor) / 60).toFixed(2)),
    });
  }
  return gaps;
}

export function remainingHoursForWeekday(
  dayStart: string,
  dayEnd: string,
  shifts: Array<{ startTime: string; endTime: string; weekdays: Weekday[] }>,
  weekday: Weekday,
): number {
  const total = durationHours(dayStart, dayEnd);
  const used = shifts
    .filter((shift) => shift.weekdays.includes(weekday))
    .reduce(
      (sum, shift) => sum + durationHours(shift.startTime, shift.endTime),
      0,
    );
  return Math.max(0, Number((total - used).toFixed(2)));
}

export function formatHours(hours: number): string {
  if (hours <= 0) return '0h';
  return `${Number(hours.toFixed(2))}h`;
}

export function suggestShiftTimes(
  preset: string,
  dayStart: string,
  dayEnd: string,
): { startTime: string; endTime: string } {
  const start = formatTime(dayStart);
  const end = formatTime(dayEnd);
  const mid = midpointTime(start, end);
  const normalized = preset.trim().toLowerCase();
  if (normalized === 'morning') {
    return { startTime: start, endTime: mid };
  }
  if (normalized === 'afternoon') {
    return { startTime: mid, endTime: end };
  }
  if (normalized === 'evening' || normalized === 'night') {
    return { startTime: mid, endTime: end };
  }
  return { startTime: start, endTime: end };
}

export function isTimeWithinWindow(
  startTime: string,
  endTime: string,
  windowStart: string,
  windowEnd: string,
): boolean {
  const start = minutesFromMidnight(startTime);
  let end = minutesFromMidnight(endTime);
  const from = minutesFromMidnight(windowStart);
  let to = minutesFromMidnight(windowEnd);
  if (end <= start) end += 24 * 60;
  if (to <= from) to += 24 * 60;
  return start >= from && end <= to && end > start;
}

export function timesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const aStart = parseTime(startA);
  let aEnd = parseTime(endA);
  const bStart = parseTime(startB);
  let bEnd = parseTime(endB);
  if (!aEnd.isAfter(aStart)) aEnd = aEnd.add(1, 'day');
  if (!bEnd.isAfter(bStart)) bEnd = bEnd.add(1, 'day');
  return aStart.isBefore(bEnd) && bStart.isBefore(aEnd);
}

export function instanceDateTime(
  instance: Pick<ShiftInstance, 'date' | 'startTime'>,
): Dayjs {
  const time = formatTime(instance.startTime);
  return dayjs(`${instance.date} ${time}`, `${DATE_FORMAT} ${TIME_FORMAT}`);
}

export function isInstanceInPast(
  instance: Pick<ShiftInstance, 'date' | 'startTime'>,
): boolean {
  return instanceDateTime(instance).isBefore(dayjs());
}

export function eachDateInRange(from: string, to: string): string[] {
  const dates: string[] = [];
  let current = dayjs(from);
  const end = dayjs(to);
  if (!current.isValid() || !end.isValid() || current.isAfter(end))
    return dates;
  while (current.isSameOrBefore(end, 'day')) {
    dates.push(current.format(DATE_FORMAT));
    current = current.add(1, 'day');
  }
  return dates;
}

export function isoWeekRange(date: string): { from: string; to: string } {
  const d = dayjs(date);
  return {
    from: d.startOf('isoWeek').format(DATE_FORMAT),
    to: d.endOf('isoWeek').format(DATE_FORMAT),
  };
}

export function employeeDisplayName(
  firstName: string,
  lastName: string,
): string {
  return `${firstName} ${lastName}`.trim();
}

export function getEmployeeDisplayName(employee: MockEmployee): string {
  return employeeDisplayName(employee.firstName, employee.lastName);
}

export function makeInstanceId(
  blueprintId: string,
  userId: string,
  date: string,
  shiftId?: string,
): string {
  return shiftId
    ? `si-${blueprintId}-${userId}-${date}-${shiftId}`
    : `si-${blueprintId}-${userId}-${date}`;
}
