export interface PaySlipData {
  payrollId: string;
  payPeriodId: string;
  employeeId: string;
}

export interface PayPeriod {
  id: string;
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'CLOSED';
  tenantId: string;
  activeFiscalYearId: string;
}
