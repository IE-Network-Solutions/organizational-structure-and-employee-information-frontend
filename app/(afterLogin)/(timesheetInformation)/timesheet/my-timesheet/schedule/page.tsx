'use client';

import { useMemo } from 'react';
import { Button, Select, Tag } from 'antd';
import dayjs from 'dayjs';
import RequestSwapModal from '@/app/(afterLogin)/(timesheetInformation)/timesheet/settings/workSchedule/_components/requestSwapModal';
import { useWorkScheduleUiStore } from '@/store/uistate/features/timesheet/workSchedule';
import {
  useGetMockEmployees,
  useGetShiftInstances,
  useGetSwapRequests,
} from '@/store/server/features/timesheet/workSchedule/queries';
import {
  DATE_FORMAT,
  formatTimeRange,
  shiftLabel,
} from '@/store/server/features/timesheet/workSchedule/helpers';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/mockService';
import { usePeerRespondToSwap } from '@/store/server/features/timesheet/workSchedule/mutation';
import {
  SHIFT_TYPE_LABEL,
  ShiftInstanceView,
  SWAP_STATUS_LABEL,
  SwapRequestView,
} from '@/types/timesheet/workSchedule';

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

  const from = dayjs().format(DATE_FORMAT);
  const to = dayjs().add(6, 'week').format(DATE_FORMAT);

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

  const myUpcomingShifts = useMemo(
    () =>
      myInstances
        .filter(
          (item) =>
            !item.isCancelled && !dayjs(item.date).isBefore(dayjs(), 'day'),
        )
        .sort((a, b) => {
          const byDate = a.date.localeCompare(b.date);
          if (byDate !== 0) return byDate;
          return a.startTime.localeCompare(b.startTime);
        }),
    [myInstances],
  );

  const shiftsByDay = useMemo(() => {
    const map = new Map<string, ShiftInstanceView[]>();
    for (const shift of myUpcomingShifts) {
      const list = map.get(shift.date) || [];
      list.push(shift);
      map.set(shift.date, list);
    }
    return Array.from(map.entries());
  }, [myUpcomingShifts]);

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
      className="border border-[#D9D9D9] rounded-lg p-4 bg-white"
      data-cy="time-attendance-my-schedule-page"
      id="time-attendance-my-schedule-page"
    >
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4"
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
            Daily shifts for{' '}
            {persona ? getEmployeeDisplayName(persona) : 'demo persona'}.
          </p>
        </div>
        <Select
          className="w-full sm:w-64"
          value={demoPersonaId}
          onChange={setDemoPersonaId}
          options={employees.map((item) => ({
            value: item.id,
            label: `${getEmployeeDisplayName(item)} · ${item.jobTitle}`,
          }))}
          data-cy="time-attendance-my-schedule-persona"
        />
      </div>

      {shiftsByDay.length === 0 ? (
        <p
          className="text-sm text-gray-500 mb-0"
          data-cy="time-attendance-my-schedule-empty"
        >
          No upcoming shifts assigned.
        </p>
      ) : (
        <div
          className="flex flex-col gap-6"
          data-cy="time-attendance-my-schedule-days"
        >
          {shiftsByDay.map(([date, dayShifts]) => (
            <div
              key={date}
              data-cy={`time-attendance-my-schedule-day-${date}`}
            >
              <p
                className="mb-3 text-sm font-semibold text-[#4d4d4d]"
                data-cy={`time-attendance-my-schedule-day-label-${date}`}
              >
                {dayjs(date).format('dddd, MMM D')}
              </p>
              <div
                className="flex flex-col gap-3"
                data-cy={`time-attendance-my-schedule-day-shifts-${date}`}
              >
                {dayShifts.map((shift) => {
                  const incoming = incomingByTargetShiftId.get(shift.id) || [];
                  const outgoing =
                    outgoingByRequesterShiftId.get(shift.id) || [];

                  return (
                    <div
                      key={shift.id}
                      className="rounded-lg border border-gray-200 p-3"
                      data-cy={`time-attendance-my-schedule-shift-${shift.id}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <p className="mb-1 text-sm font-semibold text-[#4d4d4d]">
                            {formatTimeRange(shift.startTime, shift.endTime)}
                            {shift.shiftName
                              ? ` · ${shift.shiftName}`
                              : ` · ${SHIFT_TYPE_LABEL[shift.shiftType]}`}
                          </p>
                          <p className="mb-2 text-xs text-gray-500">
                            {shift.blueprintTitle} · {shiftLabel(shift)}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <Tag
                              color={
                                shift.isSwappable ? 'success' : 'default'
                              }
                            >
                              {shift.isSwappable ? 'Swappable' : 'Fixed'}
                            </Tag>
                            {outgoing.map((swap) => (
                              <Tag key={swap.id} color="processing">
                                {SWAP_STATUS_LABEL[swap.status]}
                              </Tag>
                            ))}
                          </div>
                        </div>

                        {shift.isSwappable && (
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => openSwapModal(shift.id)}
                            data-cy={`time-attendance-my-schedule-shift-swap-${shift.id}`}
                          >
                            Request Swap
                          </Button>
                        )}
                      </div>

                      {outgoing.map((swap) => (
                        <p
                          key={swap.id}
                          className="mt-3 mb-0 text-xs text-gray-500"
                          data-cy={`time-attendance-my-schedule-shift-outgoing-${swap.id}`}
                        >
                          Swap pending with{' '}
                          {getEmployeeDisplayName(swap.target)} for{' '}
                          {swap.targetShift.date} (
                          {formatTimeRange(
                            swap.targetShift.startTime,
                            swap.targetShift.endTime,
                          )}
                          )
                        </p>
                      ))}

                      {incoming.map((swap) => (
                        <div
                          key={swap.id}
                          className="mt-3 pt-3 border-t border-gray-100"
                          data-cy={`time-attendance-my-schedule-shift-incoming-${swap.id}`}
                        >
                          <p className="mb-2 text-xs text-[#4d4d4d]">
                            {getEmployeeDisplayName(swap.requester)} wants to
                            swap their {swap.requesterShift.date} (
                            {formatTimeRange(
                              swap.requesterShift.startTime,
                              swap.requesterShift.endTime,
                            )}
                            ) for this shift
                            {swap.reason ? ` — “${swap.reason}”` : ''}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              type="primary"
                              size="small"
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
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <RequestSwapModal />
    </div>
  );
};

export default MySchedulePage;
