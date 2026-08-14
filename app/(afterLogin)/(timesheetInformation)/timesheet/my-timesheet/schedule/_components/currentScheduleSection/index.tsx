'use client';

import { Tag } from 'antd';
import {
  formatTimeRange,
  shiftsForWeekday,
} from '@/store/server/features/timesheet/workSchedule/helpers';
import {
  WEEKDAYS,
  WorkScheduleBlueprint,
  WorkScheduleShift,
} from '@/types/timesheet/workSchedule';

type AssignmentView = {
  id: string;
  blueprint: WorkScheduleBlueprint;
  shifts: WorkScheduleShift[];
};

interface CurrentScheduleSectionProps {
  assignments: AssignmentView[];
}

const CurrentScheduleSection = ({
  assignments,
}: CurrentScheduleSectionProps) => {
  return (
    <section
      className="border border-gray-200 rounded-xl p-4 bg-white"
      data-cy="time-attendance-my-schedule-current"
    >
      <h3
        className="text-sm font-semibold text-[#4d4d4d] mb-1"
        data-cy="time-attendance-my-schedule-current-title"
      >
        Current work schedule
      </h3>
      <p
        className="text-xs text-gray-500 mb-4"
        data-cy="time-attendance-my-schedule-current-subtitle"
      >
        Your assigned permanent schedule and shifts.
      </p>

      {assignments.length === 0 ? (
        <p
          className="text-sm text-gray-500 mb-0"
          data-cy="time-attendance-my-schedule-current-empty"
        >
          No work schedule is assigned to this employee yet.
        </p>
      ) : (
        <div
          className="flex flex-col gap-4"
          data-cy="time-attendance-my-schedule-current-list"
        >
          {assignments.map((assignment) => {
            const { blueprint, shifts } = assignment;
            return (
              <div
                key={assignment.id}
                className="border border-gray-100 rounded-lg p-3 bg-gray-50"
                data-cy={`time-attendance-my-schedule-current-item-${assignment.id}`}
              >
                <div
                  className="flex flex-wrap items-center gap-2 mb-2"
                  data-cy={`time-attendance-my-schedule-current-header-${assignment.id}`}
                >
                  <p
                    className="mb-0 text-base font-semibold text-[#4d4d4d]"
                    data-cy={`time-attendance-my-schedule-current-name-${assignment.id}`}
                  >
                    {blueprint.title}
                  </p>
                  <Tag color={blueprint.isSwappable ? 'success' : 'default'}>
                    {blueprint.isSwappable ? 'Swappable' : 'Fixed'}
                  </Tag>
                  {blueprint.hasShifts ? (
                    <Tag color="blue">Shift-based</Tag>
                  ) : (
                    <Tag>Full day window</Tag>
                  )}
                </div>

                <p
                  className="mb-2 text-sm text-gray-600"
                  data-cy={`time-attendance-my-schedule-current-window-${assignment.id}`}
                >
                  Work window:{' '}
                  {formatTimeRange(
                    blueprint.defaultStartTime,
                    blueprint.defaultEndTime,
                  )}{' '}
                  · {blueprint.activeWeekdays.join(', ')}
                </p>

                {blueprint.hasShifts ? (
                  <div
                    className="flex flex-col gap-2"
                    data-cy={`time-attendance-my-schedule-current-shifts-${assignment.id}`}
                  >
                    <p className="mb-0 text-xs font-medium text-[#4d4d4d]">
                      Assigned shifts
                    </p>
                    {shifts.length === 0 ? (
                      <p className="mb-0 text-xs text-gray-500">
                        No shifts selected on this schedule.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {shifts.map((shift) => (
                          <Tag
                            key={shift.id}
                            color="blue"
                            className="px-2 py-1 text-xs"
                            data-cy={`time-attendance-my-schedule-current-shift-${shift.id}`}
                          >
                            {shift.name}:{' '}
                            {formatTimeRange(shift.startTime, shift.endTime)} ·{' '}
                            {shift.weekdays.join(', ')}
                          </Tag>
                        ))}
                      </div>
                    )}
                    <div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-1"
                      data-cy={`time-attendance-my-schedule-current-weekdays-${assignment.id}`}
                    >
                      {WEEKDAYS.filter((day) =>
                        blueprint.activeWeekdays.includes(day),
                      ).map((day) => {
                        const dayShifts = shiftsForWeekday(
                          { shifts },
                          day,
                        );
                        return (
                          <div
                            key={day}
                            className="rounded-md border border-gray-200 bg-white px-2 py-1.5"
                            data-cy={`time-attendance-my-schedule-current-day-${assignment.id}-${day}`}
                          >
                            <p className="mb-1 text-xs font-medium text-[#4d4d4d]">
                              {day}
                            </p>
                            {dayShifts.length === 0 ? (
                              <p className="mb-0 text-[11px] text-gray-400">
                                Full window ·{' '}
                                {formatTimeRange(
                                  blueprint.defaultStartTime,
                                  blueprint.defaultEndTime,
                                )}
                              </p>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {dayShifts.map((shift) => (
                                  <Tag
                                    key={shift.id}
                                    className="m-0 text-[11px]"
                                  >
                                    {shift.name}{' '}
                                    {formatTimeRange(
                                      shift.startTime,
                                      shift.endTime,
                                    )}
                                  </Tag>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p
                    className="mb-0 text-xs text-gray-500"
                    data-cy={`time-attendance-my-schedule-current-full-day-${assignment.id}`}
                  >
                    This schedule uses the full day window on active weekdays
                    (no named shifts).
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CurrentScheduleSection;
