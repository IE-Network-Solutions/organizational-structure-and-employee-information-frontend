import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const ATTENDANCE_API_DATE_FORMAT = 'YYYY-MM-DD';
export const ATTENDANCE_API_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm';
export const ATTENDANCE_API_TIME_FORMAT = 'HH:mm';

export const parseAttendanceDateTime = (value: string) => {
  const parsed = dayjs(value, ATTENDANCE_API_DATETIME_FORMAT, true);
  return parsed.isValid() ? parsed : dayjs(value);
};

export const formatAttendanceClockTime = (
  value: string | null | undefined,
  format: string = ATTENDANCE_API_TIME_FORMAT,
  fallback = '-',
): string => {
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    return fallback;
  }
  const parsed = parseAttendanceDateTime(value);
  return parsed.isValid() ? parsed.format(format) : fallback;
};

export const getAttendanceDateBase = (recordDate?: string | null) =>
  recordDate ? dayjs(recordDate).startOf('day') : dayjs().startOf('day');

export const applyTimeToAttendanceDate = (
  recordDate: string,
  time: Dayjs,
): Dayjs =>
  getAttendanceDateBase(recordDate)
    .hour(time.hour())
    .minute(time.minute())
    .second(0);

export const formatAttendanceApiDateTime = (
  recordDate: string,
  time: Dayjs,
): string =>
  `${getAttendanceDateBase(recordDate).format(ATTENDANCE_API_DATE_FORMAT)} ${time.format(ATTENDANCE_API_TIME_FORMAT)}`;

export const formatAttendanceRecordDateLabel = (
  recordDate?: string | null,
): string =>
  recordDate ? getAttendanceDateBase(recordDate).format('MMM D') : '';
