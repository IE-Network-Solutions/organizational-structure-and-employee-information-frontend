import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PayrollApprovalStatusBar from './index';
import { usePayrollApprovalStatus } from '@/store/server/features/payroll/payrollApproval/usePayrollApprovalStatus';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const mockRevoke = jest.fn();

jest.mock(
  '@/store/server/features/payroll/payrollApproval/usePayrollApprovalStatus',
  () => ({ usePayrollApprovalStatus: jest.fn() }),
);
jest.mock('@/store/server/features/payroll/payrollApproval/mutation', () => ({
  useRevokePayrollApproval: () => ({
    mutate: mockRevoke,
    isLoading: false,
  }),
}));
jest.mock('@/store/uistate/features/authentication', () => ({
  useAuthenticationStore: jest.fn(),
}));

const levels = [
  {
    stepOrder: 1,
    userId: 'user-1',
    displayUserId: 'user-1',
    status: 'Approved',
  },
  {
    stepOrder: 2,
    userId: 'user-2',
    displayUserId: 'user-2',
    status: 'Approved',
  },
];

const mockStatus = (isFullyApproved: boolean) =>
  (usePayrollApprovalStatus as jest.Mock).mockReturnValue({
    approvalLevels: isFullyApproved
      ? levels
      : [{ ...levels[0] }, { ...levels[1], status: 'Pending' }],
    isLoading: false,
    isFullyApproved,
    hasWorkflow: true,
    getApproverName: (id: string) => `Name ${id}`,
  });

const mockUser = (userId: string) =>
  (useAuthenticationStore as unknown as jest.Mock).mockReturnValue({ userId });

describe('PayrollApprovalStatusBar revoke', () => {
  beforeEach(() => {
    mockRevoke.mockClear();
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

  it('offers revoke to a user who approved a fully approved generation', () => {
    mockStatus(true);
    mockUser('user-2');
    render(
      <PayrollApprovalStatusBar
        payPeriodId="pp-1"
        generationType="PP_MONTHLY"
      />,
    );

    expect(screen.queryByText('Revoke approval')).not.toBeNull();
  });

  it('hides revoke from users who are not part of the approval', () => {
    mockStatus(true);
    mockUser('someone-else');
    render(<PayrollApprovalStatusBar payPeriodId="pp-1" />);

    expect(screen.queryByText('Revoke approval')).toBeNull();
  });

  it('hides revoke while the generation is still pending', () => {
    mockStatus(false);
    mockUser('user-1');
    render(<PayrollApprovalStatusBar payPeriodId="pp-1" />);

    expect(screen.queryByText('Revoke approval')).toBeNull();
  });

  it('revokes only after confirming, for that generation type', async () => {
    mockStatus(true);
    mockUser('user-1');
    render(
      <PayrollApprovalStatusBar
        payPeriodId="pp-1"
        generationType="PP_QUARTERLY"
      />,
    );

    fireEvent.click(screen.getByText('Revoke approval'));
    expect(mockRevoke).not.toHaveBeenCalled();

    fireEvent.click(await screen.findByRole('button', { name: 'Revoke' }));

    await waitFor(() =>
      expect(mockRevoke).toHaveBeenCalledWith({
        payPeriodId: 'pp-1',
        generationType: 'PP_QUARTERLY',
      }),
    );
  });
});
