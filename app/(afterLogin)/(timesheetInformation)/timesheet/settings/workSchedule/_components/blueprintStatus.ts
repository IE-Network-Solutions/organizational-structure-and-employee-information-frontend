import { WorkScheduleBlueprint } from '@/types/timesheet/workSchedule';

export const blueprintStatusLabel = (blueprint: WorkScheduleBlueprint) => {
  if (!blueprint.hasShifts) return 'Baseline';
  return blueprint.isSwappable ? 'Swappable' : 'Fixed';
};

export const blueprintStatusColor = (blueprint: WorkScheduleBlueprint) => {
  if (!blueprint.hasShifts) return 'default';
  return blueprint.isSwappable ? 'success' : 'blue';
};
