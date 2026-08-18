import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  getSeedActivityLogs,
  PayrollActivityAction,
  PayrollActivityLog,
} from '@/app/(afterLogin)/(payroll)/payroll/_components/payPeriodSelect/mockPayPeriods';

interface PayrollActivityLogState {
  logsByPeriod: Record<string, PayrollActivityLog[]>;
  addLog: (
    payPeriodId: string,
    entry: {
      action: PayrollActivityAction;
      remarks: string;
      performedBy?: { firstName: string; lastName: string };
    },
  ) => void;
  getLogs: (payPeriodId: string) => PayrollActivityLog[];
}

export const usePayrollActivityLogStore = create<PayrollActivityLogState>()(
  devtools(
    (set, get) => ({
      logsByPeriod: {},
      addLog: (payPeriodId, entry) => {
        if (!payPeriodId) return;
        const existing =
          get().logsByPeriod[payPeriodId] ?? getSeedActivityLogs(payPeriodId);
        const nextLog: PayrollActivityLog = {
          id: `${payPeriodId}-log-${Date.now()}`,
          payPeriodId,
          action: entry.action,
          remarks: entry.remarks,
          performedBy: entry.performedBy || {
            firstName: 'You',
            lastName: '',
          },
          performedAt: new Date().toISOString(),
        };
        set({
          logsByPeriod: {
            ...get().logsByPeriod,
            [payPeriodId]: [nextLog, ...existing],
          },
        });
      },
      getLogs: (payPeriodId) => {
        if (!payPeriodId) return [];
        const cached = get().logsByPeriod[payPeriodId];
        if (cached) return cached;
        const seeded = getSeedActivityLogs(payPeriodId);
        set({
          logsByPeriod: {
            ...get().logsByPeriod,
            [payPeriodId]: seeded,
          },
        });
        return seeded;
      },
    }),
    { name: 'PayrollActivityLogStore' },
  ),
);
