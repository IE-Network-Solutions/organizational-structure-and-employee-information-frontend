'use client';

import BlueprintList from './_components/blueprintList';
import BlueprintFormModal from './_components/blueprintFormModal';
import AssignEmployeesDrawer from './_components/assignEmployeesDrawer';
import DeleteBlueprintModal from './_components/deleteBlueprintModal';

const WorkSchedulePage = () => {
  return (
    <div
      data-cy="time-attendance-settings-work-schedule-container"
      id="time-attendance-settings-work-schedule-container"
    >
      <BlueprintList />
      <BlueprintFormModal />
      <AssignEmployeesDrawer />
      <DeleteBlueprintModal />
    </div>
  );
};

export default WorkSchedulePage;
