export type FiscalPeriod = {
  activeFiscalYearId: string;
  createdAt: string;
  deletedAt: string | null;
  endDate: string;
  id: string;
  monthId: string | null;
  startDate: string;
  status: 'CLOSED' | 'OPEN' | 'PENDING';
  tenantId: string;
  updatedAt: string;
};

export type FiscalYearResponseData = FiscalPeriod[];
