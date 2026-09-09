import { useMemo } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { isDeadlinePlanningMockEnabled } from '@/utils/deadlinePlanningMocks';
import { usePlanningToolbarFilters } from './usePlanningToolbarFilters';
import {
  buildAssigneeRoster,
  buildMockAssigneeRoster,
  concreteSelectedUserIds,
  defaultSelectedUserIds,
} from './assigneeChipRoster';
import { useAssigneePickerScope } from './useAssigneePickerScope';

export function useAssigneeChipRoster() {
  const mockEnabled = isDeadlinePlanningMockEnabled();
  const { userId } = useAuthenticationStore();
  const { planningFilterDepartment, selectedUser } = PlanningAndReportingStore();
  const { employeeData } = usePlanningToolbarFilters();
  const { pickerUniverseIds } = useAssigneePickerScope();

  const roster = useMemo(() => {
    if (mockEnabled) {
      return buildMockAssigneeRoster(userId, planningFilterDepartment);
    }
    return buildAssigneeRoster(
      employeeData,
      userId,
      planningFilterDepartment,
    );
  }, [mockEnabled, userId, planningFilterDepartment, employeeData]);

  const rosterIds = useMemo(() => roster.map((c) => c.userId), [roster]);

  const selectedIds = useMemo(() => {
    const concrete = concreteSelectedUserIds(selectedUser);
    const filtered = concrete.filter((id) =>
      pickerUniverseIds.has(String(id)),
    );
    if (filtered.length === 0) return defaultSelectedUserIds(roster);
    return [...filtered].sort((a, b) => {
      if (userId && String(a) === String(userId)) return -1;
      if (userId && String(b) === String(userId)) return 1;
      const ai = rosterIds.indexOf(a);
      const bi = rosterIds.indexOf(b);
      if (ai === -1 && bi === -1) return String(a).localeCompare(String(b));
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [selectedUser, roster, rosterIds, pickerUniverseIds, userId]);

  return {
    roster,
    rosterIds,
    selectedIds,
    hasTeam: roster.some((c) => !c.isSelf),
  };
}
