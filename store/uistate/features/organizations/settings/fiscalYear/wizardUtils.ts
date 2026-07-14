import dayjs from 'dayjs';

export type FiscalCalendarType = 'Year' | 'Quarter' | 'Semester' | '';

export const getExpectedSessionCount = (calendarType: string): number => {
  switch (calendarType) {
    case 'Quarter':
      return 4;
    case 'Semester':
      return 2;
    case 'Year':
      return 1;
    default:
      return 0;
  }
};

export const getCalendarTypeFromSessionCount = (
  sessionCount: number,
): FiscalCalendarType => {
  if (sessionCount === 4) return 'Quarter';
  if (sessionCount === 2) return 'Semester';
  if (sessionCount === 1) return 'Year';
  return '';
};

export const shouldRegenerateFiscalStructure = ({
  isEditMode,
  selectedFiscalYear,
  calendarType,
  fiscalYearStart,
  fiscalYearEnd,
}: {
  isEditMode: boolean;
  selectedFiscalYear: any;
  calendarType: string;
  fiscalYearStart: dayjs.Dayjs | null;
  fiscalYearEnd: dayjs.Dayjs | null;
}) => {
  if (!isEditMode || !selectedFiscalYear) return true;

  const originalSessionCount = selectedFiscalYear.sessions?.length ?? 0;
  const originalCalendarType =
    getCalendarTypeFromSessionCount(originalSessionCount);
  const calendarTypeChanged = calendarType !== originalCalendarType;

  const currentStart = fiscalYearStart
    ? dayjs(fiscalYearStart).format('YYYY-MM-DD')
    : null;
  const currentEnd = fiscalYearEnd
    ? dayjs(fiscalYearEnd).format('YYYY-MM-DD')
    : null;
  const originalStart = selectedFiscalYear.startDate
    ? dayjs(selectedFiscalYear.startDate).format('YYYY-MM-DD')
    : null;
  const originalEnd = selectedFiscalYear.endDate
    ? dayjs(selectedFiscalYear.endDate).format('YYYY-MM-DD')
    : null;
  const datesChanged =
    currentStart !== originalStart || currentEnd !== originalEnd;

  return calendarTypeChanged || datesChanged;
};

export const monthBelongsToSession = (
  monthStartDate: string,
  sessionStartDate: string,
  sessionEndDate: string,
) => {
  const monthStart = dayjs(monthStartDate);
  const sessionStart = dayjs(sessionStartDate);
  const sessionEnd = dayjs(sessionEndDate);

  if (
    !monthStart.isValid() ||
    !sessionStart.isValid() ||
    !sessionEnd.isValid()
  ) {
    return false;
  }

  return (
    monthStart.isSameOrAfter(sessionStart, 'day') &&
    monthStart.isSameOrBefore(sessionEnd, 'day')
  );
};

export const resolveOriginalMonthId = (
  originalSession:
    | { months?: Array<{ id?: string; startDate?: string; endDate?: string }> }
    | null
    | undefined,
  monthStartDate: string,
  monthEndDate: string,
  sessionLocalIndex: number,
  usedMonthIds: Set<string>,
): string | null => {
  const originalMonths = originalSession?.months;
  if (!Array.isArray(originalMonths) || originalMonths.length === 0) {
    return null;
  }

  const monthStart = dayjs(monthStartDate);
  const monthEnd = dayjs(monthEndDate);
  if (!monthStart.isValid() || !monthEnd.isValid()) {
    return null;
  }

  const startKey = monthStart.format('YYYY-MM-DD');
  const endKey = monthEnd.format('YYYY-MM-DD');

  const exactMatch = originalMonths.find((originalMonth) => {
    if (!originalMonth?.id || usedMonthIds.has(originalMonth.id)) {
      return false;
    }
    if (!originalMonth.startDate || !originalMonth.endDate) {
      return false;
    }
    return (
      dayjs(originalMonth.startDate).format('YYYY-MM-DD') === startKey &&
      dayjs(originalMonth.endDate).format('YYYY-MM-DD') === endKey
    );
  });

  if (exactMatch?.id) {
    usedMonthIds.add(exactMatch.id);
    return exactMatch.id;
  }

  const indexMatch = originalMonths[sessionLocalIndex];
  if (indexMatch?.id && !usedMonthIds.has(indexMatch.id)) {
    usedMonthIds.add(indexMatch.id);
    return indexMatch.id;
  }

  return null;
};

export const buildSessionStructureKey = ({
  calendarType,
  fiscalYearStart,
  fiscalYearEnd,
  isEditMode,
  fiscalYearId,
  regenerate,
}: {
  calendarType: string;
  fiscalYearStart: dayjs.Dayjs | null;
  fiscalYearEnd: dayjs.Dayjs | null;
  isEditMode: boolean;
  fiscalYearId?: string;
  regenerate: boolean;
}) => {
  const start = fiscalYearStart
    ? dayjs(fiscalYearStart).format('YYYY-MM-DD')
    : '';
  const end = fiscalYearEnd ? dayjs(fiscalYearEnd).format('YYYY-MM-DD') : '';
  return `${calendarType}|${start}|${end}|${isEditMode ? (fiscalYearId ?? 'edit') : 'create'}|${regenerate ? 'regen' : 'keep'}`;
};
