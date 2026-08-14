'use client';

import { useMemo, useState } from 'react';
import { Select } from 'antd';
import dayjs from 'dayjs';
import CurrentScheduleSection from './_components/currentScheduleSection';
import AvailableShiftsSection from './_components/availableShiftsSection';
import IncomingSwapsInbox from './_components/incomingSwapsInbox';
import RequestSwapModal from '@/app/(afterLogin)/(timesheetInformation)/timesheet/settings/workSchedule/_components/requestSwapModal';
import { useWorkScheduleUiStore } from '@/store/uistate/features/timesheet/workSchedule';
import {
  useGetMockEmployees,
  useGetShiftInstances,
  useGetSwapRequests,
  useGetUserShiftAssignments,
} from '@/store/server/features/timesheet/workSchedule/queries';
import { DATE_FORMAT } from '@/store/server/features/timesheet/workSchedule/helpers';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/mockService';
import {
  ShiftInstanceView,
  SwapRequestView,
} from '@/types/timesheet/workSchedule';

const EMPTY_EMPLOYEES: NonNullable<
  ReturnType<typeof useGetMockEmployees>['data']
> = [];
const EMPTY_INSTANCES: ShiftInstanceView[] = [];
const EMPTY_SWAPS: SwapRequestView[] = [];
const EMPTY_ASSIGNMENTS: NonNullable<
  ReturnType<typeof useGetUserShiftAssignments>['data']
> = [];

const PENDING_OUTGOING_STATUSES = new Set(['PENDING_PEER', 'PENDING_ADMIN']);

const MySchedulePage = () => {
  const { demoPersonaId, setDemoPersonaId, openSwapModal } =
    useWorkScheduleUiStore();
  const [selectedMyShiftId, setSelectedMyShiftId] = useState<
    string | undefined
  >();

  const from = dayjs().format(DATE_FORMAT);
  const to = dayjs().add(6, 'week').format(DATE_FORMAT);

  const { data: employeesData } = useGetMockEmployees();
  const employees = employeesData ?? EMPTY_EMPLOYEES;
  const { data: assignmentsData } = useGetUserShiftAssignments(demoPersonaId);
  const assignments = assignmentsData ?? EMPTY_ASSIGNMENTS;
  const { data: myInstancesData } = useGetShiftInstances({
    from,
    to,
    userId: demoPersonaId,
  });
  const myInstances = myInstancesData ?? EMPTY_INSTANCES;
  const { data: allInstancesData } = useGetShiftInstances({ from, to });
  const allInstances = allInstancesData ?? EMPTY_INSTANCES;
  const { data: swapsData } = useGetSwapRequests({ userId: demoPersonaId });
  const swaps = swapsData ?? EMPTY_SWAPS;

  const availableShifts = useMemo(
    () =>
      allInstances
        .filter(
          (item) =>
            item.assignedUserId !== demoPersonaId &&
            item.isSwappable &&
            !item.isCancelled &&
            !dayjs(item.date).isBefore(dayjs(), 'day'),
        )
        .sort((a, b) => a.date.localeCompare(b.date)),
    [allInstances, demoPersonaId],
  );

  const myUpcomingShifts = useMemo(
    () =>
      myInstances
        .filter(
          (item) =>
            !item.isCancelled && !dayjs(item.date).isBefore(dayjs(), 'day'),
        )
        .sort((a, b) => a.date.localeCompare(b.date)),
    [myInstances],
  );

  const incoming = swaps.filter(
    (item) =>
      item.targetUserId === demoPersonaId && item.status === 'PENDING_PEER',
  );
  const outgoing = swaps.filter(
    (item) =>
      item.requesterId === demoPersonaId &&
      PENDING_OUTGOING_STATUSES.has(item.status),
  );

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
            Current schedule, available shifts, and swap approvals for{' '}
            {persona ? getEmployeeDisplayName(persona) : 'demo persona'}.
          </p>
        </div>
        <Select
          className="w-full sm:w-64"
          value={demoPersonaId}
          onChange={(value) => {
            setDemoPersonaId(value);
            setSelectedMyShiftId(undefined);
          }}
          options={employees.map((item) => ({
            value: item.id,
            label: `${getEmployeeDisplayName(item)} · ${item.jobTitle}`,
          }))}
          data-cy="time-attendance-my-schedule-persona"
        />
      </div>

      <div className="flex flex-col gap-4" data-cy="time-attendance-my-schedule-body">
        <CurrentScheduleSection assignments={assignments} />

        <AvailableShiftsSection
          myShifts={myUpcomingShifts}
          availableShifts={availableShifts}
          selectedMyShiftId={selectedMyShiftId}
          onSelectMyShift={setSelectedMyShiftId}
          onRequestSwap={(myShiftId) => openSwapModal(myShiftId)}
          onSwapForAvailable={(myShiftId, targetShiftId) =>
            openSwapModal(myShiftId, targetShiftId)
          }
        />

        <IncomingSwapsInbox
          personaId={demoPersonaId}
          incoming={incoming}
          outgoing={outgoing}
        />
      </div>

      <RequestSwapModal />
    </div>
  );
};

export default MySchedulePage;
