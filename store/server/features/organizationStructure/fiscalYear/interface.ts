import { UUID } from 'crypto';
import { Dayjs } from 'dayjs';

export interface ClosedDates {
  id: UUID;
  name: string;
  type: string;
  description?: string;
  date: Dayjs | string;
}

export interface FiscalYear {
  id?: string;
  name: string;
  description: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  closedDates?: ClosedDates[];
}

export interface FiscalYearResponse {
  items: FiscalYear[];
  meta: any;
}
