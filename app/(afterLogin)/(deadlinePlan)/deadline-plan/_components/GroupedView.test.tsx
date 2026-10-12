import React from 'react';
import '@testing-library/jest-dom/jest-globals';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import GroupedView from './GroupedView';

const mockSetStatus = jest.fn();
let mockDuration = 'upcoming';
jest.mock(
  '@/store/uistate/features/deadlinePlan/useStore',
  () => ({
    useDeadlinePlanStore: () => ({
      status: 'active',
      duration: mockDuration,
      setStatus: mockSetStatus,
    }),
  }),
  { virtual: true },
);
jest.mock('./PlanCard', () => ({
  __esModule: true,
  default: ({ assigneeId }: { assigneeId: string }) => (
    <div data-cy="test-person-plan">{assigneeId}</div>
  ),
}));

const viewer = {
  userId: 'manager',
  subordinateIds: ['employee'],
  canManageAll: false,
};
const filter = { status: 'active' as const, includeOverdue: true };
const getPerson = (id: string | null | undefined) =>
  id ? { id, name: id } : null;
beforeEach(() => {
  jest.clearAllMocks();
  mockDuration = 'upcoming';
});

describe('grouped plan review', () => {
  it('keeps the selected owner order and exposes reported tasks for review', () => {
    render(
      <GroupedView
        assigneeIds={['manager', 'employee']}
        filter={filter}
        viewer={viewer}
        getPerson={getPerson}
      />,
    );
    expect(
      screen
        .getAllByText(/^(manager|employee)$/)
        .map((element) => element.textContent),
    ).toEqual(['manager', 'employee']);
    fireEvent.click(screen.getByRole('radio', { name: 'Reported' }));
    expect(mockSetStatus).toHaveBeenCalledWith('reported');
  });

  it('retains the original progressive loading of people', () => {
    const ids = Array.from(
      { length: 12 },
      (unused, index) => `person-${index}`,
    );
    render(
      <GroupedView
        assigneeIds={ids}
        filter={filter}
        viewer={viewer}
        getPerson={getPerson}
      />,
    );
    expect(screen.getAllByText(/^person-\d+$/)).toHaveLength(8);
    fireEvent.click(
      screen.getByRole('button', { name: 'Show 4 more people (4 left)' }),
    );
    expect(screen.getAllByText(/^person-\d+$/)).toHaveLength(12);
  });

  it('keeps History fixed to reported tasks', () => {
    mockDuration = 'history';
    render(
      <GroupedView
        assigneeIds={['employee']}
        filter={{ ...filter, status: 'reported' }}
        viewer={viewer}
        getPerson={getPerson}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Reported' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Active' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'All' })).toBeDisabled();
  });
});
