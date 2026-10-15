import React from 'react';
import '@testing-library/jest-dom/jest-globals';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { DeadlineTask } from '@/store/server/features/deadlinePlan/interface';
import PlanCard from './PlanCard';

const mockApprove = jest.fn();
const mockSetApprovalRequest = jest.fn();
const mockLock = jest.fn();
const mockOpenTaskForm = jest.fn();
const mockSearch = jest.fn();
const mockTaskList = jest.fn();
let mockTasks: DeadlineTask[] = [];

jest.mock(
  '@/store/server/features/deadlinePlan/queries',
  () => ({
    useDeadlineTasks: (filter: unknown) => {
      mockSearch(filter);
      return {
        data: { pages: [{ items: mockTasks, meta: { totalItems: 87 } }] },
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: jest.fn(),
      };
    },
  }),
  { virtual: true },
);
jest.mock(
  '@/store/server/features/deadlinePlan/mutations',
  () => ({
    useApproveDeadlineTasks: () => ({ mutate: mockApprove, isLoading: false }),
    useLockDeadlineTasks: () => ({ mutate: mockLock, isLoading: false }),
  }),
  { virtual: true },
);
jest.mock(
  '@/store/uistate/features/deadlinePlan/useStore',
  () => ({
    useDeadlinePlanStore: (selector: any) =>
      selector({
        openTaskForm: mockOpenTaskForm,
        setApprovalRequest: mockSetApprovalRequest,
      }),
  }),
  { virtual: true },
);
jest.mock('./TaskList', () => ({
  __esModule: true,
  default: (props: unknown) => {
    mockTaskList(props);
    return null;
  },
}));

const viewer = {
  userId: 'manager',
  subordinateIds: ['employee'],
  canManageAll: false,
};
const filter = { status: 'all' as const, includeOverdue: true };
const getPerson = (id: string | null | undefined) =>
  id
    ? {
        id,
        name: id === 'employee' ? 'Hana Bekele' : 'Selam Manager',
        departmentName: 'Operations',
      }
    : null;
const taskOf = (
  id: string,
  overrides: Partial<DeadlineTask> = {},
): DeadlineTask =>
  ({
    id,
    title: id,
    assigneeId: 'employee',
    assignedById: null,
    parentTaskId: null,
    status: 'active',
    outcome: null,
    approvalStatus: 'open',
    isLocked: false,
    lockedById: null,
    ...overrides,
  }) as DeadlineTask;

beforeEach(() => {
  jest.clearAllMocks();
  mockTasks = [];
});

describe('grouped subordinate plan controls', () => {
  it('offers plan selection only for direct reports', () => {
    const onSelectionChange = jest.fn();
    const { rerender } = render(
      <PlanCard
        assigneeId="employee"
        filter={filter}
        viewer={viewer}
        getPerson={getPerson}
        onSelectionChange={onSelectionChange}
      />,
    );
    fireEvent.click(
      screen.getByRole('checkbox', { name: "Select Hana Bekele's plan" }),
    );
    expect(onSelectionChange).toHaveBeenCalledWith(true);
    rerender(
      <PlanCard
        assigneeId="manager"
        filter={filter}
        viewer={viewer}
        getPerson={getPerson}
        onSelectionChange={onSelectionChange}
      />,
    );
    expect(screen.queryByRole('checkbox')).toBeNull();
    rerender(
      <PlanCard
        assigneeId="employee"
        filter={filter}
        viewer={{ ...viewer, subordinateIds: [], canManageAll: true }}
        getPerson={getPerson}
        onSelectionChange={onSelectionChange}
      />,
    );
    expect(screen.queryByRole('checkbox')).toBeNull();
  });
  it('queries the chosen person and opens task creation with that assignee', () => {
    render(
      <PlanCard
        assigneeId="employee"
        filter={filter}
        viewer={viewer}
        getPerson={getPerson}
      />,
    );
    expect(mockSearch).toHaveBeenCalledWith({
      ...filter,
      assigneeIds: ['employee'],
    });
    expect(
      screen.getByRole('heading', { name: 'Hana Bekele' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Direct report · Operations')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));
    expect(mockOpenTaskForm).toHaveBeenCalledWith({ assigneeId: 'employee' });
    expect(mockTaskList).toHaveBeenCalledWith(
      expect.objectContaining({ showAddTask: false }),
    );
    expect(screen.queryByText(/87 tasks/)).not.toBeInTheDocument();
  });

  it('opens manager review for pending reports and locks eligible active tasks', () => {
    mockTasks = [
      taskOf('pending', { status: 'reported', approvalStatus: 'pending' }),
      taskOf('closed', { status: 'reported', approvalStatus: 'closed' }),
      taskOf('active'),
    ];
    render(
      <PlanCard
        assigneeId="employee"
        filter={filter}
        viewer={viewer}
        getPerson={getPerson}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Approve reported' }));
    expect(mockSetApprovalRequest).toHaveBeenCalledWith({
      taskIds: ['pending'],
      title: "Hana Bekele's reported tasks",
    });
    expect(mockApprove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Lock tasks' }));
    expect(mockLock).toHaveBeenCalledWith({
      taskIds: ['active'],
      isLocked: true,
    });
  });

  it('lets managers unlock locked active tasks and excludes finished tasks', () => {
    mockTasks = [
      taskOf('locked', { isLocked: true, lockedById: 'other-manager' }),
      taskOf('closed', { isLocked: true, approvalStatus: 'closed' }),
    ];
    render(
      <PlanCard
        assigneeId="employee"
        filter={filter}
        viewer={viewer}
        getPerson={getPerson}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Unlock tasks' }));
    expect(mockLock).toHaveBeenCalledWith({
      taskIds: ['locked'],
      isLocked: false,
    });
  });

  it('hides management actions for viewers who do not manage the assignee', () => {
    mockTasks = [
      taskOf('pending', { status: 'reported', approvalStatus: 'pending' }),
      taskOf('active'),
    ];
    render(
      <PlanCard
        assigneeId="employee"
        filter={filter}
        viewer={{ ...viewer, subordinateIds: [] }}
        getPerson={getPerson}
      />,
    );
    expect(
      screen.queryByRole('button', { name: 'Approve reported' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Lock tasks' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Unlock tasks' }),
    ).not.toBeInTheDocument();
  });

  it('retains My Plan and prevents assignees from approving their own reports', () => {
    mockTasks = [
      taskOf('own', {
        assigneeId: 'manager',
        status: 'reported',
        approvalStatus: 'pending',
      }),
    ];
    render(
      <PlanCard
        assigneeId="manager"
        filter={filter}
        viewer={viewer}
        getPerson={getPerson}
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'My Plan' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Approve reported' }),
    ).not.toBeInTheDocument();
  });
});
