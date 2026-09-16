import type { DeadlineKind } from '@/app/(afterLogin)/dashboard/_components/plan/deadline/types';
import {
  childCapForParent,
  childKindForParent,
  countChildren,
  resolveHierarchyParentKind,
} from '../prototype/mockPlanningConstants';
import type { MockPlanTask } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';

export function childrenOf(
  tasks: MockPlanTask[],
  parentId: string,
): MockPlanTask[] {
  return tasks.filter((t) => t.parentId === parentId);
}

export function kindLabel(kind: DeadlineKind): string {
  if (kind === 'month') return 'weekly';
  if (kind === 'week') return 'daily';
  return 'sub';
}

export function parentCapacitySummary(
  task: MockPlanTask,
  allTasks: MockPlanTask[],
): string | null {
  const cap = childCapForParent(task.kind, task.start, task.deadline);
  if (cap <= 0) return null;
  const direct = countChildren(allTasks, task.id);
  const childKind = childKindForParent(task.kind);
  if (task.kind === 'month') {
    const weeklyChildren = childrenOf(allTasks, task.id);
    let dailyLeft = 0;
    for (const week of weeklyChildren) {
      const wCap = childCapForParent(week.kind, week.start, week.deadline);
      dailyLeft += Math.max(0, wCap - countChildren(allTasks, week.id));
    }
    return `${direct}/${cap} weekly · ${dailyLeft} daily left`;
  }
  if (childKind) {
    return `${direct}/${cap} ${kindLabel(task.kind)}`;
  }
  return null;
}

export type MockPlanHierarchyRowMeta = {
  flatMode: boolean;
  hierarchyKind: DeadlineKind;
  expectedChildKind: DeadlineKind | null;
  childCount: number;
  canHaveChildren: boolean;
  capacityLabel: string | null;
  parentTask: MockPlanTask | null;
};

export function computeMockPlanHierarchyRowMeta(
  task: MockPlanTask,
  allActiveTasks: MockPlanTask[],
  durationKind: DeadlineKind,
): MockPlanHierarchyRowMeta {
  const flatMode = durationKind === 'daily';
  const hierarchyKind = resolveHierarchyParentKind(task);
  const expectedChildKind = childKindForParent(hierarchyKind);
  const kidsAll = childrenOf(allActiveTasks, task.id).filter((c) =>
    expectedChildKind ? c.kind === expectedChildKind : false,
  );
  const cap = childCapForParent(hierarchyKind, task.start, task.deadline);
  const canAddAtThisLevel =
    !flatMode &&
    ((durationKind === 'week' && hierarchyKind === 'week') ||
      (durationKind === 'month' && hierarchyKind === 'month'));
  const canHaveChildren = canAddAtThisLevel && cap > 0 && !!expectedChildKind;
  const capacityLabel = canAddAtThisLevel
    ? parentCapacitySummary({ ...task, kind: hierarchyKind }, allActiveTasks)
    : null;
  const parentTask = task.parentId
    ? (allActiveTasks.find((p) => p.id === task.parentId) ?? null)
    : null;

  return {
    flatMode,
    hierarchyKind,
    expectedChildKind,
    childCount: kidsAll.length,
    canHaveChildren,
    capacityLabel,
    parentTask,
  };
}

export function canOpenSubtasksModal(meta: MockPlanHierarchyRowMeta): boolean {
  return meta.canHaveChildren || meta.childCount > 0;
}
