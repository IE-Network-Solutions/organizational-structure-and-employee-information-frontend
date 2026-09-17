import type { SelectProps } from 'antd';
import { CommonObject } from '@/types/commons/commonObject';
import {
  AttendanceRecord,
  AttendanceRecordType,
} from '@/types/timesheet/attendance';
import { BreakType } from '@/types/timesheet/breakType';
import { StatusBadgeTheme } from '@/components/common/statusBadge';
import { minuteToHour, minuteToLastMinute } from '@/helpers/calculateHelper';
import { UploadFile } from 'antd/es/upload/interface';

type Options = SelectProps['options'];

export const formatToOptions = <T extends CommonObject>(
  items: T[],
  labelKey: keyof T,
  valueKey: keyof T,
): Options => {
  return items?.map((item) => ({
    value: item[valueKey],
    label: item[labelKey],
  }));
};

export const formatToAttendanceStatuses = (
  item: AttendanceRecord,
): { status: AttendanceRecordType; text: string }[] => {
  if (!item) return [];
  if (item.isAbsent) {
    return [{ status: AttendanceRecordType.ABSENT, text: '' }];
  }

  if (item.earlyByMinutes > 0 && item.lateByMinutes > 0) {
    return [
      {
        status: AttendanceRecordType.EARLY,
        text: `${minuteToHour(item.earlyByMinutes)} hr ${minuteToLastMinute(item.earlyByMinutes)} min`,
      },
      {
        status: AttendanceRecordType.LATE,
        text: `${minuteToHour(item.lateByMinutes)} hr ${minuteToLastMinute(item.lateByMinutes)} min`,
      },
    ];
  }

  if (item.earlyByMinutes > 0) {
    return [
      {
        status: AttendanceRecordType.EARLY,
        text: `${minuteToHour(item.earlyByMinutes)} hr ${minuteToLastMinute(item.earlyByMinutes)} min`,
      },
    ];
  }

  if (item.lateByMinutes > 0) {
    return [
      {
        status: AttendanceRecordType.LATE,
        text: `${minuteToHour(item.lateByMinutes)} hr ${minuteToLastMinute(item.lateByMinutes)} min`,
      },
    ];
  }

  return [
    {
      status: AttendanceRecordType.PRESENT,
      text: ``,
    },
  ];
};

export interface BreakTypeStatus {
  status: {
    text: string;
    theme: StatusBadgeTheme;
  };
  disabled: boolean;
}

const formatBreakMinutes = (value: number): string => {
  const hours = minuteToHour(value);
  const mins = minuteToLastMinute(value);
  if (hours > 0) {
    return `${hours} hr ${mins} min`;
  }
  return `${mins} min`;
};

/** Build human-readable compliance labels for a taken attendance break.
 * Prefers explicit capture-window fields; falls back to earlyBy/lateBy
 * compat mirrors for pre-migration rows only.
 */
export const buildTakenBreakComplianceLabels = (
  takenBreak: NonNullable<AttendanceRecord['attendanceBreaks']>[number],
): string[] => {
  const labels: string[] = [];
  const earlyBreakout =
    (takenBreak.earlyBreakoutByMinutes ?? 0) > 0
      ? takenBreak.earlyBreakoutByMinutes!
      : takenBreak.earlyByMinutes > 0
        ? takenBreak.earlyByMinutes
        : 0;
  const lateBreakin =
    (takenBreak.lateBreakinByMinutes ?? 0) > 0
      ? takenBreak.lateBreakinByMinutes!
      : takenBreak.lateByMinutes > 0
        ? takenBreak.lateByMinutes
        : 0;
  const missedOutBand = takenBreak.missedBreakoutBandByMinutes ?? 0;
  const missedInBand = takenBreak.missedBreakinBandByMinutes ?? 0;

  if (!takenBreak.startAt && !takenBreak.endAt) {
    labels.push('Missed breakout & breakin');
  } else {
    // Punch-miss labels follow timestamps only (ignore stale miss flags).
    if (!takenBreak.startAt) {
      labels.push('Missed breakout');
    }
    if (!takenBreak.endAt) {
      labels.push('Missed breakin');
    }
  }

  if (earlyBreakout > 0) {
    labels.push(`Early breakout by ${formatBreakMinutes(earlyBreakout)}`);
  }
  if (lateBreakin > 0) {
    labels.push(`Late breakin by ${formatBreakMinutes(lateBreakin)}`);
  }
  if (missedOutBand > 0) {
    labels.push(
      `Missed breakout band by ${formatBreakMinutes(missedOutBand)}`,
    );
  }
  if (missedInBand > 0) {
    labels.push(`Missed breakin band by ${formatBreakMinutes(missedInBand)}`);
  }

  // Deduplicate (e.g. null startAt + missedBreakout flag).
  return [...new Set(labels)];
};

