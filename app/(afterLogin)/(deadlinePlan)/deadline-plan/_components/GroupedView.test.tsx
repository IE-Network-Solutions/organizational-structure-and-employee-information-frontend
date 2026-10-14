import React from 'react';
import '@testing-library/jest-dom/jest-globals';
import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import GroupedView from './GroupedView';

jest.mock('./PlanCard', () => ({
  __esModule: true,
  default: ({ assigneeId, filter }: any) => (
    <div data-cy="test-person-plan" data-status={filter.status}>
      {assigneeId}
    </div>
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

describe('grouped plan review', () => {
  it('keeps owner order and uses the status provided by the unified filters', () => {
    render(
      <GroupedView
        assigneeIds={['manager', 'employee']}
        filter={{ ...filter, status: 'reported' }}
        viewer={viewer}
        getPerson={getPerson}
      />,
    );
    expect(
      screen
        .getAllByText(/^(manager|employee)$/)
        .map((element) => element.textContent),
    ).toEqual(['manager', 'employee']);
    expect(screen.getByText('employee')).toHaveAttribute(
      'data-status',
      'reported',
    );
    expect(screen.queryByRole('radio', { name: 'Reported' })).toBeNull();
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
    render(
      <GroupedView
        assigneeIds={['employee']}
        filter={{ ...filter, status: 'reported' }}
        viewer={viewer}
        getPerson={getPerson}
      />,
    );
    expect(screen.getByText('employee')).toHaveAttribute(
      'data-status',
      'reported',
    );
    expect(screen.queryByRole('radio')).toBeNull();
  });
});
