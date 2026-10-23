import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ExportPayrollModal, { PayrollExportOptions } from './index';

const allOn: PayrollExportOptions = {
  bankLetter: true,
  exportPayroll: true,
  exportBank: true,
};

const renderModal = (
  overrides: Partial<React.ComponentProps<typeof ExportPayrollModal>> = {},
) => {
  const props = {
    open: true,
    isApproved: true,
    options: allOn,
    onOptionChange: jest.fn(),
    scopeLabel: 'all 12 employees in this view',
    onClose: jest.fn(),
    onExport: jest.fn(),
    ...overrides,
  };
  render(<ExportPayrollModal {...props} />);
  return props;
};

const isDisabled = (name: string) =>
  (screen.getByRole('switch', { name }) as HTMLButtonElement).disabled;

describe('ExportPayrollModal', () => {
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

  it('offers payroll details, the bank transfer list and the bank letter, and no email option', () => {
    renderModal();

    ['Payroll details', 'Bank transfer list', 'Bank letter'].forEach((name) =>
      expect(screen.queryByRole('switch', { name })).not.toBeNull(),
    );
    expect(screen.queryByText(/email/i)).toBeNull();
    expect(screen.queryAllByRole('switch')).toHaveLength(3);
  });

  it('keeps both bank exports locked until the payroll is approved', () => {
    renderModal({
      isApproved: false,
      options: { bankLetter: false, exportPayroll: true, exportBank: false },
    });

    expect(isDisabled('Bank transfer list')).toBe(true);
    expect(isDisabled('Bank letter')).toBe(true);
    expect(isDisabled('Payroll details')).toBe(false);
    expect(screen.queryAllByText('Needs approval')).toHaveLength(2);
  });

  it('unlocks the bank exports once approved', () => {
    renderModal({ isApproved: true });

    expect(isDisabled('Bank transfer list')).toBe(false);
    expect(isDisabled('Bank letter')).toBe(false);
    expect(screen.queryByText('Needs approval')).toBeNull();
  });

  it('does not change a locked option when its row is clicked', () => {
    const { onOptionChange } = renderModal({
      isApproved: false,
      options: { bankLetter: false, exportPayroll: true, exportBank: false },
    });

    fireEvent.click(screen.getByText('Bank transfer list'));

    expect(onOptionChange).not.toHaveBeenCalled();
  });

  it('reports the toggled option when a row is clicked', () => {
    const { onOptionChange } = renderModal();

    fireEvent.click(screen.getByText('Payroll details'));

    expect(onOptionChange).toHaveBeenCalledWith('exportPayroll', false);
  });

  it('shows who the export covers and disables Export when nothing is selected', () => {
    renderModal({
      options: { bankLetter: false, exportPayroll: false, exportBank: false },
    });

    expect(
      screen.queryByText(
        'Choose what to export for all 12 employees in this view.',
      ),
    ).not.toBeNull();
    expect(
      (screen.getByRole('button', { name: 'Export' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it('exports with the current selection', () => {
    const { onExport } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(onExport).toHaveBeenCalledTimes(1);
  });
});