const parseWallClockMinutes = (
  value?: string | Date | null,
): number | null => {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.getUTCHours() * 60 + value.getUTCMinutes();
  }
  const asString = String(value).trim();
  // HH:mm / HH:mm:ss schedule strings on BreakType
  if (/^\d{1,2}:\d{2}/.test(asString) && !asString.includes('T')) {
    const parts = asString.split(':').map(Number);
    if (parts.length >= 2 && !parts.some((part) => Number.isNaN(part))) {
      return parts[0] * 60 + parts[1];
    }
  }
  // ISO wall-clock stored as UTC components
  const parsed = new Date(asString);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.getUTCHours() * 60 + parsed.getUTCMinutes();
};

const minutesBetween = (later: number, earlier: number): number =>
  Math.max(0, Math.round(later - earlier));

/**
 * Derive compliance labels from break-type windows + punch timestamps so the
 * UI stays correct even when stored compliance flags/minutes are stale.
 */
export const buildBreakComplianceLabelsFromWindows = (
  breakType: Pick<
    BreakType,
    | 'startAt'
    | 'endAt'
    | 'startAtFrom'
    | 'startAtTo'
    | 'endAtFrom'
    | 'endAtTo'
    | 'captureStartAt'
    | 'captureEndAt'
  >,
  takenBreak: NonNullable<AttendanceRecord['attendanceBreaks']>[number],
): string[] => {
  const scheduledStart = parseWallClockMinutes(breakType.startAt);
  const scheduledEnd = parseWallClockMinutes(breakType.endAt);
  const leaveTo = parseWallClockMinutes(breakType.startAtTo);
  const returnFrom = parseWallClockMinutes(breakType.endAtFrom);
  const hasLeaveBand = !!(breakType.startAtFrom && breakType.startAtTo);
  const hasReturnBand = !!(breakType.endAtFrom && breakType.endAtTo);

  const breakout = parseWallClockMinutes(takenBreak.startAt);
  const breakin = parseWallClockMinutes(takenBreak.endAt);

  let earlyBreakout = 0;
  let lateBreakin = 0;
  let missedOutBand = 0;
  let missedInBand = 0;

  if (breakout !== null) {
    if (scheduledStart !== null && breakout < scheduledStart) {
      earlyBreakout = minutesBetween(scheduledStart, breakout);
    } else if (hasLeaveBand && leaveTo !== null && breakout > leaveTo) {
      missedOutBand = minutesBetween(breakout, leaveTo);
    }
  }

  if (breakin !== null) {
    if (scheduledEnd !== null && breakin > scheduledEnd) {
      lateBreakin = minutesBetween(breakin, scheduledEnd);
    } else if (hasReturnBand && returnFrom !== null && breakin < returnFrom) {
      missedInBand = minutesBetween(returnFrom, breakin);
    }
  }

  return buildTakenBreakComplianceLabels({
    ...takenBreak,
    earlyBreakoutByMinutes: earlyBreakout,
    lateBreakinByMinutes: lateBreakin,
    missedBreakoutBandByMinutes: missedOutBand,
    missedBreakinBandByMinutes: missedInBand,
    earlyByMinutes: earlyBreakout,
    lateByMinutes: lateBreakin,
    missedBreakout: !takenBreak.startAt,
    missedBreakin: !takenBreak.endAt,
  });
};

const themeForBreakLabels = (labels: string[]): StatusBadgeTheme => {
  const joined = labels.join(' ').toLowerCase();
  if (joined.includes('missed')) return StatusBadgeTheme.danger;
  if (joined.includes('late')) return StatusBadgeTheme.danger;
  if (joined.includes('early')) return StatusBadgeTheme.warning;
  return StatusBadgeTheme.success;
};

export const formatBreakTypeToStatus = (
  item: BreakType,
  currentAttendance: AttendanceRecord | null,
): BreakTypeStatus => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes for easier comparison

  if (currentAttendance) {
    const takenBreak = currentAttendance.attendanceBreaks?.find(
      (itemBreak) => itemBreak.breakTypeId === item.id,
    );
    if (takenBreak) {
      const labels =
        item?.startAt && item?.endAt
          ? buildBreakComplianceLabelsFromWindows(item, takenBreak)
          : buildTakenBreakComplianceLabels(takenBreak);
      if (labels.length) {
        return {
          status: {
            text: labels.join(', '),
            theme: themeForBreakLabels(labels),
          },
          disabled: true,
        };
      }

      // If no compliance issues and both punches exist, show completed
      if (takenBreak.startAt && takenBreak.endAt) {
        return {
          status: {
            text: 'Checked',
            theme: StatusBadgeTheme.success,
          },
          disabled: true,
        };
      }
    }
  }

  // Handle cases where break schedule times are null
  if (!item?.startAt && !item?.endAt) {
    return {
      status: {
        text: 'Missed breakout & breakin',
        theme: StatusBadgeTheme.danger,
      },
      disabled: true,
    };
  }

  if (!item?.startAt) {
    return {
      status: {
        text: 'Missed breakout',
        theme: StatusBadgeTheme.danger,
      },
      disabled: true,
    };
  }

  if (!item?.endAt) {
    return {
      status: {
        text: 'Missed breakin',
        theme: StatusBadgeTheme.danger,
      },
      disabled: true,
    };
  }

  const splitTime = (time: string) => time.split(':');
  const breakStartTime =
    +splitTime(item.startAt)[0] * 60 + +splitTime(item.startAt)[1]; // Convert to minutes
  const breakEndTime =
    +splitTime(item.endAt)[0] * 60 + +splitTime(item.endAt)[1]; // Convert to minutes

  // Break window is [start, end): hidden at start, visible again at end time.
  if (currentTime >= breakStartTime && currentTime < breakEndTime) {
    return {
      status: {
        text: 'Available',
        theme: StatusBadgeTheme.success,
      },
      disabled: false,
    };
  } else if (currentTime < breakStartTime) {
    const minutesUntilStart = breakStartTime - currentTime;
    return {
      status: {
        text: `Not Yet (${minutesUntilStart}m)`,
        theme: StatusBadgeTheme.warning,
      },
      disabled: false,
    };
  } else {
    const minutesLate = currentTime - breakEndTime;
    return {
      status: {
        text: `Missed (${minutesLate}m late)`,
        theme: StatusBadgeTheme.danger,
      },
      disabled: true,
    };
  }
};

