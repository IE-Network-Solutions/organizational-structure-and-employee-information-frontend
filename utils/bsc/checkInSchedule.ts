import dayjs, { Dayjs } from 'dayjs';
import { BscCadence } from '@/types/bsc';

/** Cadences that support a check-in day on the Weights step */
export const KPI_CHECKIN_CADENCES = [
  BscCadence.Weekly,
  BscCadence.BiWeekly,
  BscCadence.Monthly,
] as const;

export type KpiCheckInCadence = (typeof KPI_CHECKIN_CADENCES)[number];

export type CheckInScheduleAnchor = {
  effectiveFrom?: string | Dayjs | null;
  endDate?: string | Dayjs | null;
};

export function isKpiCheckInCadence(
  value: unknown,
): value is KpiCheckInCadence {
  return (
    value === BscCadence.Weekly ||
    value === BscCadence.BiWeekly ||
    value === BscCadence.Monthly
  );
}

/** Monday = 1 … Sunday = 7 */
export const WEEKDAY_OPTIONS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

const CADENCE_MIN_SPAN_DAYS: Record<KpiCheckInCadence, number> = {
  [BscCadence.Weekly]: 7,
  [BscCadence.BiWeekly]: 14,
  [BscCadence.Monthly]: 28,
};

/** Inclusive calendar days between effective date and end date. */
export function scorecardSpanDays(
  effectiveFrom?: string | Dayjs | null,
  endDate?: string | Dayjs | null,
): number | null {
  const start = parseDay(effectiveFrom);
  const end = parseDay(endDate);
  if (!start || !end || end.isBefore(start)) return null;
  return end.diff(start, 'day') + 1;
}

/**
 * KPI check-in cadences that fit a temporary scorecard window.
 * When `endDate` is omitted (permanent), all cadences are allowed.
 */
export function eligibleCheckInCadences(
  effectiveFrom?: string | Dayjs | null,
  endDate?: string | Dayjs | null,
): KpiCheckInCadence[] {
  const end = parseDay(endDate);
  if (!end) return [...KPI_CHECKIN_CADENCES];

  const span = scorecardSpanDays(effectiveFrom, endDate);
  if (span == null) return [];

  return KPI_CHECKIN_CADENCES.filter(
    (cadence) => span >= CADENCE_MIN_SPAN_DAYS[cadence],
  );
}

/** Restrict check-in day choices so the first check-in falls on/before `endDate`. */
export function filterCheckInDayOptions(
  cadence?: BscCadence | null,
  effectiveFrom?: string | Dayjs | null,
  endDate?: string | Dayjs | null,
) {
  const options = checkInDayOptions(cadence);
  const end = parseDay(endDate);
  if (!cadence || !end) return options;

  const start = parseDay(effectiveFrom);
  if (!start) return options;

  return options.filter((opt) => {
    const first = resolveFirstCheckInDate(cadence, opt.value, start);
    return first != null && !first.isAfter(end);
  });
}

export function checkInDayOptions(cadence?: BscCadence | null) {
  if (cadence === BscCadence.Weekly) return WEEKDAY_OPTIONS;
  if (cadence === BscCadence.BiWeekly) {
    return Array.from({ length: 14 }, (_, i) => ({
      value: i + 1,
      label: `Day ${i + 1}`,
    }));
  }
  if (cadence === BscCadence.Monthly) {
    return Array.from({ length: 31 }, (_, i) => ({
      value: i + 1,
      label: `${i + 1}`,
    }));
  }
  return [];
}

export function checkInDayLabel(
  cadence?: BscCadence | null,
  checkInDay?: number | null,
): string | null {
  if (!cadence || checkInDay == null) return null;
  const option = checkInDayOptions(cadence).find((o) => o.value === checkInDay);
  if (!option) return String(checkInDay);
  if (cadence === BscCadence.Weekly) return option.label;
  if (cadence === BscCadence.BiWeekly) return option.label;
  if (cadence === BscCadence.Monthly) return `Day ${option.label}`;
  return option.label;
}

export function cadenceLabel(cadence?: BscCadence | null): string | null {
  if (!cadence) return null;
  if (cadence === BscCadence.BiWeekly) return 'Bi-weekly';
  return cadence;
}

/** ISO weekday Mon=1 … Sun=7 */
function isoWeekday(date: Dayjs): number {
  const d = date.day();
  return d === 0 ? 7 : d;
}

function clampDayOfMonth(day: number, date: Dayjs): number {
  const last = date.daysInMonth();
  return Math.min(Math.max(day, 1), last);
}

function parseDay(value?: string | Dayjs | null): Dayjs | null {
  if (!value) return null;
  const parsed = dayjs(value).startOf('day');
  return parsed.isValid() ? parsed : null;
}

