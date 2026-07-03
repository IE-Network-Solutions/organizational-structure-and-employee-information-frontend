import dayjs from 'dayjs';

export type FiscalCalendarType = 'Year' | 'Quarter' | 'Semester' | '';

export const getCalendarTypeFromSessionCount = (
  sessionCount: number,
): FiscalCalendarType => {
  if (sessionCount >= 4) return 'Quarter';
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
  const originalCalendarType = getCalendarTypeFromSessionCount(
    originalSessionCount,
  );
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
  return `${calendarType}|${start}|${end}|${isEditMode ? fiscalYearId ?? 'edit' : 'create'}|${regenerate ? 'regen' : 'keep'}`;
};
