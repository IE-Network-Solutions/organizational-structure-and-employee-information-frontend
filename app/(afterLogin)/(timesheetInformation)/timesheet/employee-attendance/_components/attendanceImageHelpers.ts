import { Geolocation } from '@/types/timesheet/geolocation';
import { AttendanceBreak } from '@/types/timesheet/attendance';

export type AttendanceGeoImageInfo = {
  imageUrl: string | null;
  allowedAreaName: string | null;
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
  return toGeoImageInfo(
    findGeoWithImage(attendanceBreak?.geolocations, false),
  );
};

/** Break check-in (end break) photo and allowed area. */
export const getBreakClockInInfo = (
  attendanceBreak?: AttendanceBreak,
): AttendanceGeoImageInfo => {
  return toGeoImageInfo(findGeoWithImage(attendanceBreak?.geolocations, true));
};
