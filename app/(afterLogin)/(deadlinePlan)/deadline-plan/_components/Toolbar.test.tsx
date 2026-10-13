import React from 'react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import Toolbar from './Toolbar';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';
jest.mock('./ViewSwitcher', () => ({ __esModule: true, default: () => null }));

jest.mock('antd', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} aria-label={props['aria-label']}>
      {children}
    </button>
  ),
  Select: ({ value, onChange, options, ...props }: any) => (
    <select
      aria-label={props['aria-label']}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
  Popover: ({ children, content, open, onOpenChange }: any) => (
    <>
      <div onClick={() => onOpenChange(!open)}>{children}</div>
      {open ? <div role="dialog">{content}</div> : null}
    </>
  ),
  DatePicker: { RangePicker: () => null },
}));
jest.mock('./AssigneePicker', () => ({
  __esModule: true,
  default: ({ people, onChange }: any) => (
    <div>
      {people.map((person: any) => (
        <button key={person.id} onClick={() => onChange([person.id])}>
          Choose {person.name}
        </button>
      ))}
    </div>
  ),
}));

const props = {
  userId: 'me',
  people: [
    { id: 'me', name: 'Self' },
    { id: 'alice', name: 'Alice' },
  ],
  directReportIds: ['alice'],
  departmentOptions: [
    { label: 'All', value: 'all' },
    { label: 'Sales', value: 'sales' },
  ],
  selectedAssigneeIds: ['me', 'alice'],
  getDepartmentMemberIds: () => ['alice'],
};
beforeEach(() =>
  useDeadlinePlanStore.setState({
    viewMode: 'list',
    duration: 'upcoming',
    historyRange: null,
    department: 'all',
    status: 'active',
    assigneeIds: null,
  }),
);

describe('explicit filter application', () => {
  it('keeps selections pending until Apply and closes the popover after applying', () => {
    render(<Toolbar {...props} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Filter and view options' }),
    );
    fireEvent.change(screen.getByLabelText('Duration'), {
      target: { value: 'month' },
    });
    fireEvent.change(screen.getByLabelText('Department'), {
      target: { value: 'sales' },
    });
    fireEvent.change(screen.getByLabelText('Task status'), {
      target: { value: 'reported' },
    });
    expect(useDeadlinePlanStore.getState()).toMatchObject({
      duration: 'upcoming',
      department: 'all',
      status: 'active',
      assigneeIds: null,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(useDeadlinePlanStore.getState()).toMatchObject({
      duration: 'month',
      department: 'sales',
      status: 'reported',
      assigneeIds: ['alice'],
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('discards changes on Cancel and reopens with the applied values', () => {
    render(<Toolbar {...props} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Filter and view options' }),
    );
    fireEvent.change(screen.getByLabelText('Duration'), {
      target: { value: 'today' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(useDeadlinePlanStore.getState().duration).toBe('upcoming');
    fireEvent.click(
      screen.getByRole('button', { name: 'Filter and view options' }),
    );
    expect((screen.getByLabelText('Duration') as HTMLSelectElement).value).toBe(
      'upcoming',
    );
  });

  it('restores the dynamic direct-report scope when requested', () => {
    useDeadlinePlanStore.setState({ assigneeIds: ['me'] });
    render(<Toolbar {...props} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Filter and view options' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Me & direct reports' }),
    );
    expect(useDeadlinePlanStore.getState().assigneeIds).toEqual(['me']);
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(useDeadlinePlanStore.getState().assigneeIds).toBeNull();
  });

  it('requires Apply for grouped People selections too', () => {
    useDeadlinePlanStore.setState({ viewMode: 'grouped' });
    render(<Toolbar {...props} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Choose people and departments' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Choose Alice' }));
    expect(useDeadlinePlanStore.getState().assigneeIds).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(useDeadlinePlanStore.getState().assigneeIds).toEqual(['alice']);
  });
});
