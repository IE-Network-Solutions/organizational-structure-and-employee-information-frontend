import type { SelectProps } from 'antd';
import { CommonObject } from '@/types/commons/commonObject';
import {
  AttendanceRecord,
  AttendanceRecordType,
} from '@/types/timesheet/attendance';
import { BreakType } from '@/types/timesheet/breakType';
import { StatusBadgeTheme } from '@/components/common/statusBadge';

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

export const formatToAttendanceType = (
  item: AttendanceRecord,
): AttendanceRecordType => {
  if (item.isAbsent) {
    return AttendanceRecordType.ABSENT;
  }

  if (item.earlyByMinutes > 0) {
    return AttendanceRecordType.EARLY;
  }

  if (item.lateByMinutes > 0) {
    return AttendanceRecordType.LATE;
  }

  return AttendanceRecordType.PRESENT;
};

export interface BreakTypeStatus {
  status: {
    text: string;
    theme: StatusBadgeTheme;
  };
  disabled: boolean;
}

export const formatBreakTypeToStatus = (item: BreakType): BreakTypeStatus => {
  const itemStartAt = new Date();
  const itemEndAt = new Date();
  const now = Date.now();

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
