import dayjs, { Dayjs } from 'dayjs';

export const ATTENDANCE_API_DATE_FORMAT = 'YYYY-MM-DD';
export const ATTENDANCE_API_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm';
export const ATTENDANCE_API_TIME_FORMAT = 'HH:mm';

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
