import { DateInfo } from '@/types/commons/dateInfo';

export enum AttendanceDevicePurpose {
  ATTENDANCE = 'ATTENDANCE',
  ACCESS_CONTROL = 'ACCESS_CONTROL',
  BOTH = 'BOTH',
}

export interface AttendanceDevice extends DateInfo {
  id: string;
  name: string;
  serialNumber: string;
  externalDeviceId: number | null;
  purpose: AttendanceDevicePurpose;
  acceptUnknownPunches: boolean;
  enabled: boolean;
  areaName: string | null;
  zktIsAttendance: boolean | null;
}

export interface DiscoveredAttendanceDevice {
  externalDeviceId: number | null;
  serialNumber: string;
  name: string;
  area?: { area_name?: string } | null;
  state: string | null;
  isAttendance: boolean;
  configuredDevice: AttendanceDevice | null;
}
