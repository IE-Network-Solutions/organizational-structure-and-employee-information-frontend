import { Geolocation } from '@/types/timesheet/geolocation';
import { AttendanceBreak } from '@/types/timesheet/attendance';

export type AttendanceGeoImageInfo = {
  imageUrl: string | null;
  allowedAreaName: string | null;
};

export type AttendanceImageHoverInfo = AttendanceGeoImageInfo & {
  eventLabel: string;
  timeLabel: string | null;
};

const findGeoWithImage = (
  geolocations?: Geolocation[],
  isSignIn?: boolean,
): Geolocation | null => {
  if (!geolocations?.length) return null;

  const filtered =
    typeof isSignIn === 'boolean'
      ? geolocations.filter((geo) => geo.isSignIn === isSignIn)
      : geolocations;

  return filtered.find((geo) => geo.imagePath) ?? null;
};

const toGeoImageInfo = (geo: Geolocation | null): AttendanceGeoImageInfo => ({
  imageUrl: geo?.imagePath ?? null,
  allowedAreaName: geo?.allowedArea?.title ?? null,
});

/** Main attendance check-in photo and allowed area. */
export const getClockInInfo = (
  geolocations?: Geolocation[],
): AttendanceGeoImageInfo => {
  const recordGeos =
    geolocations?.filter((geo) => !geo.attendanceBreakId) ?? geolocations;
  return toGeoImageInfo(findGeoWithImage(recordGeos, true));
};

/** Main attendance check-out photo and allowed area. */
export const getClockOutInfo = (
  geolocations?: Geolocation[],
): AttendanceGeoImageInfo => {
  const recordGeos =
    geolocations?.filter((geo) => !geo.attendanceBreakId) ?? geolocations;
  return toGeoImageInfo(findGeoWithImage(recordGeos, false));
};

/** Break check-out (start break) photo and allowed area. */
export const getBreakClockOutInfo = (
  attendanceBreak?: AttendanceBreak,
): AttendanceGeoImageInfo => {
  return toGeoImageInfo(findGeoWithImage(attendanceBreak?.geolocations, false));
};

/** Break check-in (end break) photo and allowed area. */
export const getBreakClockInInfo = (
  attendanceBreak?: AttendanceBreak,
): AttendanceGeoImageInfo => {
  return toGeoImageInfo(findGeoWithImage(attendanceBreak?.geolocations, true));
};

/** Prefer check-in photo for row hover; fall back to check-out. */
export const getRowAttendanceImageHoverInfo = (
  record: {
    clockIn?: string | null;
    clockOut?: string | null;
    geolocations?: Geolocation[];
    attendanceBreaks?: AttendanceBreak[];
  },
  hasBreakTypeFilter: boolean,
  formatTimeLabel: (date?: string | null) => string | null,
): AttendanceImageHoverInfo | null => {
  const attendanceBreak = record.attendanceBreaks?.[0];

  const clockInInfo =
    hasBreakTypeFilter && attendanceBreak
      ? getBreakClockInInfo(attendanceBreak)
      : getClockInInfo(record.geolocations);

  if (clockInInfo.imageUrl) {
    const clockInDate =
      hasBreakTypeFilter && attendanceBreak?.breakType
        ? attendanceBreak.endAt
        : record.clockIn;
    return {
      ...clockInInfo,
      eventLabel:
        hasBreakTypeFilter && attendanceBreak?.breakType
          ? 'Break check in'
          : 'Check in',
      timeLabel: formatTimeLabel(clockInDate),
    };
  }

  const clockOutInfo =
    hasBreakTypeFilter && attendanceBreak
      ? getBreakClockOutInfo(attendanceBreak)
      : getClockOutInfo(record.geolocations);

  if (!clockOutInfo.imageUrl) return null;

  const clockOutDate =
    hasBreakTypeFilter && attendanceBreak?.breakType
      ? attendanceBreak.startAt
      : record.clockOut;
  return {
    ...clockOutInfo,
    eventLabel:
      hasBreakTypeFilter && attendanceBreak?.breakType
        ? 'Break check out'
        : 'Check out',
    timeLabel: formatTimeLabel(clockOutDate),
  };
};
