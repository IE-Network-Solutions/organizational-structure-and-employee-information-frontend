import type { EmployeeScorecard } from '@/types/bsc';

export type FiscalMonthLike = {
  name?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
};

/** Normalize to a UTC calendar day (YYYY-MM-DD) for inclusive range compares. */
export function toUtcDayString(value?: string | Date | null): string | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart <= bEnd && aEnd >= bStart;
}

/**
 * True when the scorecard's BSC period overlaps a fiscal month range.
 * Prefers periodStart/periodEnd; falls back to label/key heuristics.
 */
export function scorecardOverlapsFiscalMonth(
  card: EmployeeScorecard,
  month: FiscalMonthLike,
): boolean {
  const monthStart = toUtcDayString(month.startDate);
  const monthEnd = toUtcDayString(month.endDate);
  const periodStart = toUtcDayString(card.periodStart);
  const periodEnd = toUtcDayString(card.periodEnd);

  if (monthStart && monthEnd && periodStart && periodEnd) {
    return rangesOverlap(periodStart, periodEnd, monthStart, monthEnd);
  }

  const monthName = (month.name || '').trim().toLowerCase();
  if (!monthName) return false;

  const label = (card.periodMonthName || '').trim().toLowerCase();
  if (label === monthName || label.startsWith(`${monthName} `)) {
    return true;
  }
  if (label.includes(monthName)) {
    return true;
  }

  // Monthly keys: 2026-09 — match against fiscal month start if present.
  if (monthStart && card.periodKey) {
    const keyMonth = String(card.periodKey).match(/^(\d{4})-(\d{2})$/);
    if (keyMonth) {
      const expected = `${keyMonth[1]}-${keyMonth[2]}`;
      if (monthStart.startsWith(expected)) return true;
    }
  }

  return false;
}

export function filterScorecardsByFiscalMonths(
  cards: EmployeeScorecard[],
  months: FiscalMonthLike[],
): EmployeeScorecard[] {
  if (!months.length) return cards;
  return cards.filter((card) =>
    months.some((month) => scorecardOverlapsFiscalMonth(card, month)),
  );
}

/** Calendar-month fallback when no fiscal filter is selected. */
export function scorecardInCalendarMonth(
  card: EmployeeScorecard,
  monthName: string,
  year: number,
): boolean {
  const name = monthName.trim().toLowerCase();
  if (!name) return false;

  const periodStart = toUtcDayString(card.periodStart);
  const periodEnd = toUtcDayString(card.periodEnd);
  if (periodStart && periodEnd) {
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
    if (Number.isFinite(monthIndex)) {
      const start = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;
      const endDate = new Date(Date.UTC(year, monthIndex + 1, 0));
      const end = endDate.toISOString().slice(0, 10);
      return rangesOverlap(periodStart, periodEnd, start, end);
    }
  }

  if (card.periodYear != null && card.periodYear !== year) return false;
  const label = (card.periodMonthName || '').trim().toLowerCase();
  return label === name || label.startsWith(`${name} `) || label.includes(name);
}
