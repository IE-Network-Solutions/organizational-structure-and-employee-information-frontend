import React from 'react';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import Toolbar from './Toolbar';
import { useDeadlinePlanStore } from '@/store/uistate/features/deadlinePlan/useStore';
jest.mock('./ViewSwitcher', () => ({ __esModule: true, default: () => null }));
const mockLockPlans = jest.fn();
let mockLockState = 'unlocked';
jest.mock('@/store/server/features/deadlinePlan/mutations', () => ({
  useLockDeadlinePlans: () => ({ mutate: mockLockPlans, isLoading: false }),
}));
jest.mock('@/store/server/features/deadlinePlan/queries', () => ({
  useDeadlinePlanLockState: () => ({
    data: mockLockState,
    isFetching: false,
    isError: false,
  }),
}));

jest.mock('antd', () => ({
  Checkbox: ({ checked, onChange, children }: any) => (
    <label data-cy="mock-toolbar-checkbox-label">
      <input
        data-cy="mock-toolbar-checkbox"
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      {children}
    </label>
  ),
  Button: ({ children, onClick, ...props }: any) => (
    <button
      data-cy="mock-toolbar-action"
      onClick={onClick}
      aria-label={props['aria-label']}
      disabled={props.disabled}
    >
      {children}
    </button>
  ),
  Select: ({ value, onChange, options, ...props }: any) => (
    <select
      data-cy="mock-toolbar-select"
      aria-label={props['aria-label']}
      value={value}
      disabled={props.disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option: any) => (
        <option
          data-cy={`mock-toolbar-option-${option.value}`}
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  ),
  Popover: ({ children, content, open, onOpenChange }: any) => (
    <>
      <div
        data-cy="mock-toolbar-popover-trigger"
        onClick={() => onOpenChange(!open)}
      >
        {children}
      </div>
      {open ? (
        <div data-cy="mock-toolbar-popover" role="dialog">
          {content}
        </div>
      ) : null}
    </>
  ),
  DatePicker: { RangePicker: () => null },
  Tooltip: ({ children }: any) => children,
}));
jest.mock('./AssigneePicker', () => ({
  __esModule: true,
  default: ({ people, onChange }: any) => (
    <div data-cy="mock-toolbar-assignee-picker">
      {people.map((person: any) => (
        <button
          data-cy={`mock-toolbar-assignee-${person.id}`}
          key={person.id}
          onClick={() => onChange([person.id])}
        >
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
  filter: {
    assigneeIds: ['me', 'alice'],
    status: 'active' as const,
    includeOverdue: true,
  },
};
beforeEach(() => {
  jest.clearAllMocks();
  mockLockState = 'unlocked';
  useDeadlinePlanStore.setState({
    viewMode: 'list',
    duration: 'upcoming',
    historyRange: null,
    department: 'all',
    status: 'active',
    assigneeIds: null,
  });
});

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

  it('consolidates all grouped-view filters into Filters and requires Apply for people changes', () => {
    useDeadlinePlanStore.setState({ viewMode: 'grouped' });
    render(<Toolbar {...props} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Filter and view options' }),
    );
    expect(
      screen.queryByRole('button', { name: 'Choose people and departments' }),
    ).toBeNull();
    expect(screen.getByLabelText('Department')).toBeTruthy();
    expect(screen.getByLabelText('Duration')).toBeTruthy();
    expect(screen.getByLabelText('Task status')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Choose Alice' }));
    expect(useDeadlinePlanStore.getState().assigneeIds).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(useDeadlinePlanStore.getState().assigneeIds).toEqual(['alice']);
  });

  it('places visible plan locks beside the view switcher and excludes the viewer from management', () => {
    const { rerender } = render(<Toolbar {...props} />);
    const lock = screen.getByRole('button', { name: 'Lock plans' });
    expect(screen.queryByRole('button', { name: 'Unlock plans' })).toBeNull();
    expect(
      lock.closest('[data-cy="deadline-plan-view-controls"]'),
    ).not.toBeNull();
    fireEvent.click(lock);
    expect(mockLockPlans).toHaveBeenCalledWith({
      filter: { ...props.filter, assigneeIds: ['alice'] },
      isLocked: true,
    });
    mockLockState = 'locked';
    rerender(<Toolbar {...props} />);
    expect(screen.queryByRole('button', { name: 'Lock plans' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Unlock plans' }));
    expect(mockLockPlans).toHaveBeenLastCalledWith({
      filter: { ...props.filter, assigneeIds: ['alice'] },
      isLocked: false,
    });
  });

  it('hides management actions when no selected person reports directly to the viewer', () => {
    render(<Toolbar {...props} directReportIds={[]} />);
    expect(screen.queryByRole('button', { name: 'Lock plans' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Unlock plans' })).toBeNull();
  });

  it('shows only Unlock for already locked plans', () => {
    mockLockState = 'locked';
    render(<Toolbar {...props} />);
    expect(screen.queryByRole('button', { name: 'Lock plans' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Unlock plans' }));
    expect(mockLockPlans).toHaveBeenCalledWith({
      filter: { ...props.filter, assigneeIds: ['alice'] },
      isLocked: false,
    });
  });

  it('disables the single lock action when the selected plans contain no active tasks', () => {
    mockLockState = 'empty';
    render(<Toolbar {...props} />);
    const lock = screen.getByRole('button', {
      name: 'Lock plans',
    }) as HTMLButtonElement;
    expect(lock.disabled).toBe(true);
    expect(screen.queryByRole('button', { name: 'Unlock plans' })).toBeNull();
    fireEvent.click(lock);
    expect(mockLockPlans).not.toHaveBeenCalled();
  });

  it('keeps reported plans from being locked or unlocked', () => {
    render(
      <Toolbar {...props} filter={{ ...props.filter, status: 'reported' }} />,
    );
    const lock = screen.getByRole('button', {
      name: 'Lock plans',
    }) as HTMLButtonElement;
    expect(lock.disabled).toBe(true);
    fireEvent.click(lock);
    expect(mockLockPlans).not.toHaveBeenCalled();
  });

  it('selects multiple direct reports for a bulk lock without including Self or unrelated plans', () => {
    useDeadlinePlanStore.setState({ viewMode: 'grouped' });
    const onSelectionChange = jest.fn();
    const bulkProps = {
      ...props,
      directReportIds: ['alice', 'bob'],
      filter: { ...props.filter, assigneeIds: ['me', 'alice', 'bob', 'other'] },
      onPlanSelectionChange: onSelectionChange,
    };
    const { rerender } = render(
      <Toolbar {...bulkProps} selectedPlanIds={[]} />,
    );
    expect(
      (screen.getByRole('button', { name: 'Lock plans' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all plans' }));
    expect(onSelectionChange).toHaveBeenCalledWith(['alice', 'bob']);
    rerender(<Toolbar {...bulkProps} selectedPlanIds={['alice', 'bob']} />);
    fireEvent.click(screen.getByRole('button', { name: 'Lock plans' }));
    expect(mockLockPlans).toHaveBeenLastCalledWith({
      filter: { ...bulkProps.filter, assigneeIds: ['alice', 'bob'] },
      isLocked: true,
    });
    mockLockState = 'locked';
    rerender(<Toolbar {...bulkProps} selectedPlanIds={['bob']} />);
    fireEvent.click(screen.getByRole('button', { name: 'Unlock plans' }));
    expect(mockLockPlans).toHaveBeenLastCalledWith({
      filter: { ...bulkProps.filter, assigneeIds: ['bob'] },
      isLocked: false,
    });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all plans' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['alice', 'bob']);
  });
});
