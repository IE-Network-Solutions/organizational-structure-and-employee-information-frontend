import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  findMockPayPeriod,
  isMockPayPeriodId,
} from '@/app/(afterLogin)/(payroll)/payroll/_components/payPeriodSelect/mockPayPeriods';

export interface GeneratedPayslipsRecord {
  payrollIds: string[];
  generatedAt: string;
}

interface PayrollPayslipState {
  generatedByPeriod: Record<string, GeneratedPayslipsRecord>;
  generatePayslips: (payPeriodId: string, payrollIds: string[]) => void;
  isGenerated: (payPeriodId: string) => boolean;
  ensureSeeded: (payPeriodId: string, payrollIds: string[]) => void;
}

export const usePayrollPayslipStore = create<PayrollPayslipState>()(
  devtools(
    (set, get) => ({
      generatedByPeriod: {},
      generatePayslips: (payPeriodId, payrollIds) => {
        if (!payPeriodId) return;
        set({
          generatedByPeriod: {
            ...get().generatedByPeriod,
            [payPeriodId]: {
              payrollIds,
              generatedAt: new Date().toISOString(),
            },
          },
        });
      },
      isGenerated: (payPeriodId) =>
        Boolean(get().generatedByPeriod[payPeriodId]),
      ensureSeeded: (payPeriodId, payrollIds) => {
        if (!payPeriodId || get().generatedByPeriod[payPeriodId]) return;
        if (!payrollIds.length || !isMockPayPeriodId(payPeriodId)) return;
        const period = findMockPayPeriod(payPeriodId);
        if (period?.status !== 'CLOSED') return;
        set({
          generatedByPeriod: {
            ...get().generatedByPeriod,
            [payPeriodId]: {
              payrollIds,
              generatedAt: period.endDate,
            },
          },
        });
      },
    }),
    { name: 'PayrollPayslipStore' },
  ),
);
