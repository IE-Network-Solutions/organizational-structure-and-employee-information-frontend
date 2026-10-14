import React from 'react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import { DeadlineTask } from '@/store/server/features/deadlinePlan/interface';
import { useTaskActions } from './useTaskActions';
import TaskCard from './TaskCard';
import TaskLockButton from './TaskLockButton';

const mockReport = jest.fn();
const mockUnreport = jest.fn();
const mockSetReportingTask = jest.fn();
const mockOpenTaskForm = jest.fn();
const mockSetApprovalRequest = jest.fn();
const mockLock = jest.fn();

jest.mock(
  '@/store/server/features/deadlinePlan/mutations',
  () => ({
    useReportDeadlineTasks: () => ({ mutate: mockReport, isLoading: false }),
    useUnreportDeadlineTasks: () => ({
      mutate: mockUnreport,
      isLoading: false,
    }),
    useLockDeadlineTasks: () => ({ mutate: mockLock, isLoading: false }),
    useApproveDeadlineTasks: () => ({ mutate: jest.fn() }),
    useDeleteDeadlineTask: () => ({ mutate: jest.fn() }),
  }),
  { virtual: true },
);

jest.mock(
  '@/store/uistate/features/deadlinePlan/useStore',
  () => ({
    useDeadlinePlanStore: (selector: any) =>
      selector({
        openTaskForm: mockOpenTaskForm,
        setReportingTask: mockSetReportingTask,
        setApprovalRequest: mockSetApprovalRequest,
      }),
  }),
  { virtual: true },
);

