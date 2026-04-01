import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type AllowanceBenefitTab = 'allowance' | 'benefit';

export type SalaryChartView = 'salary-breakdown' | 'variable-pay';

interface DashboardPayrollState {
  payPeriodId: string | undefined;
  setPayPeriodId: (id: string | undefined) => void;
  allowanceBenefitTab: AllowanceBenefitTab;
  setAllowanceBenefitTab: (tab: AllowanceBenefitTab) => void;
  salaryChartView: SalaryChartView;
  setSalaryChartView: (view: SalaryChartView) => void;
}

export const useDashboardPayrollStore = create<DashboardPayrollState>()(
  devtools(
    (set) => ({
      payPeriodId: undefined,
      setPayPeriodId: (id) => set({ payPeriodId: id }),
      allowanceBenefitTab: 'allowance',
      setAllowanceBenefitTab: (tab) => set({ allowanceBenefitTab: tab }),
      salaryChartView: 'salary-breakdown',
      setSalaryChartView: (view) => set({ salaryChartView: view }),
    }),
    { name: 'DashboardPayrollStore' },
  ),
);
