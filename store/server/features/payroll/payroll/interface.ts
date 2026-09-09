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
  payslipsPublished?: boolean;
  payslipsPublishedAt?: string | null;
  payslipsPublishedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedAt?: string | null;
}
