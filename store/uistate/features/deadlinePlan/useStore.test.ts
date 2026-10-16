import { beforeEach, describe, expect, it } from '@jest/globals';
import { useDeadlinePlanStore } from './useStore';

beforeEach(() => useDeadlinePlanStore.getState().closeTaskForm());

describe('grouped task creation context', () => {
  it('keeps the selected plan assignee available to the task form', () => {
    useDeadlinePlanStore
      .getState()
      .openTaskForm({ assigneeId: 'direct-report' });
    const state = useDeadlinePlanStore.getState();
    expect(state.isTaskFormOpen).toBe(true);
    expect(state.taskFormAssigneeId).toBe('direct-report');
    expect(state.taskFormKeyResult).toBeNull();
    expect(state.editingTask).toBeNull();
  });

  it('does not carry a previous subordinate into task creation from the main toolbar', () => {
    useDeadlinePlanStore
      .getState()
      .openTaskForm({ assigneeId: 'direct-report' });
    useDeadlinePlanStore.getState().closeTaskForm();
    expect(useDeadlinePlanStore.getState().taskFormAssigneeId).toBeNull();
    useDeadlinePlanStore.getState().openTaskForm();
    expect(useDeadlinePlanStore.getState().taskFormAssigneeId).toBeNull();
  });

  it('preserves key-result owner selection when opening from the key-result panel', () => {
    useDeadlinePlanStore
      .getState()
      .openTaskForm({ assigneeId: 'direct-report' });
    useDeadlinePlanStore
      .getState()
      .openTaskForm({ keyResult: { id: 'kr', ownerId: 'kr-owner' } });
    expect(useDeadlinePlanStore.getState().taskFormAssigneeId).toBeNull();
    expect(useDeadlinePlanStore.getState().taskFormKeyResult).toEqual({
      id: 'kr',
      ownerId: 'kr-owner',
    });
  });
});
