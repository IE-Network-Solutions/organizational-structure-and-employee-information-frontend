import React from 'react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, render, screen } from '@testing-library/react';
import DeadlinePlanPage from './page';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';

let mockReports: string[] = [];
jest.mock('./_components/useDeadlinePeople', () => ({
  useDeadlinePeople: () => ({
    userId: 'me',
    subordinateIds: mockReports,
    viewer: { userId: 'me', subordinateIds: mockReports, canManageAll: false },
    selectablePeople: ['me', ...mockReports].map((id) => ({ id, name: id })),
    departmentOptions: [],
    getPerson: (id: string) => ({ id, name: id }),
    getDepartmentMemberIds: () => [],
  }),
}));
jest.mock('@/components/common/breadCramp', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('./_components/Toolbar', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('./_components/TaskFormModal', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('./_components/ReportTaskModal', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('./_components/ApproveTaskModal', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('./_components/KeyResultPanel', () => ({
  __esModule: true,
  default: ({ ownerIds }: any) => (
    <div data-cy="deadline-plan-page-test-div-42" data-testid="owners">{ownerIds.join(',')}</div>
  ),
}));
jest.mock('./_components/ListView', () => ({
  __esModule: true,
  default: ({ filter }: any) => (
    <div data-cy="deadline-plan-page-test-div-48" data-testid="tasks">{filter.assigneeIds.join(',')}</div>
  ),
}));
jest.mock('./_components/GroupedView', () => ({
  __esModule: true,
  default: ({ assigneeIds }: any) => (
    <div data-cy="deadline-plan-page-test-div-54" data-testid="plans">{assigneeIds.join(',')}</div>
  ),
}));

beforeEach(() => {
  mockReports = [];
  useDeadlinePlanStore.setState({
    assigneeIds: null,
    department: 'all',
    viewMode: 'list',
    duration: 'upcoming',
    status: 'active',
  });
});
describe('Me & direct reports scope', () => {
  it('adds reports to both tasks and KRs when employee data arrives after the first render', () => {
    const { rerender } = render(<DeadlinePlanPage />);
    expect(screen.getByTestId('owners').textContent).toBe('me');
    mockReports = ['alice', 'bob'];
    rerender(<DeadlinePlanPage />);
    expect(screen.getByTestId('owners').textContent).toBe('me,alice,bob');
    expect(screen.getByTestId('tasks').textContent).toBe('me,alice,bob');
    expect(useDeadlinePlanStore.getState().assigneeIds).toBeNull();
  });

  it('includes the same reports in grouped plans without overriding a custom selection', () => {
    mockReports = ['alice'];
    useDeadlinePlanStore.setState({ viewMode: 'grouped' });
    const { rerender } = render(<DeadlinePlanPage />);
    expect(screen.getByTestId('plans').textContent).toBe('me,alice');
    act(() => useDeadlinePlanStore.setState({ assigneeIds: ['me'] }));
    rerender(<DeadlinePlanPage />);
    expect(screen.getByTestId('owners').textContent).toBe('me');
    expect(screen.getByTestId('plans').textContent).toBe('me');
  });
});
