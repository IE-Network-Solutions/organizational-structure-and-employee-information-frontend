import {
  BscCadence,
  EmployeeScorecard,
  EvaluationCycle,
} from '@/types/bsc';

/** Strip period suffixes so "Enterprise Non-Financial Scorecard · March 2026" → program name. */
export function scorecardProgramName(
  card: EmployeeScorecard,
  cycle?: EvaluationCycle | null,
): string {
  const raw = (cycle?.label || card.cycleLabel || 'Scorecard').trim();
  const withoutBullet = raw.replace(/\s*[·•]\s*.+$/, '').trim();
  const withoutParen = withoutBullet.replace(/\s+\([^)]*\)\s*$/, '').trim();
  return withoutParen || 'Scorecard';
}

/**
 * Groups scorecards that belong to the same reporting series
 * (program family + cadence + role), so monthly history of one cascade
 * does not mix with a different quarterly scorecard.
 */
export function scorecardSeriesKey(
  card: EmployeeScorecard,
  cycle?: EvaluationCycle | null,
): string {
  const program = scorecardProgramName(card, cycle).toLowerCase();
  const cadence = (cycle?.cadence || 'unknown').toLowerCase();
  const role = (card.positionTitle || '').trim().toLowerCase() || 'role';
  const dept = (card.departmentName || '').trim().toLowerCase() || 'dept';
  return `${program}::${cadence}::${role}::${dept}`;
}

export function periodLabel(card: EmployeeScorecard): string {
  if (card.periodMonthName) {
    return card.periodYear
      ? `${card.periodMonthName} ${card.periodYear}`
      : card.periodMonthName;
  }
  return card.cycleLabel || 'Period';
}

export function periodSortKey(card: EmployeeScorecard): number {
  const year = card.periodYear ?? 0;
  const monthIndex = card.periodMonthName
    ? new Date(`${card.periodMonthName} 1, ${year || 2000}`).getMonth()
    : 0;
  return year * 100 + (Number.isFinite(monthIndex) ? monthIndex : 0);
}

export function scorecardContextLabel(
  card: EmployeeScorecard,
  cycle?: EvaluationCycle | null,
): string {
  const parts = [
    scorecardProgramName(card, cycle),
    periodLabel(card),
    cycle?.cadence,
  ].filter(Boolean);
  return parts.join(' · ');
}

export function filterScorecardsInSeries(
  cards: EmployeeScorecard[],
  anchor: EmployeeScorecard,
  cycleById: Map<string, EvaluationCycle>,
): EmployeeScorecard[] {
  const anchorKey = scorecardSeriesKey(
    anchor,
    cycleById.get(anchor.cycleId),
  );
  return cards
    .filter(
      (card) =>
        scorecardSeriesKey(card, cycleById.get(card.cycleId)) === anchorKey,
    )
    .sort((a, b) => periodSortKey(a) - periodSortKey(b));
}

/** Distinct series anchors (latest card per series) for a person's scorecards. */
export function latestScorecardPerSeries(
  cards: EmployeeScorecard[],
  cycleById: Map<string, EvaluationCycle>,
): EmployeeScorecard[] {
  const bySeries = new Map<string, EmployeeScorecard>();
  const sorted = [...cards].sort(
    (a, b) => periodSortKey(b) - periodSortKey(a),
  );
  for (const card of sorted) {
    const key = scorecardSeriesKey(card, cycleById.get(card.cycleId));
    if (!bySeries.has(key)) bySeries.set(key, card);
  }
  return Array.from(bySeries.values()).sort((a, b) =>
    scorecardContextLabel(a, cycleById.get(a.cycleId)).localeCompare(
      scorecardContextLabel(b, cycleById.get(b.cycleId)),
    ),
  );
}

export function cadenceLabel(cadence?: BscCadence | string | null): string {
  if (!cadence) return '';
  return String(cadence);
}