const viewer = { userId: 'me', subordinateIds: [], canManageAll: false };
const taskOf = (overrides: Partial<DeadlineTask> = {}): DeadlineTask => ({
  id: 'task',
  title: 'Prepare the launch',
  description: 'Launch notes',
  priority: 'high',
  startDate: '2026-10-12',
  deadline: '2026-10-13',
  assigneeId: 'me',
  assignedById: null,
  parentTaskId: null,
  keyResultId: null,
  milestoneId: null,
  targetValue: null,
  achieveKR: false,
  isLocked: false,
  lockedById: null,
  status: 'active',
  outcome: null,
  actualValue: null,
  customReason: null,
  reportedAt: null,
  approvalStatus: 'open',
  approvedById: null,
  createdAt: '2026-10-12',
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('preserved task actions', () => {
  it('opens comment review before approving a subordinate report', () => {
    const { result } = renderHook(() =>
      useTaskActions({ ...viewer, subordinateIds: ['employee'] }),
    );
    const task = taskOf({
      assigneeId: 'employee',
      status: 'reported',
      approvalStatus: 'pending',
    });
    const approval = result.current
      .menuItemsOf(task)
      ?.find((item: any) => item?.key === 'approve') as any;
    act(() => approval.onClick());
    expect(mockSetApprovalRequest).toHaveBeenCalledWith({
      taskIds: ['task'],
      title: 'Prepare the launch',
    });
  });
  it('keeps task locks outside the menu and retains report approval', () => {
    const { result } = renderHook(() =>
      useTaskActions({ ...viewer, subordinateIds: ['employee'] }),
    );
    const labels = result.current
      .menuItemsOf(taskOf({ assigneeId: 'employee' }))
      ?.map((item: any) => item?.label);
    expect(labels).not.toContain('Lock');
    expect(labels).not.toContain('Unlock');
    expect(labels).not.toContain('Close task');
    expect(labels).not.toContain('Approve reported');
    expect(
      result.current
        .menuItemsOf(taskOf({ assigneeId: 'employee', status: 'reported' }))
        ?.map((item: any) => item?.label),
    ).toContain('Approve reported');
  });

  it('exposes a visible task lock button only for the direct manager', () => {
    const { result } = renderHook(() =>
      useTaskActions({ ...viewer, subordinateIds: ['employee'] }),
    );
    const task = taskOf({ assigneeId: 'employee' });
    const { rerender } = render(
      <TaskLockButton task={task} actions={result.current} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Lock task' }));
    expect(mockLock).toHaveBeenCalledWith({
      taskIds: ['task'],
      isLocked: true,
    });
    rerender(
      <TaskLockButton
        task={{ ...task, isLocked: true }}
        actions={result.current}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Unlock task' }));
    expect(mockLock).toHaveBeenLastCalledWith({
      taskIds: ['task'],
      isLocked: false,
    });
    rerender(<TaskLockButton task={taskOf()} actions={result.current} />);
    expect(screen.queryByRole('button', { name: 'Lock task' })).toBeNull();
  });

  it('rejects lock requests for an unrelated task even through the action handler', () => {
    const { result } = renderHook(() =>
      useTaskActions({ ...viewer, canManageAll: true }),
    );
    act(() =>
      result.current.setLock(taskOf({ assigneeId: 'someone-else' }), true),
    );
    expect(mockLock).not.toHaveBeenCalled();
  });
  it('opens the reporting flow for a numeric task instead of posting a completion without its value', () => {
    const task = taskOf({
      keyResult: {
        id: 'kr',
        title: 'Revenue',
        metricType: { id: 'metric', name: 'Currency' },
      },
    });
    const onReport = jest.fn();
    const { result } = renderHook(() => useTaskActions(viewer));
    act(() => result.current.toggleDone(task, onReport));
    expect(onReport).toHaveBeenCalledTimes(1);
    expect(mockSetReportingTask).toHaveBeenCalledWith(task);
    expect(mockReport).not.toHaveBeenCalled();
  });

  it('reports a general task with the original completion payload and undoes a completed report', () => {
    const { result } = renderHook(() => useTaskActions(viewer));
    act(() => result.current.toggleDone(taskOf()));
    expect(mockReport).toHaveBeenCalledWith([
      { taskId: 'task', outcome: 'done' },
    ]);
    act(() =>
      result.current.toggleDone(
        taskOf({ status: 'reported', outcome: 'done' }),
      ),
    );
    expect(mockUnreport).toHaveBeenCalledWith(['task']);
  });

  it('reports a subtask directly even when the parent has a numeric key result', () => {
    const task = taskOf({
      parentTaskId: 'parent',
      keyResult: {
        id: 'kr',
        title: 'Revenue',
        metricType: { id: 'metric', name: 'Currency' },
      },
    });
    const { result } = renderHook(() => useTaskActions(viewer));
    act(() => result.current.toggleDone(task));
    expect(mockReport).toHaveBeenCalledWith([
      { taskId: 'task', outcome: 'done' },
    ]);
    expect(mockSetReportingTask).not.toHaveBeenCalled();
  });

  it('inherits subtask permissions from the parent and prevents an assignee from reopening a closed task', () => {
    const { result } = renderHook(() => useTaskActions(viewer));
    expect(
      result.current.canToggle(
        taskOf({ assigneeId: 'someone-else', parentTaskId: 'parent' }),
        taskOf(),
      ),
    ).toBe(true);
    expect(
      result.current.canToggle(
        taskOf({ parentTaskId: 'parent' }),
        taskOf({ approvalStatus: 'closed' }),
      ),
    ).toBe(false);
    expect(
      result.current.canToggle(
        taskOf({
          status: 'reported',
          outcome: 'done',
          approvalStatus: 'closed',
        }),
      ),
    ).toBe(false);
  });

  it('opens details from the card and keeps the completion control separate', () => {
    const { result } = renderHook(() => useTaskActions(viewer));
    const onOpen = jest.fn();
    render(
      <TaskCard
        task={taskOf()}
        person={null}
        actions={result.current}
        onOpen={onOpen}
      />,
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: 'View task details: Prepare the launch',
      }),
    );
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(mockReport).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Mark as done: Prepare the launch',
      }),
    );
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(mockReport).toHaveBeenCalledWith([
      { taskId: 'task', outcome: 'done' },
    ]);
  });
});
