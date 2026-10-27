import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import GeneratePayrollModal, { PayrollGenerationOptions } from './index';

const switchFields: (keyof PayrollGenerationOptions)[] = [
  'includePayroll',
  'includeIncentive',
  'includeMonthlyVariablePay',
  'includeSessionVariablePay',
];

const renderModal = (onGenerate = jest.fn()) => {
  render(<GeneratePayrollModal onClose={jest.fn()} onGenerate={onGenerate} />);
  return onGenerate;
};

describe('GeneratePayrollModal', () => {
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

  it('defaults to payroll only', async () => {
    const onGenerate = renderModal();
    const switches = screen.getAllByRole('switch');

    expect(
      switches.map((toggle) => toggle.getAttribute('aria-checked')),
    ).toEqual(['true', 'false', 'false', 'false']);

    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    await waitFor(() =>
      expect(onGenerate).toHaveBeenCalledWith({
        includePayroll: true,
        includeIncentive: false,
        includeMonthlyVariablePay: false,
        includeSessionVariablePay: false,
      }),
    );
  });

  it('does not submit when every payment type is disabled', async () => {
    const onGenerate = renderModal();
    screen.getAllByRole('switch').forEach((toggle) => {
      if (toggle.getAttribute('aria-checked') === 'true') {
        fireEvent.click(toggle);
      }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    expect(
      await screen.findByText('Select at least one payment type'),
    ).toBeInTheDocument();
    expect(onGenerate).not.toHaveBeenCalled();
  });

  it.each([
    ['monthly PP only', [false, false, true, false]],
    ['quarterly PP only', [false, false, false, true]],
    ['incentive only', [false, true, false, false]],
    ['payroll plus monthly PP', [true, false, true, false]],
    ['payroll plus quarterly PP', [true, false, false, true]],
    ['payroll plus incentive', [true, true, false, false]],
    ['PP and incentive without payroll', [false, true, true, true]],
    ['all components', [true, true, true, true]],
  ])('submits the selected flags for %s', async (label, expected) => {
    const onGenerate = renderModal();
    const switches = screen.getAllByRole('switch');

    switches.forEach((toggle, index) => {
      const isChecked = toggle.getAttribute('aria-checked') === 'true';
      if (isChecked !== expected[index]) fireEvent.click(toggle);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    const expectedFlags = Object.fromEntries(
      switchFields.map((field, index) => [field, expected[index]]),
    );
    await waitFor(() => expect(onGenerate).toHaveBeenCalledWith(expectedFlags));
  });

  it('names the options Salary, Incentive, Monthly and Quarterly performance', () => {
    renderModal();

    [
      'Salary',
      'Incentive',
      'Monthly performance',
      'Quarterly performance',
    ].forEach((label) => expect(screen.queryByText(label)).not.toBeNull());
    expect(screen.queryByText('Include Payroll')).toBeNull();
  });

  it('toggles an option when its row is clicked', () => {
    renderModal();
    const monthly = screen.getByRole('switch', { name: 'Monthly performance' });
    expect(monthly.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(screen.getByText('Monthly performance'));
    expect(monthly.getAttribute('aria-checked')).toBe('true');

    fireEvent.click(
      screen.getByText('Performance pay from the monthly scores'),
    );
    expect(monthly.getAttribute('aria-checked')).toBe('false');
  });

  it('ignores clicks on an approved row', () => {
    render(
      <GeneratePayrollModal
        onClose={jest.fn()}
        onGenerate={jest.fn()}
        lockedTypes={['PAYROLL']}
      />,
    );
    const salary = screen.getByRole('switch', { name: 'Salary' });

    fireEvent.click(screen.getByText('Salary'));

    expect(salary.getAttribute('aria-checked')).toBe('false');
    expect(screen.queryByText('Approved')).not.toBeNull();
  });

  describe('with approved generation types', () => {
    it('disables the approved type, starts without payroll and lets PP be generated', async () => {
      const onGenerate = jest.fn();
      render(
        <GeneratePayrollModal
          onClose={jest.fn()}
          onGenerate={onGenerate}
          lockedTypes={['PAYROLL']}
        />,
      );
      const switches = screen.getAllByRole('switch');

      expect((switches[0] as HTMLButtonElement).disabled).toBe(true);
      expect(switches[0].getAttribute('aria-checked')).toBe('false');
      expect((switches[2] as HTMLButtonElement).disabled).toBe(false);

      fireEvent.click(switches[2]);
      fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

      await waitFor(() =>
        expect(onGenerate).toHaveBeenCalledWith({
          includePayroll: false,
          includeIncentive: false,
          includeMonthlyVariablePay: true,
          includeSessionVariablePay: false,
        }),
      );
    });

    it('disables the PP track that is approved but not the other one', () => {
      render(
        <GeneratePayrollModal
          onClose={jest.fn()}
          onGenerate={jest.fn()}
          lockedTypes={['PP_MONTHLY']}
        />,
      );
      const switches = screen.getAllByRole('switch');

      expect((switches[2] as HTMLButtonElement).disabled).toBe(true);
      expect((switches[3] as HTMLButtonElement).disabled).toBe(false);
    });
  });
});
