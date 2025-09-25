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
      // Handle cases where break times are null (like formatToAttendanceStatuses pattern)
      if (!takenBreak?.startAt && !takenBreak?.endAt) {
        return {
          status: {
            text: 'Missed Clock-in & Clock-out',
            theme: StatusBadgeTheme.danger,
          },
          disabled: true,
        };
      }

      if (!takenBreak?.startAt) {
        return {
          status: {
            text: 'Missed Clock-out',
            theme: StatusBadgeTheme.danger,
          },
          disabled: true,
        };
      }

      if (!takenBreak?.endAt) {
        return {
          status: {
            text: 'Missed Clock-in',
            theme: StatusBadgeTheme.danger,
          },
          disabled: true,
        };
      }

      // Show late/early information if available (like formatToAttendanceStatuses)
      if (takenBreak.earlyByMinutes > 0 && takenBreak?.lateByMinutes > 0) {
        return {
          status: {
            text: `Early ${minuteToHour(takenBreak?.earlyByMinutes)} hr ${minuteToLastMinute(takenBreak?.earlyByMinutes)} min, Late ${minuteToHour(takenBreak?.lateByMinutes)} hr ${minuteToLastMinute(takenBreak?.lateByMinutes)} min`,
            theme: StatusBadgeTheme.warning,
          },
          disabled: true,
        };
      }

      if (takenBreak.earlyByMinutes > 0) {
        return {
          status: {
            text: `Early ${minuteToHour(takenBreak.earlyByMinutes)} hr ${minuteToLastMinute(takenBreak.earlyByMinutes)} min`,
            theme: StatusBadgeTheme.warning,
          },
          disabled: true,
        };
      }

      if (takenBreak.lateByMinutes > 0) {
        return {
          status: {
            text: `Late ${minuteToHour(takenBreak.lateByMinutes)} hr ${minuteToLastMinute(takenBreak.lateByMinutes)} min`,
            theme: StatusBadgeTheme.danger,
          },
          disabled: true,
        };
      }

      // If no late/early, show completed
      return {
        status: {
          text: 'Checked',
          theme: StatusBadgeTheme.success,
        },
        disabled: true,
      };
    }
  }

  // Handle cases where break times are null
  if (!item.startAt && !item.endAt) {
    return {
      status: {
        text: 'Missed Clock-in & Clock-out',
        theme: StatusBadgeTheme.danger,
      },
      disabled: true,
    };
  }

  if (!item.startAt) {
    return {
      status: {
        text: 'Missed Clock-out',
        theme: StatusBadgeTheme.danger,
      },
      disabled: true,
    };
  }

  if (!item.endAt) {
    return {
      status: {
        text: 'Missed Clock-in',
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

  // Check if current time is within the break time window
  if (currentTime >= breakStartTime && currentTime <= breakEndTime) {
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
