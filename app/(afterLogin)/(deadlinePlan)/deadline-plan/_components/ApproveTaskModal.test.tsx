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
      <div role="dialog">
        <h2>{title}</h2>
        <button onClick={onOk} disabled={confirmLoading}>
          {okText}
        </button>
        <button onClick={onCancel}>Cancel</button>
        {children}
      </div>
    ) : null,
  Input: {
    TextArea: ({ id, value, onChange, disabled, maxLength }: any) => (
      <textarea
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

describe('manager approval comment', () => {
  it('submits trimmed feedback and closes only after successful approval', () => {
    render(<ApproveTaskModal />);
    fireEvent.change(screen.getByLabelText(/Manager comment/), {
      target: { value: '  Well done.  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Approve report' }));
    expect(mockApprove).toHaveBeenCalledWith(
      { taskIds: ['task'], comment: 'Well done.' },
      expect.any(Object),
    );
    expect(useDeadlinePlanStore.getState().approvalRequest).not.toBeNull();
    act(() => (mockApprove.mock.calls[0][1] as any).onSuccess());
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps the comment optional and supports bulk approval', () => {
    useDeadlinePlanStore.setState({
      approvalRequest: { taskIds: ['one', 'two'], title: 'Hana’s reports' },
    });
    render(<ApproveTaskModal />);
    fireEvent.click(screen.getByRole('button', { name: 'Approve reports' }));
    expect(mockApprove).toHaveBeenCalledWith(
      { taskIds: ['one', 'two'], comment: undefined },
      expect.any(Object),
    );
    expect(screen.getByText(/saved on each approved task report/)).toBeTruthy();
  });

  it('discards a canceled draft and clears it when a different approval is opened', () => {
    render(<ApproveTaskModal />);
    fireEvent.change(screen.getByLabelText(/Manager comment/), {
      target: { value: 'Old draft' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockApprove).not.toHaveBeenCalled();
    act(() =>
      useDeadlinePlanStore.setState({
        approvalRequest: { taskIds: ['next'], title: 'Next report' },
      }),
    );
    expect(
      (screen.getByLabelText(/Manager comment/) as HTMLTextAreaElement).value,
    ).toBe('');
  });

  it('disables submission and input while approval is pending', () => {
    mockIsLoading = true;
    render(<ApproveTaskModal />);
    expect(
      (screen.getByLabelText(/Manager comment/) as HTMLTextAreaElement)
        .disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Approve report' }));
    expect(mockApprove).not.toHaveBeenCalled();
  });
});
