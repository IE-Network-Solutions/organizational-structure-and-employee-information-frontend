import L from 'leaflet';
import { AllowedArea } from '@/types/timesheet/settings';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAttendanceLocationErrorStore } from '@/store/uistate/features/timesheet/attendanceLocationError';
import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

export type UserCoords = {
  latitude: number;
  longitude: number;
};

export type AreaDistanceSummary = {
  area: AllowedArea;
  distanceMeters: number;
  isInside: boolean;
};

export function getDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  return L.latLng(lat1, lng1).distanceTo(L.latLng(lat2, lng2));
}

export function isInsideAllowedArea(
  userLat: number,
  userLng: number,
  area: AllowedArea,
): boolean {
  const radiusMeters = Number(area.distance) || 0;
  return (
    getDistanceMeters(userLat, userLng, area.latitude, area.longitude) <=
    radiusMeters
  );
}

export function formatDistanceMeters(meters: number): string {
  if (!Number.isFinite(meters) || meters < 0) return '—';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** East edge of a geofence circle — used for radius labels on maps */
export function getCircleEdgeLatLng(
  lat: number,
  lng: number,
  radiusMeters: number,
): [number, number] {
  const metersPerDegreeLng =
    111320 * Math.cos((lat * Math.PI) / 180) || 111320;
  const deltaLng = radiusMeters / metersPerDegreeLng;
  return [lat, lng + deltaLng];
}

/** Bounding box for a geofence circle (no map required — unlike L.circle#getBounds). */
export function getAllowedAreaCircleBounds(
  area: AllowedArea,
): L.LatLngBounds | null {
  const radiusMeters = Number(area.distance) || 0;
  if (radiusMeters <= 0) return null;

  const lat = area.latitude;
  const lng = area.longitude;
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng =
    111320 * Math.cos((lat * Math.PI) / 180) || 111320;

  return L.latLngBounds(
    L.latLng(
      lat - radiusMeters / metersPerDegreeLat,
      lng - radiusMeters / metersPerDegreeLng,
    ),
    L.latLng(
      lat + radiusMeters / metersPerDegreeLat,
      lng + radiusMeters / metersPerDegreeLng,
    ),
  );
}

export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function filterUserAllowedAreas(
  areas: AllowedArea[],
  userId: string | null | undefined,
): AllowedArea[] {
  const filtered = areas.filter(
    (area) =>
      area.isGlobal ||
      (userId != null &&
        area.allowedUserAccesses?.some((access) => access.userId === userId)),
  );
  return filtered.length > 0 ? filtered : areas;
}

export function getAreaDistanceSummaries(
  userCoords: UserCoords,
  areas: AllowedArea[],
): AreaDistanceSummary[] {
  return areas
    .map((area) => {
      const distanceMeters = getDistanceMeters(
        userCoords.latitude,
        userCoords.longitude,
        area.latitude,
        area.longitude,
      );
      return {
        area,
        distanceMeters,
        isInside: distanceMeters <= (Number(area.distance) || 0),
      };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

export function getNearestAreaSummary(
  summaries: AreaDistanceSummary[],
): AreaDistanceSummary | null {
  return summaries[0] ?? null;
}

export function getShiftErrorMessage(error: unknown): string {
  const err = error as { response?: { data?: { message?: string } } };
  return (
    err?.response?.data?.message ??
    'Unable to record attendance. Please try again.'
  );
}

export function handleAttendanceShiftError(
  error: unknown,
  userCoords: UserCoords | null,
): void {
  const message = getShiftErrorMessage(error);

  if (userCoords) {
    const { userId } = useAuthenticationStore.getState();
    const allAreas = useMyTimesheetStore.getState().allowedAreas;
    const allowedAreas = filterUserAllowedAreas(allAreas, userId);

    useAttendanceLocationErrorStore.getState().showModal({
      message,
      userCoords,
      allowedAreas,
    });
    return;
  }

  NotificationMessage.error({
    message: 'Attendance failed',
    description: message,
  });
}
