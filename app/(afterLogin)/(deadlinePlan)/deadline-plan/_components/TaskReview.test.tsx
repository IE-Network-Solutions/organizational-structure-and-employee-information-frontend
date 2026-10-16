import React from 'react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { DeadlineTask } from '@/store/server/features/deadlinePlan/interface';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';
import { TaskActions } from './useTaskActions';
import { resolveTaskPermissions } from './utils';
import TaskReview from './TaskReview';

const mockSave = jest.fn();
const mockUndo = jest.fn();
let mockSaving = false;
jest.mock('@/store/server/features/deadlinePlan/mutations', () => ({
  useCommentOnDeadlineTask: () => ({ mutate: mockSave, isLoading: mockSaving }),
}));
jest.mock('antd', () => ({
  Button: ({ children, onClick, disabled, loading }: any) => (
    <button onClick={onClick} disabled={disabled || loading}>
      {children}
    </button>
  ),
  Input: {
    TextArea: ({ id, value, onChange, disabled }: any) => (
      <textarea id={id} value={value} onChange={onChange} disabled={disabled} />
    ),
  },
}));
const task = {
  id: 'task',
  title: 'Delivery',
  assigneeId: 'employee',
  status: 'reported',
  approvalStatus: 'pending',
  approvalComment: null,
} as DeadlineTask;
const actionsFor = (
  userId: string,
  subordinateIds: string[] = [],
): TaskActions =>
  ({
    permissionsOf: (value: DeadlineTask) =>
      resolveTaskPermissions(value, {
        userId,
        subordinateIds,
        canManageAll: true,
      }),
    undoReport: mockUndo,
    isToggling: false,
  }) as unknown as TaskActions;
const managerActions = actionsFor('manager', ['employee']);
const getPerson = (id: string | null | undefined) =>
  id
    ? { id, name: id === 'manager' ? 'Engineering Manager' : 'Employee' }
    : null;
beforeEach(() => {
  jest.clearAllMocks();
  mockSaving = false;
  useDeadlinePlanStore.setState({ approvalRequest: null });
});

describe('feedback before report approval', () => {
  it('saves feedback while the report remains pending, then offers a separate approval action', () => {
    render(
      <TaskReview task={task} actions={managerActions} getPerson={getPerson} />,
    );
    fireEvent.change(screen.getByLabelText('Comment before approval'), {
      target: { value: '  Correct the achieved value.  ' },
    });
    expect(
      (
        screen.getByRole('button', {
          name: 'Approve report',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Save comment' }));
    expect(mockSave).toHaveBeenCalledWith(
      { id: 'task', comment: 'Correct the achieved value.' },
      expect.any(Object),
    );
    expect(useDeadlinePlanStore.getState().approvalRequest).toBeNull();
    act(() =>
      (mockSave.mock.calls[0][1] as any).onSuccess({
        ...task,
        approvalComment: 'Correct the achieved value.',
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Approve report' }));
    expect(useDeadlinePlanStore.getState().approvalRequest).toEqual({
      taskIds: ['task'],
      title: 'Delivery',
    });
  });

  it('shows saved feedback to the assignee before approval and allows undo for corrections', () => {
    const feedback = {
      ...task,
      approvalComment: 'Please correct the value',
      commentedById: 'manager',
      commentedAt: '2026-10-15T08:00:00Z',
    };
    const { rerender } = render(
      <TaskReview
        task={feedback}
        actions={actionsFor('employee')}
        getPerson={getPerson}
      />,
    );
    expect(screen.getByText('Please correct the value')).toBeTruthy();
    expect(screen.getByText(/Engineering Manager/)).toBeTruthy();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Approve report' })).toBeNull();
    fireEvent.click(
      screen.getByRole('button', { name: 'Undo report to make changes' }),
    );
    expect(mockUndo).toHaveBeenCalledWith(feedback);
    rerender(
      <TaskReview
        task={{ ...feedback, status: 'active', approvalStatus: 'open' }}
        actions={actionsFor('employee')}
        getPerson={getPerson}
      />,
    );
    expect(screen.getByText('Please correct the value')).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: 'Undo report to make changes' }),
    ).toBeNull();
  });

  it('does not expose comment or approval controls to unrelated users or after approval', () => {
    const { rerender } = render(
      <TaskReview
        task={task}
        actions={actionsFor('other')}
        getPerson={getPerson}
      />,
    );
    expect(screen.queryByRole('region')).toBeNull();
    rerender(
      <TaskReview
        task={{
          ...task,
          approvalStatus: 'closed',
          approvalComment: 'Earlier feedback',
        }}
        actions={managerActions}
        getPerson={getPerson}
      />,
    );
    expect(screen.getByText('Earlier feedback')).toBeTruthy();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Approve report' })).toBeNull();
  });

  it('blocks blank comments and duplicate submission while saving', () => {
    const { rerender } = render(
      <TaskReview task={task} actions={managerActions} getPerson={getPerson} />,
    );
    fireEvent.change(screen.getByLabelText('Comment before approval'), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save comment' }));
    expect(mockSave).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Comment before approval'), {
      target: { value: 'Feedback' },
    });
    mockSaving = true;
    rerender(
      <TaskReview task={task} actions={managerActions} getPerson={getPerson} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save comment' }));
    expect(mockSave).not.toHaveBeenCalled();
  });
});
