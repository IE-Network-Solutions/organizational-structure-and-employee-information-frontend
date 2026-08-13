'use client';

import { Segmented } from 'antd';
import { WorkScheduleInnerView } from '@/types/timesheet/workSchedule';
import { useWorkScheduleUiStore } from '@/store/uistate/features/timesheet/workSchedule';
import BlueprintList from './_components/blueprintList';
import BlueprintFormModal from './_components/blueprintFormModal';
import AssignEmployeesDrawer from './_components/assignEmployeesDrawer';
import DeleteBlueprintModal from './_components/deleteBlueprintModal';
import RosterCalendar from './_components/rosterCalendar';
import ShiftInstanceDrawer from './_components/shiftInstanceDrawer';
import SwapApprovalQueue from './_components/swapApprovalQueue';
import RequestSwapModal from './_components/requestSwapModal';

const INNER_VIEW_OPTIONS = [
  { label: 'Schedules', value: 'blueprints' },
  { label: 'Roster', value: 'roster' },
  { label: 'Swap Approvals', value: 'swaps' },
];

const WorkSchedulePage = () => {
  const { innerView, setInnerView } = useWorkScheduleUiStore();

  return (
    <div
      data-cy="time-attendance-settings-work-schedule-container"
      id="time-attendance-settings-work-schedule-container"
    >
      <div
        className="mb-4"
        data-cy="time-attendance-settings-work-schedule-inner-tabs-wrap"
      >
        <Segmented
          block
          value={innerView}
          options={INNER_VIEW_OPTIONS}
          onChange={(value) => setInnerView(value as WorkScheduleInnerView)}
          data-cy="time-attendance-settings-work-schedule-inner-tabs"
        />
      </div>

      {innerView === 'blueprints' && <BlueprintList />}
      {innerView === 'roster' && <RosterCalendar />}
      {innerView === 'swaps' && <SwapApprovalQueue />}

      <BlueprintFormModal />
      <AssignEmployeesDrawer />
      <DeleteBlueprintModal />
      <ShiftInstanceDrawer />
      <RequestSwapModal />
    </div>
  );
};

export default WorkSchedulePage;
