'use client';

import { useMemo, useState } from 'react';
import { Calendar, CalendarProps, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import IncomingSwapsInbox from './_components/incomingSwapsInbox';
import EmployeeShiftDrawer from './_components/employeeShiftDrawer';
import ShiftCard from '@/app/(afterLogin)/(timesheetInformation)/timesheet/settings/workSchedule/_components/shiftCard';
import RequestSwapModal from '@/app/(afterLogin)/(timesheetInformation)/timesheet/settings/workSchedule/_components/requestSwapModal';
import { useWorkScheduleUiStore } from '@/store/uistate/features/timesheet/workSchedule';
import {
  useGetBaselineBands,
  useGetMockEmployees,
  useGetShiftInstances,
  useGetSwapRequests,
} from '@/store/server/features/timesheet/workSchedule/queries';
import {
  DATE_FORMAT,
  formatTimeRange,
} from '@/store/server/features/timesheet/workSchedule/helpers';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/mockService';
import { ShiftInstanceView } from '@/types/timesheet/workSchedule';

const MySchedulePage = () => {
  const { demoPersonaId, setDemoPersonaId, openSwapModal } =
    useWorkScheduleUiStore();
  const [month, setMonth] = useState(dayjs().startOf('month'));
  const [selectedInstance, setSelectedInstance] =
    useState<ShiftInstanceView | null>(null);

  const from = month.startOf('month').format(DATE_FORMAT);
  const to = month.endOf('month').format(DATE_FORMAT);
  const filters = { from, to, userId: demoPersonaId };

  const { data: employees = [] } = useGetMockEmployees();
  const { data: instances = [] } = useGetShiftInstances(filters);
  const { data: baselineBands = [] } = useGetBaselineBands(filters);
  const { data: swaps = [] } = useGetSwapRequests({ userId: demoPersonaId });

  const incoming = swaps.filter(
    (item) =>
      item.targetUserId === demoPersonaId && item.status === 'PENDING_PEER',
  );
  const outgoing = swaps.filter((item) => item.requesterId === demoPersonaId);

  const instancesByDate = useMemo(() => {
    const map = new Map<string, ShiftInstanceView[]>();
    for (const instance of instances) {
      const list = map.get(instance.date) || [];
      list.push(instance);
      map.set(instance.date, list);
    }
    return map;
  }, [instances]);

  const bandsByDate = useMemo(() => {
    const map = new Map<string, typeof baselineBands>();
    for (const band of baselineBands) {
      const list = map.get(band.date) || [];
      list.push(band);
      map.set(band.date, list);
    }
    return map;
  }, [baselineBands]);

  const persona = employees.find((item) => item.id === demoPersonaId);

  const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
    if (info.type !== 'date') return null;
    const key = current.format(DATE_FORMAT);
    const dayInstances = instancesByDate.get(key) || [];
    const dayBands = bandsByDate.get(key) || [];
    if (!dayInstances.length && !dayBands.length) return null;

    return (
      <div
        className="flex flex-col gap-1 max-h-28 overflow-auto"
        data-cy={`time-attendance-my-schedule-cell-${key}`}
      >
        {dayInstances.map((instance) => (
          <ShiftCard
            key={instance.id}
            instance={instance}
            compact
            onClick={() => setSelectedInstance(instance)}
          />
        ))}
        {dayBands.map((band) => (
          <div
            key={`${band.blueprint.id}-${band.date}`}
            className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-1.5"
            data-cy={`time-attendance-my-schedule-baseline-${band.blueprint.id}-${band.date}`}
          >
            <div
              className="text-[10px] font-semibold text-[#4d4d4d]"
              data-cy={`time-attendance-my-schedule-baseline-time-${band.date}`}
            >
              {formatTimeRange(band.startTime, band.endTime)}
            </div>
            <div
              className="text-[10px] text-gray-500 truncate"
              data-cy={`time-attendance-my-schedule-baseline-title-${band.date}`}
            >
              {band.blueprint.title}
            </div>
            <div
              className="text-[10px] text-gray-400"
              data-cy={`time-attendance-my-schedule-baseline-label-${band.date}`}
            >
              Baseline · Fixed
            </div>
          </div>
        ))}
      </div>
    );
  };

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
            Mock personal calendar for{' '}
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

      <IncomingSwapsInbox
        personaId={demoPersonaId}
        incoming={incoming}
        outgoing={outgoing}
      />

      <Calendar
        value={month}
        onPanelChange={(value) => setMonth(value.startOf('month'))}
        onChange={(value) => setMonth(value.startOf('month'))}
        cellRender={cellRender}
      />

      <EmployeeShiftDrawer
        open={Boolean(selectedInstance)}
        instance={selectedInstance}
        onClose={() => setSelectedInstance(null)}
        onRequestSwap={(instanceId) => {
          setSelectedInstance(null);
          openSwapModal(instanceId);
        }}
      />
      <RequestSwapModal />
    </div>
  );
};

export default MySchedulePage;
