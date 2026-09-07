import dayjs, { Dayjs } from 'dayjs';
import { BscSetupKind, EvaluationCycle } from '@/types/bsc';

/**
 * Scorecard template is live when Active is on and today is on/after
 * the effective date (defaults to today when unset).
 */
export function isScorecardTemplateLive(
  cycle?: EvaluationCycle | null,
  asOf: Dayjs | Date | string = dayjs(),
): boolean {
  if (!cycle) return true;
  if (cycle.isActive === false) return false;
  const effective = cycle.effectiveFrom || cycle.startDate;
  const asOfDay = dayjs(asOf).startOf('day');
  if (effective && asOfDay.isBefore(dayjs(effective).startOf('day'))) return false;
  const end = cycle.endDate;
  if (
    end &&
    cycle.setupKind === BscSetupKind.Temporary &&
    asOfDay.isAfter(dayjs(end).startOf('day'))
  ) {
    return false;
  }
  return true;
}

export function resolveEffectiveFrom(
  isActive: boolean,
  effectiveFrom?: string | Dayjs | null,
): string {
  if (!isActive) {
    return effectiveFrom
      ? dayjs(effectiveFrom).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD');
  }
  if (effectiveFrom) return dayjs(effectiveFrom).format('YYYY-MM-DD');
  return dayjs().format('YYYY-MM-DD');
}
