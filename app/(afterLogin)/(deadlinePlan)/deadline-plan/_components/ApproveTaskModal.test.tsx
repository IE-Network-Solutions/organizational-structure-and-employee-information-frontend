import React from 'react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';
import ApproveTaskModal from './ApproveTaskModal';

const mockApprove = jest.fn();
let mockIsLoading = false;
jest.mock('@/store/server/features/deadlinePlan/mutations', () => ({
  useApproveDeadlineTasks: () => ({
    mutate: mockApprove,
    isLoading: mockIsLoading,
  }),
}));
jest.mock('antd', () => ({
  Modal: ({
    open,
    title,
    okText,
    onOk,
    onCancel,
    confirmLoading,
    children,
  }: any) =>
    open ? (
      <div data-cy="deadline-plan-approve-task-modal-test-div-26" role="dialog">
        <h2 data-cy="deadline-plan-approve-task-modal-test-h2-27">{title}</h2>
        <button data-cy="deadline-plan-approve-task-modal-test-button-28" onClick={onOk} disabled={confirmLoading}>
          {okText}
        </button>
        <button data-cy="deadline-plan-approve-task-modal-test-button-31" onClick={onCancel}>Cancel</button>
        {children}
      </div>
    ) : null,
  Input: {
    TextArea: ({ id, value, onChange, disabled, maxLength }: any) => (
      <textarea data-cy="deadline-plan-approve-task-modal-test-textarea-37"
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        maxLength={maxLength}
      />
    ),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockIsLoading = false;
  useDeadlinePlanStore.setState({
    approvalRequest: { taskIds: ['task'], title: 'Deliver the project' },
  });
});

describe('report approval after feedback', () => {
  it('approves without coupling comment submission to approval and closes only after success', () => {
    render(<ApproveTaskModal />);
    expect(screen.queryByRole('textbox')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Approve report' }));
    expect(mockApprove).toHaveBeenCalledWith(
      { taskIds: ['task'] },
      expect.any(Object),
    );
    expect(useDeadlinePlanStore.getState().approvalRequest).not.toBeNull();
    act(() => (mockApprove.mock.calls[0][1] as any).onSuccess());
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('supports bulk approval and directs managers to save feedback beforehand', () => {
    useDeadlinePlanStore.setState({
      approvalRequest: { taskIds: ['one', 'two'], title: 'Hana’s reports' },
    });
    render(<ApproveTaskModal />);
    fireEvent.click(screen.getByRole('button', { name: 'Approve reports' }));
    expect(mockApprove).toHaveBeenCalledWith(
      { taskIds: ['one', 'two'] },
      expect.any(Object),
    );
    expect(screen.getByText(/Save any feedback in each task/)).toBeTruthy();
  });

  it('cancels without approving and opens the next report', () => {
    render(<ApproveTaskModal />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockApprove).not.toHaveBeenCalled();
    act(() =>
      useDeadlinePlanStore.setState({
        approvalRequest: { taskIds: ['next'], title: 'Next report' },
      }),
    );
    expect(screen.getByText('Next report')).toBeTruthy();
  });

  it('disables submission while approval is pending', () => {
    mockIsLoading = true;
    render(<ApproveTaskModal />);
    fireEvent.click(screen.getByRole('button', { name: 'Approve report' }));
    expect(mockApprove).not.toHaveBeenCalled();
  });
});
