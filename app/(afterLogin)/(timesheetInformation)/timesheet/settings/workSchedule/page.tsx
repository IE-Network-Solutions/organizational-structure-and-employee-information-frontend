'use client';

import BlueprintList from './_components/blueprintList';
import BlueprintFormModal from './_components/blueprintFormModal';
import DeleteBlueprintModal from './_components/deleteBlueprintModal';

const WorkSchedulePage = () => {
  return (
    <div
      data-cy="time-attendance-settings-work-schedule-container"
      id="time-attendance-settings-work-schedule-container"
    >
      <BlueprintList />
      <BlueprintFormModal />
      <DeleteBlueprintModal />
    </div>
  );
};

export default WorkSchedulePage;
