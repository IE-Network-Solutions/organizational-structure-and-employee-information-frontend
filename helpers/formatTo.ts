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
  return items.map((item) => ({
    value: item[valueKey],
    label: item[labelKey],
  }));
};

export const formatToAttendanceStatuses = (
  item: AttendanceRecord,
): { status: AttendanceRecordType; text: string }[] => {
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
  const itemStartAt = new Date();
  const itemEndAt = new Date();
  const now = Date.now();

  if (currentAttendance) {
    const takenBreak = currentAttendance.attendanceBreaks?.find(
      (itemBreak) => itemBreak.breakTypeId === item.id,
    );
    if (takenBreak) {
      return {
        status: {
          text: 'Checked',
          theme: StatusBadgeTheme.success,
        },
        disabled: true,
      };
    }
  }

  const splitTime = (time: string) => time.split(':');
  itemStartAt.setHours(
    +splitTime(item.startAt)[0],
    +splitTime(item.startAt)[1],
  );
  itemEndAt.setHours(+splitTime(item.endAt)[0], +splitTime(item.endAt)[1]);

  if (itemEndAt.getTime() >= now) {
    return {
      status: {
        text: 'Not Yet',
        theme: StatusBadgeTheme.warning,
      },
      disabled: false,
    };
  } else {
    return {
      status: {
        text: 'Missed',
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
    uid: fileName,
    name: fileName,
    status: 'done',
    response: link,
  };
};
