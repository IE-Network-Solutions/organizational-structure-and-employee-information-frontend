import { useMemo } from 'react';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { isDeadlinePlanningMockEnabled } from '@/utils/deadlinePlanningMocks';
import { usePlanningToolbarFilters } from './usePlanningToolbarFilters';
import {
  buildAllEmployeesPickerRoster,
  buildSubordinatePickerRoster,
  type AssigneeChip,
} from './assigneeChipRoster';

export function useAssigneePickerScope() {
  const mockEnabled = isDeadlinePlanningMockEnabled();
  const { userId } = useAuthenticationStore();
  const { planningFilterDepartment } = PlanningAndReportingStore();
  const { employeeData } = usePlanningToolbarFilters();

  const canPickAllEmployees = AccessGuard.checkAccess({
    permissions: [Permissions.ViewAllEmployeePlan],
  });

  const subordinates = useMemo(
    () =>
      buildSubordinatePickerRoster(
        mockEnabled ? undefined : employeeData,
        userId,
        planningFilterDepartment,
        mockEnabled,
      ),
    [mockEnabled, employeeData, userId, planningFilterDepartment],
  );

  const allEmployees = useMemo(() => {
    if (!canPickAllEmployees) return [] as AssigneeChip[];
    return buildAllEmployeesPickerRoster(
      mockEnabled ? undefined : employeeData,
      userId,
      planningFilterDepartment,
      mockEnabled,
    );
  }, [
    canPickAllEmployees,
    mockEnabled,
    employeeData,
    userId,
    planningFilterDepartment,
  ]);

  const pickerUniverseIds = useMemo(() => {
    const ids = new Set<string>();
    if (userId) ids.add(String(userId));
    const source = canPickAllEmployees ? allEmployees : subordinates;
    for (const chip of source) ids.add(chip.userId);
    return ids;
  }, [userId, canPickAllEmployees, allEmployees, subordinates]);

  return {
    subordinates,
    allEmployees,
    canPickAllEmployees,
    hasSubordinates: subordinates.length > 0,
    pickerUniverseIds,
  };
}
