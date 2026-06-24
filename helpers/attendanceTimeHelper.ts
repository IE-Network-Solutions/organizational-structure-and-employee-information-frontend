import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/**
 * Attendance clock times are stored as UTC ISO strings where the UTC
 * components are the wall-clock time (e.g. 07:20Z means 7:20 AM).
 * Parsing with local dayjs shifts by the browser timezone (+3 for EAT).
 */
export const parseAttendanceWallClockTime = (
  date?: string | null,
): Dayjs | null => {
  if (!date) return null;
  const parsed = dayjs.utc(date);
  return parsed.isValid() ? parsed : null;
};

export const formatAttendanceWallClockTime = (
  date?: string | null,
  format = 'HH:mm',
): string | null => {
  const parsed = parseAttendanceWallClockTime(date);
  return parsed ? parsed.format(format) : null;
};

export const formatAttendanceWallClockTimeOrDash = (
  date?: string | null,
  format = 'HH:mm',
): string => formatAttendanceWallClockTime(date, format) ?? '-';
