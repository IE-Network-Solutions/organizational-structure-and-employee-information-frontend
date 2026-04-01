export interface MonthlyVariablePayOverviewItem {
  month: number;
  monthName: string;
  totalVariablePay: number;
}

export interface MonthlyVariablePayOverviewResponse {
  year: number;
  activeFiscalYearId: string;
  items: MonthlyVariablePayOverviewItem[];
  totals: {
    totalVariablePay: number;
  };
}

export interface MonthlyOverviewItem {
  month: number;
  monthName: string;
  totalAllowance: number;
  totalBenefit: number;
  totalIncentive: number;
  grossSalary: number;
  netPay: number;
  basicSalary: number;
}

export interface MonthlyOverviewResponse {
  year: number;
  activeFiscalYearId: string;
  items: MonthlyOverviewItem[];
  totals: {
    totalAllowance: number;
    totalBenefit: number;
    totalIncentive: number;
    grossSalary: number;
    netPay: number;
  };
}

export interface PayrollByPayPeriodParams {
  limit: number;
  page: number;
  payPeriodId: string;
}

export interface DetailsOverviewItem {
  id?: string;
  name?: string;
  label?: string;
  typeName?: string;
  allowanceName?: string;
  benefitName?: string;
  amount?: number;
  totalAmount?: number;
  value?: number;
  count?: number;
  entitledEmployeeCount?: number;
}

export interface DetailsOverviewResponse {
  items?: DetailsOverviewItem[];
  total?: number;
  totalAmount?: number;
  entitledEmployeeCount?: number;
}
