'use client';

import { Button, Drawer, Tag } from 'antd';
import { ShiftInstanceView } from '@/types/timesheet/workSchedule';
import {
  formatTimeRange,
  shiftLabel,
} from '@/store/server/features/timesheet/workSchedule/helpers';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/mockService';

interface EmployeeShiftDrawerProps {
  instance: ShiftInstanceView | null;
  open: boolean;
  onClose: () => void;
  onRequestSwap: (instanceId: string) => void;
}

const EmployeeShiftDrawer = ({
  instance,
  open,
  onClose,
  onRequestSwap,
}: EmployeeShiftDrawerProps) => {
  return (
    <Drawer
      title="Shift details"
      open={open}
      onClose={onClose}
      width={420}
      data-cy="time-attendance-my-schedule-shift-drawer"
    >
      {!instance ? null : (
        <div
          className="flex flex-col gap-3"
          data-cy="time-attendance-my-schedule-shift-drawer-body"
        >
          <div data-cy="time-attendance-my-schedule-shift-drawer-header">
            <p
              className="mb-1 text-lg font-semibold text-[#4d4d4d]"
              data-cy="time-attendance-my-schedule-shift-drawer-title"
            >
              {instance.blueprintTitle}
            </p>
            <p
              className="mb-0 text-sm text-gray-500"
              data-cy="time-attendance-my-schedule-shift-drawer-employee"
            >
              {getEmployeeDisplayName(instance.employee)}
            </p>
          </div>
          <p
            className="mb-0 text-sm text-[#4d4d4d]"
            data-cy="time-attendance-my-schedule-shift-drawer-time"
          >
            {instance.date} ·{' '}
            {formatTimeRange(instance.startTime, instance.endTime)}
          </p>
          <div
            className="flex gap-2"
            data-cy="time-attendance-my-schedule-shift-drawer-tags"
          >
            <Tag>{shiftLabel(instance)}</Tag>
            <Tag color={instance.isSwappable ? 'success' : 'default'}>
              {instance.isSwappable ? 'Swappable' : 'Fixed'}
            </Tag>
          </div>
          {instance.isSwappable && !instance.isCancelled ? (
            <Button
              type="primary"
              className="h-10 mt-2"
              onClick={() => onRequestSwap(instance.id)}
              data-cy="time-attendance-my-schedule-request-swap"
            >
              Request Swap
            </Button>
          ) : (
            <p
              className="text-sm text-gray-500 mb-0"
              data-cy="time-attendance-my-schedule-shift-drawer-note"
            >
              {instance.isCancelled
                ? 'This shift instance was cancelled.'
                : 'This shift is fixed and cannot be swapped.'}
            </p>
          )}
        </div>
      )}
    </Drawer>
  );
};

export default EmployeeShiftDrawer;