function isAfterEnd(asOf: Dayjs, endDate?: string | Dayjs | null): boolean {
  const end = parseDay(endDate);
  if (!end) return false;
  return asOf.startOf('day').isAfter(end);
}

/**
 * Bi-weekly window without anchor: 14-day blocks from 1970-01-05 (legacy).
 */
function legacyBiWeeklyDayInWindow(date: Dayjs): number {
  const epoch = dayjs('1970-01-05').startOf('day');
  const days = date.startOf('day').diff(epoch, 'day');
  const mod = ((days % 14) + 14) % 14;
  return mod + 1;
}

function anchoredBiWeeklyDayInWindow(date: Dayjs, anchor: Dayjs): number {
  const days = date.startOf('day').diff(anchor.startOf('day'), 'day');
  if (days < 0) return 0;
  return (days % 14) + 1;
}

/**
 * First calendar day a check-in opens, counting from the scorecard effective date.
 */
export function resolveFirstCheckInDate(
  cadence?: BscCadence | null,
  checkInDay?: number | null,
  effectiveFrom?: string | Dayjs | null,
): Dayjs | null {
  if (!cadence || checkInDay == null || Number.isNaN(Number(checkInDay))) {
    return null;
  }
  const effective = parseDay(effectiveFrom) || dayjs().startOf('day');
  const day = Number(checkInDay);

  if (cadence === BscCadence.Weekly) {
    const targetWeekday = Math.min(Math.max(day, 1), 7);
    let cursor = effective.startOf('day');
    for (let i = 0; i < 7; i += 1) {
      if (isoWeekday(cursor) === targetWeekday) return cursor;
      cursor = cursor.add(1, 'day');
    }
    return effective;
  }

  if (cadence === BscCadence.BiWeekly) {
    const due = Math.min(Math.max(day, 1), 14);
    return effective.add(due - 1, 'day').startOf('day');
  }

  if (cadence === BscCadence.Monthly) {
    const dueThisMonth = clampDayOfMonth(day, effective);
    if (effective.date() <= dueThisMonth) {
      return effective.date(dueThisMonth).startOf('day');
    }
    const nextMonth = effective.add(1, 'month').startOf('month');
    return nextMonth.date(clampDayOfMonth(day, nextMonth)).startOf('day');
  }

  return null;
}

export function formatCheckInDate(date?: Dayjs | null): string {
  if (!date?.isValid()) return '';
  return date.format('D MMM YYYY');
}

export function checkInSchedulePreview(
  cadence?: BscCadence | null,
  checkInDay?: number | null,
  effectiveFrom?: string | Dayjs | null,
): string | null {
  const first = resolveFirstCheckInDate(cadence, checkInDay, effectiveFrom);
  if (!first) return null;
  return `First check-in: ${formatCheckInDate(first)}`;
}

/**
 * True when the check-in window for this KPI is open on `asOf`.
 * When `anchor.effectiveFrom` is set, periods count from that date.
 */
export function isCheckInWindowOpen(
  cadence?: BscCadence | null,
  checkInDay?: number | null,
  asOf: Dayjs | Date | string = dayjs(),
  anchor?: CheckInScheduleAnchor,
): boolean {
  if (!cadence || checkInDay == null || Number.isNaN(Number(checkInDay))) {
    return true;
  }

  const day = Number(checkInDay);
  const date = dayjs(asOf).startOf('day');
  const effective = parseDay(anchor?.effectiveFrom);

  if (effective && date.isBefore(effective)) return false;
  if (isAfterEnd(date, anchor?.endDate)) return false;

  if (!effective) {
    if (cadence === BscCadence.Weekly) {
      return isoWeekday(date) >= day;
    }
    if (cadence === BscCadence.BiWeekly) {
      const today = legacyBiWeeklyDayInWindow(date);
      const due = Math.min(Math.max(day, 1), 14);
      return today >= due;
    }
    if (cadence === BscCadence.Monthly) {
      return date.date() >= clampDayOfMonth(day, date);
    }
    return true;
  }

  const first = resolveFirstCheckInDate(cadence, checkInDay, effective);
  if (!first || date.isBefore(first)) return false;

  if (cadence === BscCadence.Weekly) {
    const daysSinceFirst = date.diff(first.startOf('day'), 'day');
    const offsetInPeriod = daysSinceFirst % 7;
    return offsetInPeriod >= 0;
  }

  if (cadence === BscCadence.BiWeekly) {
    const today = anchoredBiWeeklyDayInWindow(date, effective);
    const due = Math.min(Math.max(day, 1), 14);
    return today >= due;
  }

  if (cadence === BscCadence.Monthly) {
    const due = clampDayOfMonth(day, date);
    if (date.date() < due) return false;
    const firstMonth = first.startOf('month');
    return !date.startOf('month').isBefore(firstMonth);
  }

  return true;
}
