export type PpScoreBy = 'MONTH' | 'SESSION';

type DatedPeriod = {
  id?: string;
  startDate?: string | null;
  endDate?: string | null;
};

type FiscalSessionWithMonths = DatedPeriod & {
  months?: DatedPeriod[] | null;
};

export type PpPeriodRange = {
  periodStart?: string;
  periodEnd?: string;
};

/**
 * Date range of the PP month (MONTH) or session (SESSION) from the active
 * fiscal calendar — the same range the backend scores the scorecard for.
 */
export function resolvePpPeriodRange(
  sessions: FiscalSessionWithMonths[] | null | undefined,
  scoreBy: PpScoreBy,
  monthId?: string,
  sessionId?: string,
): PpPeriodRange {
  const list = sessions ?? [];
  const period =
    scoreBy === 'SESSION'
      ? list.find((session) => session.id === sessionId)
      : list
          .flatMap((session) => session.months ?? [])
          .find((month) => month.id === monthId);
  if (!period?.startDate || !period?.endDate) return {};
  return { periodStart: period.startDate, periodEnd: period.endDate };
}
