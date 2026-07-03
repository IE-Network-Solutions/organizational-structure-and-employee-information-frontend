import dayjs, { Dayjs } from 'dayjs';
import {
  buildSessionStructureKey,
  shouldRegenerateFiscalStructure,
} from './wizardUtils';

export type SessionRow = {
  id?: string;
  sessionName: string;
  sessionStartDate: Dayjs | null;
  sessionEndDate: Dayjs | null;
  sessionDescription: string;
  sessionDateRange?: [Dayjs, Dayjs] | null;
};

export type MonthRow = {
  monthNumber: number;
  monthName: string;
  monthStartDate: Dayjs | null;
  monthEndDate: Dayjs | null;
  monthDescription: string;
};

export type MonthSessionRow = {
  monthNumber: number;
  monthName: string;
  startDate: Dayjs;
  endDate: Dayjs;
};

const getSessionCount = (calendarType: string) => {
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

export const generateSessionRows = (
  fiscalYearStart: Dayjs | null,
  fiscalYearEnd: Dayjs | null,
  calendarType: string,
): SessionRow[] => {
  if (!fiscalYearStart || !fiscalYearEnd) return [];

  const sessionCount = getSessionCount(calendarType);
  if (sessionCount === 0) return [];

  const startDate = dayjs(fiscalYearStart);
  const endDate = dayjs(fiscalYearEnd);
  const totalDays = endDate.diff(startDate, 'day');
  const daysPerSession = Math.floor(totalDays / sessionCount);
  const sessions: SessionRow[] = [];

  for (let i = 0; i < sessionCount; i++) {
    const sessionStartDate =
      i === 0 ? startDate : startDate.add(i * daysPerSession, 'day');
    const sessionEndDate =
      i === sessionCount - 1
        ? endDate
        : startDate.add((i + 1) * daysPerSession - 1, 'day');

    sessions.push({
      sessionName: `Session ${i + 1}`,
      sessionStartDate,
      sessionEndDate,
      sessionDescription: '',
    });
  }

  return sessions;
};

export const mapSessionsToFormData = (sessions: any[]): SessionRow[] =>
  sessions.map((session: any) => ({
    id: session?.id,
    sessionName: session.name || session.sessionName || '',
    sessionStartDate: session.startDate
      ? dayjs(session.startDate)
      : session.sessionStartDate
        ? dayjs(session.sessionStartDate)
        : null,
    sessionEndDate: session.endDate
      ? dayjs(session.endDate)
      : session.sessionEndDate
        ? dayjs(session.sessionEndDate)
        : null,
    sessionDescription: session.description || session.sessionDescription || '',
    sessionDateRange:
      (session.startDate && session.endDate) ||
      (session.sessionStartDate && session.sessionEndDate)
        ? [
            dayjs(session.startDate || session.sessionStartDate),
            dayjs(session.endDate || session.sessionEndDate),
          ]
        : session.sessionDateRange || null,
  }));

const withSessionDateRanges = (rows: SessionRow[]): SessionRow[] =>
  rows.map((session) => ({
    ...session,
    sessionDateRange:
      session.sessionStartDate && session.sessionEndDate
        ? ([session.sessionStartDate, session.sessionEndDate] as [Dayjs, Dayjs])
        : null,
  }));

export const resolveSessionRows = (state: {
  calendarType: string;
  fiscalYearStart: Dayjs | null;
  fiscalYearEnd: Dayjs | null;
  isEditMode: boolean;
  selectedFiscalYear: any;
  sessionFormValues: Record<string, any>;
}) => {
  const {
    calendarType,
    fiscalYearStart,
    fiscalYearEnd,
    isEditMode,
    selectedFiscalYear,
    sessionFormValues,
  } = state;

  if (!calendarType || !fiscalYearStart || !fiscalYearEnd) {
    return [];
  }

  const regenerate = shouldRegenerateFiscalStructure({
    isEditMode,
    selectedFiscalYear,
    calendarType,
    fiscalYearStart,
    fiscalYearEnd,
  });

  if (
    !regenerate &&
    Array.isArray(sessionFormValues?.sessionData) &&
    sessionFormValues.sessionData.length > 0
  ) {
    return withSessionDateRanges(sessionFormValues.sessionData);
  }

  if (isEditMode && selectedFiscalYear?.sessions && !regenerate) {
    return withSessionDateRanges(
      mapSessionsToFormData(selectedFiscalYear.sessions),
    );
  }

  return withSessionDateRanges(
    generateSessionRows(fiscalYearStart, fiscalYearEnd, calendarType),
  );
};

const classifyMonths = (
  startMonth: number,
  endMonth: number,
  calendarType: string,
) => {
  const months = Array.from(
    { length: 12 },
    (unused, monthIndex) => monthIndex + 1,
  );
  const sections: Record<number, number[]> = {};
  let sectionSize = 12;
  if (calendarType === 'Quarter') sectionSize = 3;
  else if (calendarType === 'Semester') sectionSize = 6;

  months.forEach((month, index) => {
    const section = Math.floor(index / sectionSize) + 1;
    if (!sections[section]) sections[section] = [];
    sections[section].push(month);
  });

  return sections;
};

const getMonthStartEndDates = (
  month: number,
  fiscalYearStart: Dayjs,
  fiscalYearEnd: Dayjs,
) => {
  const totalDays = fiscalYearEnd.diff(fiscalYearStart, 'day') + 1;
  const daysPerMonth = Math.floor(totalDays / 12);
  const startDate = fiscalYearStart.add((month - 1) * daysPerMonth, 'day');
  const endDate =
    month === 12
      ? fiscalYearEnd
      : fiscalYearStart.add(month * daysPerMonth, 'day').subtract(1, 'day');

  const finalStartDate = startDate.isBefore(fiscalYearStart)
    ? fiscalYearStart
    : startDate;
  const finalEndDate = endDate.isAfter(fiscalYearEnd) ? fiscalYearEnd : endDate;

  return { startDate: finalStartDate, endDate: finalEndDate };
};

export const calculateMonthDataBySession = (
  calendarType: string,
  fiscalYearStart: Dayjs | null,
  fiscalYearEnd: Dayjs | null,
): Record<number, MonthSessionRow[]> => {
  if (!calendarType || !fiscalYearStart || !fiscalYearEnd) return {};

  const groupedMonths = classifyMonths(
    fiscalYearStart.toDate().getMonth() + 1,
    fiscalYearEnd.toDate().getMonth() + 1,
    calendarType,
  );

  const sessionMonthData: Record<number, MonthSessionRow[]> = {};
  const fyStart = dayjs(fiscalYearStart);
  const fyEnd = dayjs(fiscalYearEnd);

  Object.entries(groupedMonths).forEach(([section, months]) => {
    const sessionIndex = Number(section) - 1;
    sessionMonthData[sessionIndex] =
      months?.map((month, index) => {
        const { startDate, endDate } = getMonthStartEndDates(
          month,
          fyStart,
          fyEnd,
        );
        return {
          monthNumber: month,
          monthName: `Month ${index + 1}`,
          startDate,
          endDate,
        };
      }) || [];
  });

  return sessionMonthData;
};

export const buildMonthDataFromFiscalYear = (
  selectedFiscalYear: any,
): Record<number, MonthSessionRow[]> => {
  if (!selectedFiscalYear?.sessions) return {};

  const sessionMonthData: Record<number, MonthSessionRow[]> = {};
  let monthNumber = 1;

  selectedFiscalYear.sessions.forEach((session: any, sessionIndex: number) => {
    sessionMonthData[sessionIndex] = (session.months || []).map(
      (month: any) => ({
        monthNumber: monthNumber++,
        monthName: month.name,
        startDate: dayjs(month.startDate),
        endDate: dayjs(month.endDate),
      }),
    );
  });

  return sessionMonthData;
};

const monthSessionDataToRangeValues = (
  sessionMonthData: Record<number, MonthSessionRow[]>,
): MonthRow[] => {
  const allMonths = Object.values(sessionMonthData).flat();
  return allMonths.map((month) => ({
    monthNumber: month.monthNumber,
    monthName: month.monthName,
    monthStartDate: month.startDate,
    monthEndDate: month.endDate,
    monthDescription: '',
  }));
};

export const monthRangeValuesToSessionData = (
  monthRangeValues: MonthRow[],
  calendarType: string,
): Record<number, MonthSessionRow[]> => {
  const sectionSize =
    calendarType === 'Quarter' ? 3 : calendarType === 'Semester' ? 6 : 12;
  const sortedMonths = [...monthRangeValues].sort(
    (a, b) => a.monthNumber - b.monthNumber,
  );
  const sessionMonthData: Record<number, MonthSessionRow[]> = {};

  sortedMonths.forEach((month) => {
    const sessionIndex = Math.floor((month.monthNumber - 1) / sectionSize);
    if (!sessionMonthData[sessionIndex]) sessionMonthData[sessionIndex] = [];
    sessionMonthData[sessionIndex].push({
      monthNumber: month.monthNumber,
      monthName: month.monthName,
      startDate: dayjs(month.monthStartDate),
      endDate: dayjs(month.monthEndDate),
    });
  });

  return sessionMonthData;
};

export const buildMonthFormFields = (
  monthRangeValues: MonthRow[],
): Record<string, any> => {
  const fields: Record<string, any> = {};
  monthRangeValues.forEach((month) => {
    fields[`monthName_${month.monthNumber}`] = month.monthName;
    fields[`monthStartDate_${month.monthNumber}`] = month.monthStartDate;
    fields[`monthEndDate_${month.monthNumber}`] = month.monthEndDate;
    fields[`monthDescription_${month.monthNumber}`] = month.monthDescription;
    if (month.monthStartDate && month.monthEndDate) {
      fields[`monthDateRange_${month.monthNumber}`] = [
        dayjs(month.monthStartDate),
        dayjs(month.monthEndDate),
      ];
    }
  });
  return fields;
};

export const resolveMonthWizardState = (state: {
  calendarType: string;
  fiscalYearStart: Dayjs | null;
  fiscalYearEnd: Dayjs | null;
  isEditMode: boolean;
  selectedFiscalYear: any;
  monthRangeValues: MonthRow[];
}) => {
  const {
    calendarType,
    fiscalYearStart,
    fiscalYearEnd,
    isEditMode,
    selectedFiscalYear,
    monthRangeValues,
  } = state;

  if (!calendarType || !fiscalYearStart || !fiscalYearEnd) {
    return {
      monthDataBySession: {} as Record<number, MonthSessionRow[]>,
      monthRangeValues: [] as MonthRow[],
      monthFormFields: {} as Record<string, any>,
    };
  }

  const regenerate = shouldRegenerateFiscalStructure({
    isEditMode,
    selectedFiscalYear,
    calendarType,
    fiscalYearStart,
    fiscalYearEnd,
  });

  const hasStoredMonthData =
    Array.isArray(monthRangeValues) && monthRangeValues.length > 0;

  let monthDataBySession: Record<number, MonthSessionRow[]> = {};

  if (
    isEditMode &&
    selectedFiscalYear?.sessions &&
    !regenerate &&
    hasStoredMonthData
  ) {
    monthDataBySession = monthRangeValuesToSessionData(
      monthRangeValues,
      calendarType,
    );
  } else if (isEditMode && selectedFiscalYear?.sessions && !regenerate) {
    monthDataBySession = buildMonthDataFromFiscalYear(selectedFiscalYear);
  } else {
    monthDataBySession = calculateMonthDataBySession(
      calendarType,
      fiscalYearStart,
      fiscalYearEnd,
    );
  }

  const nextMonthRangeValues =
    monthSessionDataToRangeValues(monthDataBySession);

  return {
    monthDataBySession,
    monthRangeValues: nextMonthRangeValues,
    monthFormFields: buildMonthFormFields(nextMonthRangeValues),
  };
};

export const buildFiscalYearFormValues = (
  selectedFiscalYear: any,
  calendarType: string,
) => {
  const startDate = dayjs(selectedFiscalYear.startDate);
  const endDate = dayjs(selectedFiscalYear.endDate);

  return {
    fiscalYearName: selectedFiscalYear?.name,
    fiscalYearStartDate: startDate,
    fiscalYearEndDate: endDate,
    fiscalYearCalenderId: calendarType,
    fiscalYearDescription: selectedFiscalYear?.description,
  };
};

export const buildSessionStructureKeyFromState = (state: {
  calendarType: string;
  fiscalYearStart: Dayjs | null;
  fiscalYearEnd: Dayjs | null;
  isEditMode: boolean;
  selectedFiscalYear: any;
}) => {
  const regenerate = shouldRegenerateFiscalStructure({
    isEditMode: state.isEditMode,
    selectedFiscalYear: state.selectedFiscalYear,
    calendarType: state.calendarType,
    fiscalYearStart: state.fiscalYearStart,
    fiscalYearEnd: state.fiscalYearEnd,
  });

  return buildSessionStructureKey({
    calendarType: state.calendarType,
    fiscalYearStart: state.fiscalYearStart,
    fiscalYearEnd: state.fiscalYearEnd,
    isEditMode: state.isEditMode,
    fiscalYearId: state.selectedFiscalYear?.id,
    regenerate,
  });
};

export const buildMonthStructureKeyFromState = (state: {
  calendarType: string;
  fiscalYearStart: Dayjs | null;
  fiscalYearEnd: Dayjs | null;
  isEditMode: boolean;
  selectedFiscalYear: any;
  sessionStructureKey: string | null;
}) => {
  const regenerate = shouldRegenerateFiscalStructure({
    isEditMode: state.isEditMode,
    selectedFiscalYear: state.selectedFiscalYear,
    calendarType: state.calendarType,
    fiscalYearStart: state.fiscalYearStart,
    fiscalYearEnd: state.fiscalYearEnd,
  });

  return `${buildSessionStructureKeyFromState(state)}|months|${regenerate ? 'regen' : 'keep'}`;
};
