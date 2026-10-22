import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PayslipAccessPanel from './index';
import { useGetPayrollApprovalsOfPayPeriod } from '@/store/server/features/payroll/payrollApproval/queries';

const mockPublish = jest.fn();
const mockUnpublish = jest.fn();
let mockPublishState: { isLoading: boolean; variables?: any } = {
  isLoading: false,
};

jest.mock('@/utils/permissionGuard', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('@/store/server/features/payroll/payrollApproval/queries', () => ({
  useGetPayrollApprovalsOfPayPeriod: jest.fn(),
}));
jest.mock('@/store/server/features/payroll/payroll/mutation', () => ({
  usePublishPayslips: () => ({ mutate: mockPublish, ...mockPublishState }),
  useUnpublishPayslips: () => ({
    mutate: mockUnpublish,
    isLoading: false,
  }),
}));

const mockApprovals = (items: any[] | undefined) =>
  (useGetPayrollApprovalsOfPayPeriod as jest.Mock).mockReturnValue({
    data: items,
  });

const renderPanel = () => {
  render(<PayslipAccessPanel payPeriodId="pp-1" periodLabel="January 2027" />);
};

const openModal = () =>
  fireEvent.click(screen.getByRole('button', { name: /Payslip access/ }));

describe('PayslipAccessPanel', () => {
  beforeEach(() => {
    mockPublish.mockClear();
    mockUnpublish.mockClear();
    mockPublishState = { isLoading: false };
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

  it('shows nothing before any generation exists', () => {
    mockApprovals([]);
    renderPanel();

    expect(screen.queryByRole('button', { name: /Payslip access/ })).toBeNull();
  });

  it('is one button that summarises how many generations are released', () => {
    mockApprovals([
      { generationType: 'PAYROLL', payslipsPublished: true },
      { generationType: 'PP_MONTHLY', payslipsPublished: false },
      { generationType: 'INCENTIVE', payslipsPublished: false },
    ]);
    renderPanel();

    expect(screen.queryAllByRole('button')).toHaveLength(1);
    expect(screen.queryByText('1/3')).not.toBeNull();
    expect(screen.queryByText('Not released')).toBeNull();
  });

  it('lists each generation in the modal, naming payroll Salary', async () => {
    mockApprovals([
      { generationType: 'PAYROLL', payslipsPublished: true },
      { generationType: 'PP_MONTHLY', payslipsPublished: false },
    ]);
    renderPanel();

    openModal();

    expect(await screen.findByText('Salary')).not.toBeNull();
    expect(screen.queryByText('PP Monthly')).not.toBeNull();
    expect(screen.queryByText('Payroll')).toBeNull();
    expect(screen.queryByText('Released')).not.toBeNull();
    expect(screen.queryByText('Not released')).not.toBeNull();
    expect(screen.queryByText('PP Quarterly')).toBeNull();
  });

  it('releases a generation only after the confirmation', async () => {
    mockApprovals([{ generationType: 'PP_MONTHLY', payslipsPublished: false }]);
    renderPanel();
    openModal();

    fireEvent.click(await screen.findByRole('button', { name: 'Release' }));
    expect(mockPublish).not.toHaveBeenCalled();
    expect(
      await screen.findByText(/Employees will see their pp monthly payslips/),
    ).not.toBeNull();

    fireEvent.click(screen.getAllByRole('button', { name: 'Release' }).pop()!);

    await waitFor(() =>
      expect(mockPublish).toHaveBeenCalledWith({
        payPeriodId: 'pp-1',
        generationType: 'PP_MONTHLY',
      }),
    );
    expect(mockUnpublish).not.toHaveBeenCalled();
  });

  it('revokes access only after the confirmation, for that generation', async () => {
    mockApprovals([
      { generationType: 'PAYROLL', payslipsPublished: true },
      { generationType: 'INCENTIVE', payslipsPublished: true },
    ]);
    renderPanel();
    openModal();

    fireEvent.click(
      (await screen.findAllByRole('button', { name: 'Revoke' }))[1],
    );
    expect(mockUnpublish).not.toHaveBeenCalled();
    expect(
      await screen.findByText(/Other payslips stay as they are/),
    ).not.toBeNull();

    fireEvent.click(
      screen.getAllByRole('button', { name: 'Revoke access' }).pop()!,
    );

    await waitFor(() =>
      expect(mockUnpublish).toHaveBeenCalledWith({
        payPeriodId: 'pp-1',
        generationType: 'INCENTIVE',
      }),
    );
  });

  it('shows the spinner only on the row that is being changed', async () => {
    mockApprovals([
      { generationType: 'PAYROLL', payslipsPublished: false },
      { generationType: 'PP_MONTHLY', payslipsPublished: false },
      { generationType: 'INCENTIVE', payslipsPublished: false },
    ]);
    mockPublishState = {
      isLoading: true,
      variables: { payPeriodId: 'pp-1', generationType: 'PP_MONTHLY' },
    };
    renderPanel();
    openModal();

    const buttons = await screen.findAllByRole('button', { name: /Release/ });
    const loading = buttons.map((b) => b.className.includes('ant-btn-loading'));

    expect(loading).toEqual([false, true, false]);
  });
});
