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
  const name = withoutParen || 'Scorecard';
  // Guard against accidentally surfacing a template/user UUID as the title.
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      name,
    )
  ) {
    return 'Scorecard';
  }
  return name;
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

/** "September 2026 2026" / "Q3 2026, 2026" → "September 2026" / "Q3 2026". */
export function collapseRepeatedYear(label: string): string {
  return label
    .replace(/\b(\d{4})(?:[\s,]+\1\b)+/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function periodLabel(card: EmployeeScorecard): string {
  if (card.periodMonthName) {
    // BE labels already carry the year ("September 2026", "Q3 2026", "Week 3, 2026").
    const alreadyHasYear =
      card.periodYear != null &&
      String(card.periodMonthName).includes(String(card.periodYear));
    const label =
      card.periodYear != null && !alreadyHasYear
        ? `${card.periodMonthName} ${card.periodYear}`
        : card.periodMonthName;
    return collapseRepeatedYear(label);
  }
  return collapseRepeatedYear(card.cycleLabel || 'Period');
}

export function periodSortKey(card: EmployeeScorecard): number {
  if (card.periodStart) {
    const t = new Date(card.periodStart).getTime();
    if (Number.isFinite(t)) return t;
  }
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
  const cadence =
    cycle?.cadence && cycle.cadence !== BscCadence.Custom
      ? cycle.cadence
      : null;
  const parts = [
    scorecardProgramName(card, cycle),
    periodLabel(card),
    cadence,
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
