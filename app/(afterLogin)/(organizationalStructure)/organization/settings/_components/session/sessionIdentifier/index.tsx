import { Dayjs } from 'dayjs';

export interface SessionData {
  sessionName: string;
  sessionStartDate: string;
  sessionEndDate: string;
  sessionDescription: string;
}

export const generateSessionData = (
  fiscalYearStart: Dayjs | null,
  fiscalYearEnd: Dayjs | null,
  numSessions: number,
): SessionData[] => {
  if (!fiscalYearStart || !fiscalYearEnd) {
    return [];
  }

  const totalDays = fiscalYearEnd.diff(fiscalYearStart, 'day');

  const daysPerSession = Math.floor(totalDays / numSessions);

  const sessionData: SessionData[] = [];

  for (let i = 0; i < numSessions; i++) {
    const sessionStart = fiscalYearStart.add(i * daysPerSession, 'day');
    const sessionEnd = fiscalYearStart.add((i + 1) * daysPerSession - 1, 'day');

    const sessionName = `Session ${i + 1}`;

    const sessionDescription = `This is ${sessionName} for the fiscal year.`;

    sessionData.push({
      sessionName,
      sessionStartDate: sessionStart.format('YYYY-MM-DD'),
      sessionEndDate: sessionEnd.format('YYYY-MM-DD'),
      sessionDescription,
    });
  }

  return sessionData;
};
