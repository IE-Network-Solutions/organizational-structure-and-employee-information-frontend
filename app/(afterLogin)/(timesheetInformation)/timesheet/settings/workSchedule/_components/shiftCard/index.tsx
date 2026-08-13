'use client';

import { Tag } from 'antd';
import { ShiftInstanceView } from '@/types/timesheet/workSchedule';
import {
  formatTimeRange,
  shiftLabel,
} from '@/store/server/features/timesheet/workSchedule/helpers';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/mockService';

interface ShiftCardProps {
  instance: ShiftInstanceView;
  showEmployee?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

const ShiftCard = ({
  instance,
  showEmployee = false,
  compact = false,
  onClick,
}: ShiftCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-lg border border-gray-200 bg-white hover:border-primary/60 transition-colors ${
        compact ? 'p-1.5' : 'p-3'
      }`}
      data-cy={`time-attendance-settings-work-schedule-shift-card-${instance.id}`}
      id={`time-attendance-settings-work-schedule-shift-card-${instance.id}`}
    >
      <div
        className={`font-semibold text-[#4d4d4d] ${compact ? 'text-[10px] leading-tight' : 'text-sm'}`}
        data-cy={`time-attendance-settings-work-schedule-shift-card-time-${instance.id}`}
      >
        {formatTimeRange(instance.startTime, instance.endTime)}
      </div>
      <div
        className={`text-[#4d4d4d] ${compact ? 'text-[10px]' : 'text-xs mt-1'}`}
        data-cy={`time-attendance-settings-work-schedule-shift-card-type-${instance.id}`}
      >
        {shiftLabel(instance)}
      </div>
      {showEmployee && (
        <div
          className={`text-gray-500 truncate ${compact ? 'text-[10px]' : 'text-xs mt-1'}`}
          data-cy={`time-attendance-settings-work-schedule-shift-card-employee-${instance.id}`}
        >
          {getEmployeeDisplayName(instance.employee)}
        </div>
      )}
      <div
        className={compact ? 'mt-1' : 'mt-2'}
        data-cy={`time-attendance-settings-work-schedule-shift-card-badge-wrap-${instance.id}`}
      >
        <Tag
          color={instance.isSwappable ? 'success' : 'default'}
          className={compact ? '!m-0 !text-[10px] !px-1 !leading-4' : '!m-0'}
          data-cy={`time-attendance-settings-work-schedule-shift-card-badge-${instance.id}`}
        >
          {instance.isSwappable ? 'Swappable' : 'Fixed'}
        </Tag>
      </div>
    </button>
  );
};

export default ShiftCard;
