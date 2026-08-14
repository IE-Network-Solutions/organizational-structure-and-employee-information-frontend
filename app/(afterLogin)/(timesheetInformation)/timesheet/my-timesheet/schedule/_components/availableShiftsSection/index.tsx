'use client';

import { Button, Tag } from 'antd';
import dayjs from 'dayjs';
import { ShiftInstanceView } from '@/types/timesheet/workSchedule';
import {
  formatTimeRange,
  shiftLabel,
} from '@/store/server/features/timesheet/workSchedule/helpers';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/mockService';

interface AvailableShiftsSectionProps {
  myShifts: ShiftInstanceView[];
  availableShifts: ShiftInstanceView[];
  onRequestSwap: (myShiftId: string) => void;
  onSwapForAvailable: (myShiftId: string, targetShiftId: string) => void;
  selectedMyShiftId?: string;
  onSelectMyShift: (id: string) => void;
}

const AvailableShiftsSection = ({
  myShifts,
  availableShifts,
  onRequestSwap,
  onSwapForAvailable,
  selectedMyShiftId,
  onSelectMyShift,
}: AvailableShiftsSectionProps) => {
  const swappableMine = myShifts.filter(
    (item) => item.isSwappable && !item.isCancelled,
  );

  return (
    <section
      className="grid grid-cols-1 xl:grid-cols-2 gap-4"
      data-cy="time-attendance-my-schedule-shifts"
    >
      <div
        className="border border-gray-200 rounded-xl p-4 bg-white"
        data-cy="time-attendance-my-schedule-my-shifts"
      >
        <h3
          className="text-sm font-semibold text-[#4d4d4d] mb-1"
          data-cy="time-attendance-my-schedule-my-shifts-title"
        >
          My upcoming shifts
        </h3>
        <p
          className="text-xs text-gray-500 mb-3"
          data-cy="time-attendance-my-schedule-my-shifts-subtitle"
        >
          Select a shift to swap, then pick an available peer shift or use
          Request Swap.
        </p>

        {swappableMine.length === 0 ? (
          <p
            className="text-sm text-gray-500 mb-0"
            data-cy="time-attendance-my-schedule-my-shifts-empty"
          >
            No swappable upcoming shifts for this employee.
          </p>
        ) : (
          <div
            className="flex flex-col gap-2 max-h-80 overflow-auto"
            data-cy="time-attendance-my-schedule-my-shifts-list"
          >
            {swappableMine.map((shift) => {
              const selected = selectedMyShiftId === shift.id;
              return (
                <div
                  key={shift.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => onSelectMyShift(shift.id)}
                  data-cy={`time-attendance-my-schedule-my-shift-${shift.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="mb-1 text-sm font-medium text-[#4d4d4d]">
                        {dayjs(shift.date).format('ddd, MMM D')} ·{' '}
                        {formatTimeRange(shift.startTime, shift.endTime)}
                      </p>
                      <p className="mb-2 text-xs text-gray-500">
                        {shift.blueprintTitle}
                        {shift.shiftName ? ` · ${shift.shiftName}` : ''}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <Tag>{shiftLabel(shift)}</Tag>
                        <Tag color="success">Swappable</Tag>
                      </div>
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRequestSwap(shift.id);
                      }}
                      data-cy={`time-attendance-my-schedule-my-shift-swap-${shift.id}`}
                    >
                      Request Swap
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div
        className="border border-gray-200 rounded-xl p-4 bg-white"
        data-cy="time-attendance-my-schedule-available-shifts"
      >
        <h3
          className="text-sm font-semibold text-[#4d4d4d] mb-1"
          data-cy="time-attendance-my-schedule-available-title"
        >
          Available shifts
        </h3>
        <p
          className="text-xs text-gray-500 mb-3"
          data-cy="time-attendance-my-schedule-available-subtitle"
        >
          Peer shifts you can swap into. Select one of your shifts first.
        </p>

        {!selectedMyShiftId && (
          <p
            className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3"
            data-cy="time-attendance-my-schedule-available-hint"
          >
            Select one of your upcoming shifts to enable swapping.
          </p>
        )}

        {availableShifts.length === 0 ? (
          <p
            className="text-sm text-gray-500 mb-0"
            data-cy="time-attendance-my-schedule-available-empty"
          >
            No available peer shifts right now.
          </p>
        ) : (
          <div
            className="flex flex-col gap-2 max-h-80 overflow-auto"
            data-cy="time-attendance-my-schedule-available-list"
          >
            {availableShifts.map((shift) => (
              <div
                key={shift.id}
                className="border border-gray-200 rounded-lg p-3"
                data-cy={`time-attendance-my-schedule-available-shift-${shift.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="mb-1 text-sm font-medium text-[#4d4d4d]">
                      {dayjs(shift.date).format('ddd, MMM D')} ·{' '}
                      {formatTimeRange(shift.startTime, shift.endTime)}
                    </p>
                    <p className="mb-2 text-xs text-gray-500">
                      {getEmployeeDisplayName(shift.employee)} ·{' '}
                      {shift.blueprintTitle}
                      {shift.shiftName ? ` · ${shift.shiftName}` : ''}
                    </p>
                    <Tag>{shiftLabel(shift)}</Tag>
                  </div>
                  <Button
                    size="small"
                    type="default"
                    disabled={!selectedMyShiftId}
                    onClick={() => {
                      if (!selectedMyShiftId) return;
                      onSwapForAvailable(selectedMyShiftId, shift.id);
                    }}
                    data-cy={`time-attendance-my-schedule-available-swap-${shift.id}`}
                  >
                    Swap
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AvailableShiftsSection;
