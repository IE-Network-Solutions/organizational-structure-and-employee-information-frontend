import dayjs, { type Dayjs } from 'dayjs';
import { Cadence, ViewMode } from './types';

function getOrdinal(day: number): string {
  if (day > 3 && day < 21) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

/** Date label format used on Plan & Report cards (legacy full datetime). */
export function formatPlanningReportDate(date: string | Dayjs): string {
  const d = dayjs(date);
  return `${d.format('MMMM')} ${getOrdinal(d.date())} ${d.format('YYYY')}, ${d.format('h:mm:ss A')}`;
}

/** Soft Reports meta: "Last reported Sep 2" (include year when not current). */
export function formatLastReportedLabel(
  date: string | Dayjs | null | undefined,
  today: Dayjs = dayjs(),
): string {
  if (date == null || date === '') return '';
  const d = dayjs(date);
  if (!d.isValid()) return '';
  const sameYear = d.isSame(today, 'year');
  const short = sameYear ? d.format('MMM D') : d.format('MMM D, YYYY');
  return `Last reported ${short}`;
}

export function getCadenceLabel(cadence: Cadence): string {
  const labels: Record<Cadence, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
  };
  return labels[cadence];
}

export function getSectionTitle(cadence: Cadence, viewMode: ViewMode): string {
  if (viewMode === 'reporting') {
    const titles: Record<Cadence, string> = {
      daily: "Today's Daily Report",
      weekly: "This week's Weekly Report",
      monthly: "This month's Monthly Report",
    };
    return titles[cadence];
  }

  const titles: Record<Cadence, string> = {
    daily: "Today's Daily Plan",
    weekly: "This week's Weekly Plan",
    monthly: "This month's Monthly Plan",
  };
  return titles[cadence];
}

export function getButtonText(cadence: Cadence, viewMode: ViewMode): string {
  const cadenceLabel = getCadenceLabel(cadence);
  if (viewMode === 'reporting') {
    return `Add ${cadenceLabel} Report`;
  }
  return `Add ${cadenceLabel} Plan`;
}

export function getCadenceTagText(cadence: Cadence): string {
  return `${getCadenceLabel(cadence)} cadence`;
}
