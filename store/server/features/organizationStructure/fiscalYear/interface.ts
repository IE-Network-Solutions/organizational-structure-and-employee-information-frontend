import { Dayjs } from 'dayjs';

export interface FiscalYear {
  name: string;
  description: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

export interface FiscalYearResponse {
  items: FiscalYear[];
  meta: any;
}
