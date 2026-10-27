import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import FilterPopover, { countActiveFilters } from './FilterPopover';
import {
  useGetDepartments,
  useGetLevel1Departments,
} from '@/store/server/features/employees/employeeManagment/department/queries';
import {
  paymentTypesToQueryParams,
  parsePaymentTypes,
  serializePaymentTypes,
} from '@/store/uistate/features/payroll/payroll/view';

jest.mock(
  '@/store/server/features/employees/employeeManagment/department/queries',
  () => ({
    useGetDepartments: jest.fn(),
    useGetLevel1Departments: jest.fn(),
  }),
);
jest.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: () => ({ isMobile: false, isTablet: false }),
}));

const CLEARED_LEGACY = {
  yearId: undefined,
  sessionId: undefined,
  monthId: undefined,
  payrollView: undefined,
  payrollIncludes: undefined,
};

const renderFilter = (defaultValues: any = {}) => {
  const onSearch = jest.fn();
  render(<FilterPopover onSearch={onSearch} defaultValues={defaultValues} />);
  return onSearch;
};

const openFilter = () =>
  fireEvent.click(screen.getByRole('button', { name: /Filter/ }));

const CHIP_TYPE: Record<string, string> = {
  All: 'ALL',
  Salary: 'PAYROLL',
  'Monthly performance': 'PP_MONTHLY',
  'Quarterly performance': 'PP_QUARTERLY',
  Incentive: 'INCENTIVE',
};

// Found by data-cy: getByRole with a name makes jsdom parse antd selectors it rejects.
const chip = (name: string) =>
  document.querySelector(
    `[data-cy="payroll-filter-popover-payment-type-${CHIP_TYPE[name]}"]`,
  ) as HTMLButtonElement;
const isPressed = (name: string) =>
  chip(name).getAttribute('aria-pressed') === 'true';