/** Convert an "HH:mm" / "HH:mm:ss" time string into minutes since midnight. */
const timeStringToMinutes = (time: string): number | null => {
  const parts = time.split(':');
  if (parts.length < 2) return null;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

/** True when `nowMinutes` falls inside the break type's [startAt, endAt) window. */
const isBreakTypeActiveAt = (item: BreakType, nowMinutes: number): boolean => {
  if (!item?.startAt || !item?.endAt) return false;
  const start = timeStringToMinutes(item.startAt);
  const end = timeStringToMinutes(item.endAt);
  if (start === null || end === null) return false;
  return nowMinutes >= start && nowMinutes < end;
};

const isWithinInclusiveBand = (
  nowMinutes: number,
  from?: string | null,
  to?: string | null,
): boolean => {
  if (!from || !to) return false;
  const start = timeStringToMinutes(from);
  const end = timeStringToMinutes(to);
  if (start === null || end === null) return false;
  return nowMinutes >= start && nowMinutes <= end;
};

/**
 * Remote Break Check Out: Allowed leave band when both bounds exist,
 * otherwise scheduled startAt–endAt (inclusive).
 */
export const isWithinBreakLeaveBand = (
  breakTypes: BreakType[] | null | undefined,
  now: Date = new Date(),
): boolean => {
  if (!breakTypes?.length) return false;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return breakTypes.some((bt) => {
    if (bt.startAtFrom && bt.startAtTo) {
      return isWithinInclusiveBand(nowMinutes, bt.startAtFrom, bt.startAtTo);
    }
    return isWithinInclusiveBand(nowMinutes, bt.startAt, bt.endAt);
  });
};

/**
 * Remote Break Check In: Allowed return band when both bounds exist,
 * otherwise scheduled startAt–endAt (inclusive).
 */
export const isWithinBreakReturnBand = (
  breakTypes: BreakType[] | null | undefined,
  now: Date = new Date(),
): boolean => {
  if (!breakTypes?.length) return false;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return breakTypes.some((bt) => {
    if (bt.endAtFrom && bt.endAtTo) {
      return isWithinInclusiveBand(nowMinutes, bt.endAtFrom, bt.endAtTo);
    }
    return isWithinInclusiveBand(nowMinutes, bt.startAt, bt.endAt);
  });
};

/**
 * Returns true when the current wall-clock time is inside any configured break
 * window. Each break type (lunch, tea break, etc.) is configured with a
 * `startAt`/`endAt` time range using a half-open interval [start, end): the
 * break is active at start time and ends exactly at end time.
 *
 * Used to hide the Check-Out button during a break period and show it again
 * once the break ends.
 */
export const isWithinBreakPeriod = (
  breakTypes: BreakType[] | null | undefined,
  now: Date = new Date(),
): boolean => {
  if (!breakTypes?.length) return false;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return breakTypes.some((bt) => isBreakTypeActiveAt(bt, nowMinutes));
};

export const formatLinkToUploadFile = (link: string): UploadFile => {
  const splitedLink = link.split('/');
  const fileName = splitedLink[splitedLink.length - 1];

  return {
    uid: fileName + Date.now(),
    name: fileName,
    status: 'done',
    response: link,
    thumbUrl: link,
  };
};

export const formatBase64ToFile = (
  base64String: string,
  fileName: string,
): File => {
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], fileName, { type: mime });
};

export const formatFileNameToShort = (
  fileName: string,
  maxLength: number = 10,
) => {
  if (fileName.length <= maxLength) {
    return fileName;
  }

  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex === -1 || dotIndex === 0) {
    return fileName.slice(0, maxLength);
  }

  const extension = fileName.slice(dotIndex);
  const nameWithoutExtension = fileName.slice(0, dotIndex);

  return nameWithoutExtension.slice(0, maxLength) + extension.slice(0, 5);
};
