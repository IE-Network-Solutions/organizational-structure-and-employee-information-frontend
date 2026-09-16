import {
  collectMockTasksForStatusFilter,
  mockTaskMatchesPlanningStatusFilter,
} from './planningTaskStatusFilter';
import type { MockPlanTask } from '@/store/uistate/features/planningAndReporting/userPlanRepositoryMock';

const active: MockPlanTask = {
  id: 'a1',
  title: 'Active',
  start: '2026-09-15',
  deadline: '2026-09-15',
  spanDays: 1,
  kind: 'daily',
  parentId: null,
  done: false,
};

const reported: MockPlanTask = {
  ...active,
  id: 'r1',
  title: 'Reported',
  done: true,
};

const managerClosed: MockPlanTask = {
  ...reported,
  id: 'mc1',
  title: 'Manager closed',
  isReported: true,
  isLocked: true,
};

const lockedOnly: MockPlanTask = {
  ...active,
  id: 'l1',
  title: 'Locked',
  isLocked: true,
};

describe('planningTaskStatusFilter', () => {
  it('all filter includes every task status', () => {
    expect(mockTaskMatchesPlanningStatusFilter(active, 'all')).toBe(true);
    expect(mockTaskMatchesPlanningStatusFilter(reported, 'all')).toBe(true);
    expect(mockTaskMatchesPlanningStatusFilter(managerClosed, 'all')).toBe(
      true,
    );
  });

  it('active filter includes in-progress and open reported tasks', () => {
    expect(mockTaskMatchesPlanningStatusFilter(active, 'active')).toBe(true);
    expect(mockTaskMatchesPlanningStatusFilter(reported, 'active')).toBe(true);
    expect(mockTaskMatchesPlanningStatusFilter(managerClosed, 'active')).toBe(
      false,
    );
    expect(mockTaskMatchesPlanningStatusFilter(lockedOnly, 'active')).toBe(
      true,
    );
  });

  it('reported filter includes only manager-closed reported tasks', () => {
    expect(mockTaskMatchesPlanningStatusFilter(active, 'reported')).toBe(false);
    expect(mockTaskMatchesPlanningStatusFilter(reported, 'reported')).toBe(
      false,
    );
    expect(mockTaskMatchesPlanningStatusFilter(managerClosed, 'reported')).toBe(
      true,
    );
    expect(mockTaskMatchesPlanningStatusFilter(lockedOnly, 'reported')).toBe(
      false,
    );
  });

  it('collects from active and archived pools', () => {
    const plan = {
      activeTasks: [active, reported],
      archivedTasks: [managerClosed],
    };
    expect(collectMockTasksForStatusFilter(plan, 'all')).toHaveLength(3);
    expect(collectMockTasksForStatusFilter(plan, 'active')).toHaveLength(2);
    expect(collectMockTasksForStatusFilter(plan, 'reported')).toHaveLength(1);
  });
});