describe('FilterPopover', () => {
  beforeEach(() => {
    (useGetDepartments as jest.Mock).mockReset();
    (useGetLevel1Departments as jest.Mock).mockReset();
    (useGetDepartments as jest.Mock).mockReturnValue({
      data: [{ id: 'dep-1', name: 'Engineering' }],
    });
    (useGetLevel1Departments as jest.Mock).mockReturnValue({
      data: [{ id: 'div-1', name: 'Technology' }],
    });
  });

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  it('searches and loads nothing until it is opened', () => {
    const onSearch = renderFilter();

    expect(onSearch).not.toHaveBeenCalled();
    expect(useGetDepartments).not.toHaveBeenCalled();
    expect(useGetLevel1Departments).not.toHaveBeenCalled();
  });

  it('shows how many filters narrow the list', () => {
    renderFilter({ paymentTypes: 'PP_MONTHLY,INCENTIVE', divisionId: 'div-1' });

    expect(screen.queryByText('2')).not.toBeNull();
  });

  it('counts the payment types as one filter and not at all when it means all', () => {
    expect(countActiveFilters({})).toBe(0);
    expect(countActiveFilters({ paymentTypes: '' })).toBe(0);
    expect(
      countActiveFilters({
        paymentTypes: 'PAYROLL,PP_MONTHLY,PP_QUARTERLY,INCENTIVE',
      }),
    ).toBe(0);
    expect(
      countActiveFilters({
        paymentTypes: 'PAYROLL,INCENTIVE',
        divisionId: 'div-1',
        departmentId: 'dep-1',
      }),
    ).toBe(3);
  });

  it('is one payment type filter plus division and department, with no time filters', async () => {
    renderFilter();
    openFilter();

    expect(await screen.findByText('Payment type')).not.toBeNull();
    ['Division', 'Department'].forEach((label) =>
      expect(screen.queryByText(label)).not.toBeNull(),
    );
    ['Includes', 'Pay period', 'Year', 'Session', 'Month'].forEach((label) =>
      expect(screen.queryByText(label)).toBeNull(),
    );
    [
      'All',
      'Salary',
      'Monthly performance',
      'Quarterly performance',
      'Incentive',
    ].forEach((name) => expect(chip(name)).not.toBeNull());
  });

  it('starts on All and lets several types be selected', async () => {
    renderFilter();
    openFilter();
    await screen.findByText('Payment type');

    expect(isPressed('All')).toBe(true);

    fireEvent.click(chip('Salary'));
    fireEvent.click(chip('Incentive'));

    expect(isPressed('All')).toBe(false);
    expect(isPressed('Salary')).toBe(true);
    expect(isPressed('Incentive')).toBe(true);
    expect(isPressed('Monthly performance')).toBe(false);
  });

  it('goes back to All when All is chosen, or when every type is selected', async () => {
    renderFilter({ paymentTypes: 'PAYROLL,INCENTIVE' });
    openFilter();
    await screen.findByText('Payment type');
    expect(isPressed('Salary')).toBe(true);

    fireEvent.click(chip('All'));
    expect(isPressed('All')).toBe(true);
    expect(isPressed('Salary')).toBe(false);

    [
      'Salary',
      'Monthly performance',
      'Quarterly performance',
      'Incentive',
    ].forEach((name) => fireEvent.click(chip(name)));
    expect(isPressed('All')).toBe(true);
    expect(isPressed('Incentive')).toBe(false);
  });

  it('applies the selected types as one list', async () => {
    const onSearch = renderFilter();
    openFilter();
    await screen.findByText('Payment type');

    fireEvent.click(chip('Incentive'));
    fireEvent.click(chip('Salary'));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    await waitFor(() =>
      expect(onSearch).toHaveBeenCalledWith({
        paymentTypes: 'PAYROLL,INCENTIVE',
        divisionId: undefined,
        departmentId: undefined,
        ...CLEARED_LEGACY,
      }),
    );
  });

  it('applies All as no payment type filter', async () => {
    const onSearch = renderFilter({ paymentTypes: 'PP_MONTHLY' });
    openFilter();
    await screen.findByText('Payment type');

    fireEvent.click(chip('All'));
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    await waitFor(() => expect(onSearch).toHaveBeenCalled());
    const sent = onSearch.mock.calls[0][0];
    expect('paymentTypes' in sent).toBe(true);
    expect(sent.paymentTypes).toBeUndefined();
  });

  it('sends a cleared division as undefined so the page drops it', async () => {
    const onSearch = renderFilter({ divisionId: 'div-1' });
    openFilter();
    await screen.findByText('Division');

    const clear = document.querySelector(
      '[data-cy="payroll-filter-popover-division-select"] .ant-select-clear',
    );
    expect(clear).not.toBeNull();
    fireEvent.mouseDown(clear!);
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    await waitFor(() => expect(onSearch).toHaveBeenCalled());
    const sent = onSearch.mock.calls[0][0];
    expect('divisionId' in sent).toBe(true);
    expect(sent.divisionId).toBeUndefined();
  });

  it('resets every narrowing filter', async () => {
    const onSearch = renderFilter({
      paymentTypes: 'INCENTIVE',
      divisionId: 'div-1',
      departmentId: 'dep-1',
    });
    openFilter();

    fireEvent.click(await screen.findByRole('button', { name: 'Reset' }));

    expect(onSearch).toHaveBeenCalledWith({
      paymentTypes: undefined,
      divisionId: undefined,
      departmentId: undefined,
      ...CLEARED_LEGACY,
    });
    await waitFor(() => expect(isPressed('All')).toBe(true));
  });
});

describe('payment type helpers', () => {
  it('reads the stored list in a fixed order and ignores unknown names', () => {
    expect(parsePaymentTypes('INCENTIVE,PAYROLL,nonsense')).toEqual([
      'PAYROLL',
      'INCENTIVE',
    ]);
    expect(parsePaymentTypes('')).toEqual([]);
    expect(parsePaymentTypes(undefined)).toEqual([]);
  });

  it('stores nothing for none or all four types', () => {
    expect(serializePaymentTypes([])).toBeUndefined();
    expect(
      serializePaymentTypes([
        'PAYROLL',
        'PP_MONTHLY',
        'PP_QUARTERLY',
        'INCENTIVE',
      ]),
    ).toBeUndefined();
    expect(serializePaymentTypes(['INCENTIVE', 'PAYROLL'])).toBe(
      'PAYROLL,INCENTIVE',
    );
  });

  it('sends the list API one paymentTypes param, or none for all', () => {
    expect(paymentTypesToQueryParams('PP_MONTHLY,PP_QUARTERLY')).toEqual({
      paymentTypes: 'PP_MONTHLY,PP_QUARTERLY',
    });
    expect(paymentTypesToQueryParams('')).toEqual({});
    expect(paymentTypesToQueryParams(undefined)).toEqual({});
  });
});
