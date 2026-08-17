'use client';

import { useMemo, useState } from 'react';
import { Button, Card, Select, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import RequestSwapModal from '@/app/(afterLogin)/(timesheetInformation)/timesheet/settings/workSchedule/_components/requestSwapModal';
import ScheduleTableFilter, {
  resolveDefaultWeekStart,
  ScheduleWeekFilterValue,
} from './_components/scheduleFilter';
import SwapRequestsSection from './_components/swapRequestsSection';
import { useWorkScheduleUiStore } from '@/store/uistate/features/timesheet/workSchedule';
import {
  useGetMockEmployees,
  useGetShiftInstances,
  useGetSwapRequests,
} from '@/store/server/features/timesheet/workSchedule/queries';
import {
  DATE_FORMAT,
  formatTimeRange,
} from '@/store/server/features/timesheet/workSchedule/helpers';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/mockService';
import { usePeerRespondToSwap } from '@/store/server/features/timesheet/workSchedule/mutation';
import {
  ShiftInstanceView,
  SWAP_STATUS_LABEL,
  SwapRequestView,
} from '@/types/timesheet/workSchedule';

dayjs.extend(isoWeek);

const EMPTY_EMPLOYEES: NonNullable<
  ReturnType<typeof useGetMockEmployees>['data']
> = [];
const EMPTY_INSTANCES: ShiftInstanceView[] = [];
const EMPTY_SWAPS: SwapRequestView[] = [];

const PENDING_OUTGOING_STATUSES = new Set(['PENDING_PEER', 'PENDING_ADMIN']);

const MySchedulePage = () => {
  const { demoPersonaId, setDemoPersonaId, openSwapModal } =
    useWorkScheduleUiStore();
  const { mutate: respondToSwap, isLoading: isResponding } =
    usePeerRespondToSwap();

  const [weekFilter, setWeekFilter] = useState<ScheduleWeekFilterValue>(() => {
    const month = dayjs().startOf('month');
    return {
      month,
      weekStart: resolveDefaultWeekStart(month, dayjs()),
    };
  });

  const weekStart = dayjs(weekFilter.weekStart).startOf('isoWeek');
  const weekEnd = weekStart.endOf('isoWeek');
  const from = weekStart.format(DATE_FORMAT);
  const to = weekEnd.format(DATE_FORMAT);

  const { data: employeesData } = useGetMockEmployees();
  const employees = employeesData ?? EMPTY_EMPLOYEES;
  const { data: myInstancesData } = useGetShiftInstances({
    from,
    to,
    userId: demoPersonaId,
  });
  const myInstances = myInstancesData ?? EMPTY_INSTANCES;
  const { data: swapsData } = useGetSwapRequests({ userId: demoPersonaId });
  const swaps = swapsData ?? EMPTY_SWAPS;

  const weekDays = useMemo(() => {
    const start = dayjs(weekFilter.weekStart).startOf('isoWeek');
    const shiftsByDate = new Map<string, ShiftInstanceView[]>();
    for (const item of myInstances) {
      if (item.isCancelled) continue;
      const list = shiftsByDate.get(item.date) || [];
      list.push(item);
      shiftsByDate.set(item.date, list);
    }

    return Array.from({ length: 7 }, (_, index) => {
      const date = start.add(index, 'day');
      const key = date.format(DATE_FORMAT);
      const dayShifts = (shiftsByDate.get(key) || []).sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      );
      return { date: key, day: date, dayShifts };
    });
  }, [myInstances, weekFilter.weekStart]);

  const incomingByTargetShiftId = useMemo(() => {
    const map = new Map<string, SwapRequestView[]>();
    for (const swap of swaps) {
      if (
        swap.targetUserId === demoPersonaId &&
        swap.status === 'PENDING_PEER'
      ) {
        const list = map.get(swap.targetShiftId) || [];
        list.push(swap);
        map.set(swap.targetShiftId, list);
      }
    }
    return map;
  }, [swaps, demoPersonaId]);

  const outgoingByRequesterShiftId = useMemo(() => {
    const map = new Map<string, SwapRequestView[]>();
    for (const swap of swaps) {
      if (
        swap.requesterId === demoPersonaId &&
        PENDING_OUTGOING_STATUSES.has(swap.status)
      ) {
        const list = map.get(swap.requesterShiftId) || [];
        list.push(swap);
        map.set(swap.requesterShiftId, list);
      }
    }
    return map;
  }, [swaps, demoPersonaId]);

  const persona = employees.find((item) => item.id === demoPersonaId);

  return (
    <div
      className="border border-[#D9D9D9] rounded-lg bg-white"
      data-cy="time-attendance-my-schedule-page"
      id="time-attendance-my-schedule-page"
    >
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 pt-4 pb-3"
        data-cy="time-attendance-my-schedule-header"
      >
        <div data-cy="time-attendance-my-schedule-header-text">
          <h2
            className="text-lg font-semibold text-[#4d4d4d] mb-1"
            data-cy="time-attendance-my-schedule-title"
          >
            My Schedule
          </h2>
          <p
            className="text-sm text-gray-500 mb-0"
            data-cy="time-attendance-my-schedule-subtitle"
          >
            Week of {weekStart.format('MMM D')} – {weekEnd.format('MMM D')}
            {persona ? ` · ${getEmployeeDisplayName(persona)}` : ''}
          </p>
        </div>
        <Select
          className="w-full sm:w-64 h-8 [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!min-h-8 [&_.ant-select-selector]:!rounded-lg"
          value={demoPersonaId}
          onChange={setDemoPersonaId}
          options={employees.map((item) => ({
            value: item.id,
            label: `${getEmployeeDisplayName(item)} · ${item.jobTitle}`,
          }))}
          data-cy="time-attendance-my-schedule-persona"
        />
      </div>

      <div
        className="px-4 pb-3"
        data-cy="time-attendance-my-schedule-filter-container"
      >
        <ScheduleTableFilter value={weekFilter} onChange={setWeekFilter} />
      </div>

      <div className="px-4 pb-4" data-cy="time-attendance-my-schedule-body">
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3"
          data-cy="time-attendance-my-schedule-days"
        >
          {weekDays.map(({ date, day, dayShifts }) => {
            const isToday = day.isSame(dayjs(), 'day');
            const pendingCount = dayShifts.reduce((count, shift) => {
              return (
                count +
                (incomingByTargetShiftId.get(shift.id)?.length || 0) +
                (outgoingByRequesterShiftId.get(shift.id)?.length || 0)
              );
            }, 0);

            return (
              <Card
                key={date}
                className="rounded-lg border border-gray-200 shadow-sm h-full"
                bodyStyle={{
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  height: '100%',
                }}
                data-cy={`time-attendance-my-schedule-day-${date}`}
              >
                <div
                  className="flex items-start justify-between gap-2"
                  data-cy={`time-attendance-my-schedule-day-header-${date}`}
                >
                  <div className="min-w-0">
                    <p
                      className="mb-0 text-sm font-semibold text-gray-900 truncate"
                      data-cy={`time-attendance-my-schedule-day-label-${date}`}
                    >
                      {day.format('ddd')}
                    </p>
                    <p className="mb-0 text-xs text-gray-500">
                      {day.format('MMM D')}
                      {isToday ? ' · Today' : ''}
                    </p>
                  </div>
                  {pendingCount > 0 ? (
                    <Tag
                      color="processing"
                      className="!m-0 !text-[10px] !leading-5 !px-1.5 shrink-0"
                    >
                      {pendingCount}
                    </Tag>
                  ) : (
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {dayShifts.length}
                    </span>
                  )}
                </div>

                <div
                  className="flex flex-col gap-2"
                  data-cy={`time-attendance-my-schedule-day-shifts-${date}`}
                >
                  {dayShifts.length === 0 ? (
                    <p
                      className="mb-0 text-[11px] text-gray-400"
                      data-cy={`time-attendance-my-schedule-day-empty-${date}`}
                    >
                      No shifts
                    </p>
                  ) : (
                    dayShifts.map((shift) => {
                      const incoming =
                        incomingByTargetShiftId.get(shift.id) || [];
                      const outgoing =
                        outgoingByRequesterShiftId.get(shift.id) || [];

                      return (
                        <div
                          key={shift.id}
                          className="rounded-lg border border-gray-200 bg-[#FAFAFA] px-2.5 py-2"
                          data-cy={`time-attendance-my-schedule-shift-${shift.id}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="mb-0 text-xs font-semibold text-gray-900 leading-snug">
                                {formatTimeRange(
                                  shift.startTime,
                                  shift.endTime,
                                )}
                              </p>
                              <p className="mb-0 mt-0.5 text-[11px] text-gray-500 truncate">
                                {shift.shiftName || shift.blueprintTitle}
                              </p>
                            </div>
                            {shift.isSwappable ? (
                              <Tooltip title="Request swap">
                                <button
                                  type="button"
                                  onClick={() => openSwapModal(shift.id)}
                                  className="shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-full border border-gray-200 bg-white text-primary hover:border-primary transition-colors"
                                  aria-label="Request swap"
                                  data-cy={`time-attendance-my-schedule-shift-swap-${shift.id}`}
                                >
                                  <SwapHorizIcon sx={{ fontSize: 16 }} />
                                </button>
                              </Tooltip>
                            ) : (
                              <Tag className="!m-0 !text-[10px] !leading-5 !px-1.5 shrink-0">
                                Fixed
                              </Tag>
                            )}
                          </div>

                          {outgoing.map((swap) => (
                            <p
                              key={swap.id}
                              className="mt-1.5 mb-0 text-[10px] text-gray-500 leading-snug"
                              data-cy={`time-attendance-my-schedule-shift-outgoing-${swap.id}`}
                            >
                              <Tag
                                color="processing"
                                className="!m-0 !mr-1 !text-[9px] !leading-4 !px-1"
                              >
                                {SWAP_STATUS_LABEL[swap.status]}
                              </Tag>
                              {getEmployeeDisplayName(swap.target)}
                            </p>
                          ))}

                          {incoming.map((swap) => (
                            <div
                              key={swap.id}
                              className="mt-1.5 pt-1.5 border-t border-gray-200"
                              data-cy={`time-attendance-my-schedule-shift-incoming-${swap.id}`}
                            >
                              <p className="mb-1.5 text-[10px] text-[#4d4d4d] leading-snug">
                                {getEmployeeDisplayName(swap.requester)} ·{' '}
                                {dayjs(swap.requesterShift.date).format(
                                  'MMM D',
                                )}
                              </p>
                              <div className="flex gap-1">
                                <Button
                                  type="primary"
                                  size="small"
                                  className="!h-6 !text-[10px] !px-2"
                                  loading={isResponding}
                                  onClick={() =>
                                    respondToSwap({
                                      id: swap.id,
                                      accept: true,
                                      actorUserId: demoPersonaId,
                                    })
                                  }
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="small"
                                  className="!h-6 !text-[10px] !px-2"
                                  loading={isResponding}
                                  onClick={() =>
                                    respondToSwap({
                                      id: swap.id,
                                      accept: false,
                                      actorUserId: demoPersonaId,
                                    })
                                  }
                                >
                                  Reject
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-4" data-cy="time-attendance-my-schedule-swaps-wrap">
          <SwapRequestsSection personaId={demoPersonaId} swaps={swaps} />
        </div>
      </div>

      <RequestSwapModal />
    </div>
  );
};

export default MySchedulePage;
