import { useCallback, useEffect, useMemo } from 'react';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useUserPlanRepositoryMock } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';
import { isDeadlinePlanningMockEnabled } from '@/utils/deadlinePlanningMocks';
import {
  mockDisplayNameForUserId,
  mockTeamMemberIds,
} from '../prototype/mockPlanningConstants';
import type { PlanSummary } from '../types';
import { usePlanningToolbarFilters } from './usePlanningToolbarFilters';
import {
  formatEmployeeDisplayName,
  resolvePlanningPersonLabel,
} from './assigneeChipRoster';
import {
  collectTeamAssignedTasksFromMockPlans,
  collectTeamAssignedTasksFromSummaries,
  sortTeamTasks,
  type TeamTaskRow,
} from './delegatedTaskUtils';
import { normalizePlanningTaskStatusFilter } from './planningTaskStatusFilter';

export function useTeamAssignedTasks(planSummaries: PlanSummary[] = []) {
  const { userId } = useAuthenticationStore();
  const mockEnabled = isDeadlinePlanningMockEnabled();
  const { employeeData, planningTaskStatusFilter } =
    usePlanningToolbarFilters();
  const mockPlansByUserId = useUserPlanRepositoryMock((s) => s.plansByUserId);
  const ensurePlan = useUserPlanRepositoryMock((s) => s.ensurePlan);

  const viewerUserId = String(userId ?? '');

  const resolveUserName = useCallback(
    (personId: string) => {
      const fallback = mockEnabled
        ? mockDisplayNameForUserId(personId, viewerUserId)
        : (() => {
            const employee = employeeData?.items?.find(
              (item: any) => String(item?.id) === String(personId),
            );
            return employee ? formatEmployeeDisplayName(employee) : 'Teammate';
          })();
      return resolvePlanningPersonLabel(personId, viewerUserId, fallback);
    },
    [mockEnabled, employeeData?.items, viewerUserId],
  );

  useEffect(() => {
    if (!mockEnabled || !viewerUserId) return;
    const ids = Array.from(new Set([viewerUserId, ...mockTeamMemberIds()]));
    for (const uid of ids) {
      ensurePlan(
        uid,
        mockDisplayNameForUserId(uid, viewerUserId),
        viewerUserId,
      );
    }
  }, [mockEnabled, viewerUserId, ensurePlan]);

  const tasks = useMemo((): TeamTaskRow[] => {
    if (!viewerUserId) return [];

    const statusFilter = normalizePlanningTaskStatusFilter(
      planningTaskStatusFilter,
    );
    let rows: TeamTaskRow[] = [];

    if (mockEnabled) {
      rows = collectTeamAssignedTasksFromMockPlans(
        mockPlansByUserId,
        viewerUserId,
        resolveUserName,
        { statusFilter },
      );
    } else if (planSummaries.length > 0) {
      rows = collectTeamAssignedTasksFromSummaries(
        planSummaries,
        viewerUserId,
        resolveUserName,
        { statusFilter },
      );
    }

    return sortTeamTasks(rows);
  }, [
    viewerUserId,
    mockEnabled,
    mockPlansByUserId,
    planSummaries,
    resolveUserName,
    planningTaskStatusFilter,
  ]);

  return {
    tasks,
    count: tasks.length,
    hasTeamAssignments: tasks.length > 0,
  };
}

/** @deprecated Use useTeamAssignedTasks */
export const useDelegatedByMeTasks = useTeamAssignedTasks;
