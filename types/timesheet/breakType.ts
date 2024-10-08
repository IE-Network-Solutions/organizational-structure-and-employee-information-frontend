import { DateInfo } from '@/types/timesheet/dateInfo';

export interface BreakType extends DateInfo {
  id: string;
  tenantId: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
}
