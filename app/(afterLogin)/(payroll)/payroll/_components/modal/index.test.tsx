import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import GeneratePayrollModal, {
  PayrollGenerationOptions,
} from './index';

const switchFields: (keyof PayrollGenerationOptions)[] = [
  'includePayroll',
  'includeIncentive',
  'includeMonthlyVariablePay',
  'includeSessionVariablePay',
];

const renderModal = (onGenerate = jest.fn()) => {
  render(
    <GeneratePayrollModal onClose={jest.fn()} onGenerate={onGenerate} />,
  );
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

    expect(switches.map((toggle) => toggle.getAttribute('aria-checked'))).toEqual([
      'true',
      'false',
      'false',
      'false',
    ]);

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
  ])('submits the selected flags for %s', async (_label, expected) => {
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
});
