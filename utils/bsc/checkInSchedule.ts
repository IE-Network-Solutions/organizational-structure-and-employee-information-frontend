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
    const options: Array<{ value: number; label: string }> = [];
    for (let day = 1; day <= 14; day += 1) {
      options.push({ value: day, label: `Day ${day}` });
    }
    return options;
  }
  if (cadence === BscCadence.Monthly) {
    const options: Array<{ value: number; label: string }> = [];
    for (let day = 1; day <= 31; day += 1) {
      options.push({ value: day, label: `${day}` });
    }
    return options;
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

/** Start and end of check-in cycle `index`, counted from the effective date. */
function checkInCycleBounds(
  cadence: KpiCheckInCadence,
  effective: Dayjs,
  index: number,
): { start: Dayjs; end: Dayjs } {
  if (cadence === BscCadence.Monthly) {
    return {
      start: effective.add(index, 'month'),
      end: effective.add(index + 1, 'month'),
    };
  }
  const length = cadence === BscCadence.Weekly ? 7 : 14;
  return {
    start: effective.add(index * length, 'day'),
    end: effective.add((index + 1) * length, 'day'),
  };
}

/**
 * Day a check-in opens in cycle `index`: `checkInDay` days after the cycle
 * starts (e.g. effective 13 Oct, Monthly, day 10 -> 23 Oct, then 23 Nov).
 */
function checkInOpensAt(
  cadence: KpiCheckInCadence,
  checkInDay: number,
  effective: Dayjs,
  index: number,
): Dayjs {
  const { start, end } = checkInCycleBounds(cadence, effective, index);
  const opens = start.add(Math.max(checkInDay, 0), 'day');
  return opens.isAfter(end) ? end : opens;
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
  if (!isKpiCheckInCadence(cadence)) return null;
  const effective = parseDay(effectiveFrom) || dayjs().startOf('day');
  return checkInOpensAt(cadence, Number(checkInDay), effective, 0);
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

  if (!isKpiCheckInCadence(cadence)) return true;
  // Open from the check-in day of a cycle until that cycle ends (inclusive),
  // counted from the effective date.
  for (let index = 0; index < 10000; index += 1) {
    const opensAt = checkInOpensAt(cadence, day, effective, index);
    if (opensAt.isAfter(date)) return false;
    const { end } = checkInCycleBounds(cadence, effective, index);
    if (!date.isAfter(end)) return true;
  }
  return false;
}
